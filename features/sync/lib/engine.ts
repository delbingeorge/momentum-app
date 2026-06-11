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
  fetchBodyweight,
  fetchHistory,
  fetchProfile,
  fetchSessions,
  pushBodyweight,
  pushHistory,
  pushProfile,
  pushSessions,
} from "../api/sync-api";
import { useSyncStore } from "@/shared/stores";
import { mergeHistory, mergeSessionDates, mergeSessions, mergeWeights } from "./merge";

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

// Pull everything and merge into local stores (local stays source of truth)
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
    if (profile.is_paid) useAuthStore.getState().setPaid(true);
  }
};

export const pushDirty = async (force = false): Promise<void> => {
  const { user } = useAuthStore.getState();
  if (!user) return;
  const { dirty } = useSyncStore.getState();
  const all = force || Object.values(dirty).every((flag) => !flag);

  const workout = useWorkoutStore.getState();
  const tasks: Promise<void>[] = [];
  if (all || dirty.sessions)
    tasks.push(pushSessions(workout.pastSessions, user.id));
  if (all || dirty.history) tasks.push(pushHistory(workout.history, user.id));
  if (all || dirty.bodyweight)
    tasks.push(pushBodyweight(useBodyStore.getState().weights, user.id));
  if (all || dirty.profile)
    tasks.push(pushProfile(buildProfilePayload(), user.id));
  await Promise.all(tasks);
};

// Full cycle: pull-merge, push everything, stamp the sync point
export const syncNow = async (): Promise<void> => {
  if (!canSync()) return;
  const sync = useSyncStore.getState();
  if (sync.status === "syncing") return;
  sync.setStatus("syncing");
  try {
    await pullAll();
    await pushDirty(true);
    useSyncStore.getState().clearDirty();
    useSyncStore.getState().setLastSyncedAt(Date.now());
    useSyncStore.getState().setStatus("idle");
  } catch (error) {
    console.error("sync failed:", error);
    useSyncStore.getState().setStatus("error");
  }
};
