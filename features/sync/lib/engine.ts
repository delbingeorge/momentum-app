import {
  capSessionsToCloudWindow,
  capWeightsToCloudWindow,
} from "@/shared/lib/entitlements";
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
import {
  datesFromSessions,
  historyFromRows,
  sessionsFromRows,
  weightsFromRows,
} from "./apply-cloud";
import { runExclusive } from "./sync-lock";

type DirtyMap = Record<SyncEntity, boolean>;

// Every signed-in user syncs now, paid or free. Entitlement no longer gates
// access to the cloud — it only caps how much a free user backs up (see the
// window filter in pushClaimed).
export const canSync = (): boolean => {
  const { user } = useAuthStore.getState();
  return isCloudConfigured && user !== null;
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

// Guards the pull's own store writes: the use-sync-engine subscribers can't
// tell a cloud apply from a user edit, so without this every pull would
// re-mark its entities dirty and trigger a pointless echo push.
let applyingCloud = false;
export const isApplyingCloud = (): boolean => applyingCloud;

const applyCloudState = (apply: () => void): void => {
  applyingCloud = true;
  try {
    apply();
  } finally {
    applyingCloud = false;
  }
};

// Pull everything and REPLACE the local caches — the cloud is the source of
// truth; on-device stores are a rebuildable write-through cache. syncNow pushes
// before calling this, so anything worth keeping is already upstream. An
// entity is skipped only when it has unpushed changes (its dirty flag was
// re-set by a write landing mid-sync); it converges on the next cycle.
// These reads feed the engine, not React render, so they stay imperative
// rather than moving to TanStack Query.
const pullAll = async (): Promise<void> => {
  const lastSyncedAt = useSyncStore.getState().lastSyncedAt ?? 0;
  const [profile, sessions, history, weights] = await Promise.all([
    fetchProfile(),
    fetchSessions(),
    fetchHistory(),
    fetchBodyweight(),
  ]);

  const { dirty } = useSyncStore.getState();
  const workout = useWorkoutStore.getState();
  const nextSessions = dirty.sessions
    ? workout.pastSessions
    : sessionsFromRows(sessions);
  applyCloudState(() => {
    workout.applyCloud({
      history: dirty.history ? workout.history : historyFromRows(history),
      pastSessions: nextSessions,
      sessionDates: dirty.sessions
        ? workout.sessionDates
        : datesFromSessions(nextSessions),
    });

    if (!dirty.bodyweight) {
      useBodyStore.getState().setWeights(weightsFromRows(weights));
    }
  });

  // entitlement is reconciled from RevenueCat, never from the profile mirror;
  // the profile updated_at gate now only fires when profile content changed
  if (profile && !dirty.profile && Date.parse(profile.updated_at) > lastSyncedAt) {
    const plan = usePlanStore.getState();
    const goal = goalSchema.safeParse(profile.goal);
    const level = levelSchema.safeParse(profile.level);
    const gender = genderSchema.safeParse(profile.gender);
    applyCloudState(() => {
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
    });
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
  const { user, isPaid } = useAuthStore.getState();
  if (!user) return;
  const all = opts.all ?? false;

  // Free users back up only the recent window; paid users back up everything.
  // The server-side prune (schema.sql) is the authoritative backstop — this
  // client filter just avoids uploading rows that would be trimmed anyway.
  const workout = useWorkoutStore.getState();
  const sessions = isPaid
    ? workout.pastSessions
    : capSessionsToCloudWindow(workout.pastSessions);
  const weights = isPaid
    ? useBodyStore.getState().weights
    : capWeightsToCloudWindow(useBodyStore.getState().weights);

  const tasks: Promise<void>[] = [];
  if (all || claimed.sessions) tasks.push(pushSessions(sessions, user.id));
  if (all || claimed.history) tasks.push(pushHistory(workout.history, user.id));
  if (all || claimed.bodyweight) tasks.push(pushBodyweight(weights, user.id));
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

// Full cycle: push everything, then pull and replace the local caches. Push
// MUST come first — once local changes are upstream, the replace can't drop
// anything (and if the push fails we bail before the pull, so unpushed local
// data is never clobbered). Serialized with every other write path through the
// shared lock.
export const syncNow = (): Promise<void> =>
  runExclusive(async () => {
    if (!canSync()) return;
    useSyncStore.getState().setStatus("syncing");
    // claim up front; a write landing mid-sync re-sets its own flag, which also
    // makes pullAll skip replacing that entity this cycle
    const claimed = useSyncStore.getState().claimDirty();
    try {
      await pushClaimed(claimed, { all: true });
      await pullAll();
      useSyncStore.getState().setLastSyncedAt(Date.now());
      useSyncStore.getState().setStatus("idle");
    } catch (error) {
      reportSyncFailure(claimed, error);
    }
  });
