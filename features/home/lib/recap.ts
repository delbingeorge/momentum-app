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

interface Recap {
  last: SessionRecord;
  // The instance of this day before `last`, when one exists — used for the
  // "vs. last time" trend. Null on the first-ever time this day is trained.
  prev: SessionRecord | null;
}

// The last time TODAY's day was trained — a like-for-like target to beat, since
// the exercises match. pastSessions is newest-first, so the first match is the
// most recent instance and the second is the one before it. Returns null when
// this day has no history yet, which hides the recap card.
export const analyzeRecap = (
  pastSessions: SessionRecord[],
  dayKey: DayKey,
): Recap | null => {
  const matches = pastSessions.filter((session) => session.dayKey === dayKey);
  const last = matches[0];
  return last ? { last, prev: matches[1] ?? null } : null;
};
