import { addDays, isoDate, startOfWeek } from "@/shared/lib/dates";

// Week-based streak: consecutive weeks with at least one session, counting
// back from this week (or last week if this one has no session yet).
export const weekStreak = (sessionDates: string[]): number => {
  if (!sessionDates.length) return 0;
  const weeks = new Set(
    sessionDates.map((date) => isoDate(startOfWeek(new Date(date)))),
  );
  const countFrom = (start: Date): number => {
    let streak = 0;
    let cursor = start;
    while (weeks.has(isoDate(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -7);
    }
    return streak;
  };
  const thisWeek = startOfWeek(new Date());
  const current = countFrom(thisWeek);
  return current > 0 ? current : countFrom(addDays(thisWeek, -7));
};
