import { useAuthStore, useWorkoutStore } from "@/shared/stores";
import type { SessionRecord } from "@/shared/types";

// Free tier runs in 8-week cycles. When the cycle completes, the whole workout
// log is wiped and a fresh cycle begins. Warn on the final day. Paid unlock
// keeps everything and stops the wipe.
export const RETENTION_WEEKS = 8;
export const RETENTION_WARN_DAYS = 1;

const DAY_MS = 86400000;
const CYCLE_MS = RETENTION_WEEKS * 7 * DAY_MS;

const oldestSessionTs = (sessions: SessionRecord[]): number | null =>
  sessions.length ? Math.min(...sessions.map((session) => session.ts)) : null;

// When the current cycle completes and the workout log is wiped, or null when
// nothing has been logged yet (no cycle running).
export const cycleWipeTs = (sessions: SessionRecord[]): number | null => {
  const oldest = oldestSessionTs(sessions);
  return oldest === null ? null : oldest + CYCLE_MS;
};

// Whole days until the wipe relative to `now`. Negative means overdue.
export const daysUntilWipe = (
  sessions: SessionRecord[],
  now: number,
): number | null => {
  const wipeAt = cycleWipeTs(sessions);
  return wipeAt === null ? null : Math.ceil((wipeAt - now) / DAY_MS);
};

// Clear the workout log now and begin a fresh 8-week cycle. Exercise preferences
// are preserved: the plan/split, settings, bodyweight, and the per-exercise
// prefill memory (history) are all untouched. Only logged sessions and their
// calendar dates are removed.
export const startNewCycle = (): void => {
  const workout = useWorkoutStore.getState();
  workout.applyCloud({
    history: workout.history,
    pastSessions: [],
    sessionDates: [],
  });
};

// DESTRUCTIVE: wipe the free-tier workout log once the cycle completes. No-op
// for paid users. For a signed-in paid account the cloud copy is the backstop,
// so a later sign-in re-merges anything removed here. Returns true if it wiped.
export const wipeExpiredWorkoutLog = (now = Date.now()): boolean => {
  if (useAuthStore.getState().isPaid) return false;

  const wipeAt = cycleWipeTs(useWorkoutStore.getState().pastSessions);
  if (wipeAt === null || now < wipeAt) return false;

  startNewCycle();
  return true;
};
