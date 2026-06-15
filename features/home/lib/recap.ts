import type { SessionRecord } from "@/shared/types";

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

// Summary of the most recent session for the home recap card/sheet
export const analyzeRecap = (pastSessions: SessionRecord[]): Recap | null => {
  const last = pastSessions[0];
  return last ? { last } : null;
};
