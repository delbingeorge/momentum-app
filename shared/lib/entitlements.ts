import { isoDate } from "@/shared/lib/dates";
import { useAuthStore } from "@/shared/stores";
import type { SessionRecord } from "@/shared/types";

// Free tier sees a limited look-back window, and data past it is pruned on
// launch (see retention.ts). Paid unlock widens the view to all-time and stops
// the pruning.
export const FREE_HISTORY_WEEKS = 8;
export const FREE_PR_DAYS = 30;

export const PAID_HISTORY_WEEKS = 18;

export const useIsPaid = (): boolean => useAuthStore((state) => state.isPaid);

export const freeHistoryCutoffTs = (): number =>
  Date.now() - FREE_HISTORY_WEEKS * 7 * 86400000;

export const freePrCutoffTs = (): number =>
  Date.now() - FREE_PR_DAYS * 86400000;

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
