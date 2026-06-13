import { isCloudConfigured } from "@/shared/lib/env";
import {
  useAuthStore,
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";
import { genderSchema, goalSchema, levelSchema, unitSchema } from "@/shared/types/schemas";

import {
  clearCloudData,
  fetchBodyweight,
  fetchHistory,
  fetchProfile,
  fetchSessions,
  pushBodyweight,
  pushHistory,
  pushProfile,
  pushSessions,
} from "../api/sync-api";
import { type SyncEntity, toast, useSyncStore } from "@/shared/stores";
import { mergeHistory, mergeSessionDates, mergeSessions, mergeWeights } from "./merge";
import { runExclusive } from "./sync-lock";

type DirtyMap = Record<SyncEntity, boolean>;

const CLEAN: DirtyMap = {
  profile: false,
  sessions: false,
  history: false,
  bodyweight: false,
};

export const canSync = (): boolean => {
  const { user, isPaid } = useAuthStore.getState();
  return isCloudConfigured && isPaid && user !== null;
};

const buildProfilePayload = (): Record<string, unknown> => {
  const plan = usePlanStore.getState();
  const settings = useSettingsStore.getState();
  const workout = useWorkoutStore.getState();
  const { isPaid } = useAuthStore.getState();
  return {
    goal: plan.goal,
    level: plan.level,
    gender: plan.gender,
    weight_kg: plan.weightKg,
    days: plan.days,
    split_id: plan.splitId,
    unit: settings.unit,
    rest_sec: settings.restSec,
    schedule: plan.schedule,
    since_deload: workout.sinceDeload,
    is_paid: isPaid,
  };
};

// Stable string for the profile payload. Keys are fixed-shape and insertion
// ordered, so JSON.stringify is deterministic here and serves as the hash.
const hashProfile = (payload: Record<string, unknown>): string =>
  JSON.stringify(payload);

// Pull everything and merge into local stores (local stays source of truth).
// These reads feed the merge engine, not React render, so they stay imperative
// rather than moving to TanStack Query.
export const pullAll = async (): Promise<void> => {
  const lastSyncedAt = useSyncStore.getState().lastSyncedAt ?? 0;
  const [profile, sessions, history, weights] = await Promise.all([
    fetchProfile(),
    fetchSessions(),
    fetchHistory(),
    fetchBodyweight(),
  ]);

  const workout = useWorkoutStore.getState();
  const mergedSessions = mergeSessions(workout.pastSessions, sessions);
  workout.applyCloud({
    history: mergeHistory(workout.history, history, lastSyncedAt),
    pastSessions: mergedSessions,
    sessionDates: mergeSessionDates(workout.sessionDates, mergedSessions),
  });

  useBodyStore
    .getState()
    .setWeights(mergeWeights(useBodyStore.getState().weights, weights, lastSyncedAt));

  // entitlement is reconciled from RevenueCat, never from the profile mirror;
  // the profile updated_at gate now only fires when profile content changed
  if (profile && Date.parse(profile.updated_at) > lastSyncedAt) {
    const plan = usePlanStore.getState();
    const goal = goalSchema.safeParse(profile.goal);
    const level = levelSchema.safeParse(profile.level);
    const gender = genderSchema.safeParse(profile.gender);
    plan.applyCloud({
      goal: goal.success ? goal.data : plan.goal,
      level: level.success ? level.data : plan.level,
      gender: gender.success ? gender.data : plan.gender,
      weightKg: profile.weight_kg ?? plan.weightKg,
      days: profile.days ?? plan.days,
      splitId: profile.split_id ?? plan.splitId,
      schedule: profile.schedule ?? plan.schedule,
    });
    const settings = useSettingsStore.getState();
    const unit = unitSchema.safeParse(profile.unit);
    if (unit.success) settings.setUnit(unit.data);
    if (profile.rest_sec !== null) settings.setRestSec(profile.rest_sec);
  }
};

// Push the profile, only bumping updated_at when its content actually changed,
// so a session-only push on one device can't clobber another device's plan.
const pushProfileIfChanged = async (userId: string): Promise<void> => {
  const payload = buildProfilePayload();
  const hash = hashProfile(payload);
  const changed = hash !== useSyncStore.getState().lastProfileHash;
  await pushProfile(payload, userId, changed ? new Date().toISOString() : null);
  if (changed) useSyncStore.getState().setProfileHash(hash);
};

// Push the entities named in `claimed` (or everything when opts.all is set, used
// by the first full sync). Operates on the passed snapshot, never re-reads the
// dirty flags, so writes arriving mid-push survive in the store.
const pushClaimed = async (
  claimed: DirtyMap,
  opts: { all?: boolean } = {},
): Promise<void> => {
  const { user } = useAuthStore.getState();
  if (!user) return;
  const all = opts.all ?? false;

  const workout = useWorkoutStore.getState();
  const tasks: Promise<void>[] = [];
  if (all || claimed.sessions) tasks.push(pushSessions(workout.pastSessions, user.id));
  if (all || claimed.history) tasks.push(pushHistory(workout.history, user.id));
  if (all || claimed.bodyweight)
    tasks.push(pushBodyweight(useBodyStore.getState().weights, user.id));
  if (all || claimed.profile) tasks.push(pushProfileIfChanged(user.id));
  await Promise.all(tasks);
};

const isClean = (dirty: DirtyMap): boolean =>
  Object.values(dirty).every((flag) => !flag);

const reportSyncFailure = (claimed: DirtyMap, error: unknown): void => {
  useSyncStore.getState().restoreDirty(claimed);
  console.error("sync failed:", error);
  useSyncStore.getState().setStatus("error");
  toast.error("Sync failed. Your changes are saved on this device.");
};

// "Start over" for a paid user: erase logged cloud data and overwrite the
// profile with the (already cleared) local plan, keeping entitlement. Call
// AFTER clearLocalData so the profile write mirrors the wiped state.
export const wipeCloudData = (): Promise<void> =>
  runExclusive(async () => {
    const { user } = useAuthStore.getState();
    if (!canSync() || !user) return;
    try {
      await clearCloudData(user.id);
      await pushProfile(buildProfilePayload(), user.id, new Date().toISOString());
      useSyncStore.getState().setProfileHash(hashProfile(buildProfilePayload()));
      useSyncStore.getState().clearDirty();
      useSyncStore.getState().setLastSyncedAt(Date.now());
    } catch (error) {
      console.error("cloud wipe failed:", error);
      useSyncStore.getState().setStatus("error");
    }
  });

// Debounced push of pending local changes. Claims the dirty flags up front so a
// write landing mid-push isn't lost, and restores them if the push fails.
export const pushNow = (): Promise<void> =>
  runExclusive(async () => {
    if (!canSync()) return;
    const claimed = useSyncStore.getState().claimDirty();
    if (isClean(claimed)) return;
    useSyncStore.getState().setStatus("syncing");
    try {
      await pushClaimed(claimed);
      useSyncStore.getState().setLastSyncedAt(Date.now());
      useSyncStore.getState().setStatus("idle");
    } catch (error) {
      reportSyncFailure(claimed, error);
    }
  });

// Full cycle: pull-merge, push everything, stamp the sync point. Serialized with
// every other write path through the shared lock.
export const syncNow = (): Promise<void> =>
  runExclusive(async () => {
    if (!canSync()) return;
    useSyncStore.getState().setStatus("syncing");
    // claim after the pull so cloud-merge writes are absorbed (matching the old
    // clear-after-push behavior); restored on failure so nothing is dropped
    let claimed: DirtyMap = { ...CLEAN };
    try {
      await pullAll();
      claimed = useSyncStore.getState().claimDirty();
      await pushClaimed(claimed, { all: true });
      useSyncStore.getState().setLastSyncedAt(Date.now());
      useSyncStore.getState().setStatus("idle");
    } catch (error) {
      reportSyncFailure(claimed, error);
    }
  });
