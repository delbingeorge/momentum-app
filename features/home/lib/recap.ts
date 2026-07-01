import type { DayKey, SessionRecord } from "@/shared/types";

export const relDate = (ts: number): string => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export interface Recap {
  last: SessionRecord;
}

// The last time TODAY's day was trained — a like-for-like target to beat, since
// the exercises match. pastSessions is newest-first, so the first hit is the
// most recent instance. Returns null when this day has no history yet, which
// hides the recap card.
export const analyzeRecap = (
  pastSessions: SessionRecord[],
  dayKey: DayKey,
): Recap | null => {
  const last = pastSessions.find((session) => session.dayKey === dayKey);
  return last ? { last } : null;
};
