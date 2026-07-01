import { isoDate } from "@/shared/lib/dates";
import { useAuthStore } from "@/shared/stores";
import type { BodyweightEntry, SessionRecord } from "@/shared/types";

// Free tier sees a limited look-back window in-app, and its cloud backup is
// capped to the same window (older rows are dropped, see engine.ts push filter
// + the server-side prune in schema.sql). Paid unlock widens the view to
// all-time and keeps everything in the cloud forever.
export const FREE_HISTORY_WEEKS = 8;
export const FREE_PR_DAYS = 30;

// Cloud backup retention for free users. Reuses the history window so "free =
// last 8 weeks" is one coherent story across the view and the backup.
export const FREE_CLOUD_WEEKS = FREE_HISTORY_WEEKS;

export const PAID_HISTORY_WEEKS = 18;

export const useIsPaid = (): boolean => useAuthStore((state) => state.isPaid);

export const freeHistoryCutoffTs = (): number =>
  Date.now() - FREE_HISTORY_WEEKS * 7 * 86400000;

export const freePrCutoffTs = (): number =>
  Date.now() - FREE_PR_DAYS * 86400000;

export const freeCloudCutoffTs = (): number =>
  Date.now() - FREE_CLOUD_WEEKS * 7 * 86400000;

const cutoffDate = (cutoffTs: number): string => isoDate(new Date(cutoffTs));

export const filterSessionsToFreeWindow = (
  sessions: SessionRecord[],
): SessionRecord[] => {
  const cutoff = freeHistoryCutoffTs();
  return sessions.filter((session) => session.ts >= cutoff);
};

export const filterDatesToFreeWindow = (dates: string[]): string[] => {
  const cutoff = cutoffDate(freeHistoryCutoffTs());
  return dates.filter((date) => date >= cutoff);
};

// Cloud-backup cap for a free user's logged sessions/weights: only rows within
// the retention window are uploaded, matching the server-side prune.
export const capSessionsToCloudWindow = (
  sessions: SessionRecord[],
): SessionRecord[] => {
  const cutoff = freeCloudCutoffTs();
  return sessions.filter((session) => session.ts >= cutoff);
};

export const capWeightsToCloudWindow = (
  weights: BodyweightEntry[],
): BodyweightEntry[] => {
  const cutoff = cutoffDate(freeCloudCutoffTs());
  return weights.filter((entry) => entry.date >= cutoff);
};
