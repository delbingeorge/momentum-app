import { addDays, isoDate, startOfWeek } from "@/shared/lib/dates";
import { weekStreak } from "@/shared/lib/streaks";

const MAX_WEEKS = 26;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface StreakWeek {
  weekStart: string;
  sessionCount: number;
  isCurrentWeek: boolean;
  inCurrentStreak: boolean;
}

export interface StreakJourney {
  weeks: StreakWeek[];
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
  hiddenWeeks: number;
}

const countSessionsPerWeek = (sessionDates: string[]): Map<string, number> => {
  const counts = new Map<string, number>();
  sessionDates.forEach((date) => {
    const key = isoDate(startOfWeek(new Date(date)));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
};

const computeBestStreak = (
  counts: Map<string, number>,
  spanWeeks: number,
  thisWeek: Date,
): number => {
  let best = 0;
  let run = 0;
  for (let i = spanWeeks - 1; i >= 0; i--) {
    const active = counts.has(isoDate(addDays(thisWeek, -7 * i)));
    run = active ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
};

export const buildStreakJourney = (sessionDates: string[]): StreakJourney => {
  const counts = countSessionsPerWeek(sessionDates);
  const thisWeek = startOfWeek(new Date());

  const earliest = [...counts.keys()].sort()[0];
  const spanWeeks = earliest
    ? Math.round(
        (thisWeek.getTime() - startOfWeek(new Date(earliest)).getTime()) /
          WEEK_MS,
      ) + 1
    : 1;
  const shownWeeks = Math.min(spanWeeks, MAX_WEEKS);

  const currentStreak = weekStreak(sessionDates);
  // Streak anchors on this week if it has a session, otherwise last week
  const anchorIndex = counts.has(isoDate(thisWeek)) ? 0 : 1;

  const weeks: StreakWeek[] = [];
  for (let i = 0; i < shownWeeks; i++) {
    const key = isoDate(addDays(thisWeek, -7 * i));
    weeks.push({
      weekStart: key,
      sessionCount: counts.get(key) ?? 0,
      isCurrentWeek: i === 0,
      inCurrentStreak:
        currentStreak > 0 &&
        i >= anchorIndex &&
        i < anchorIndex + currentStreak,
    });
  }

  return {
    weeks,
    currentStreak,
    bestStreak: computeBestStreak(counts, spanWeeks, thisWeek),
    totalSessions: sessionDates.length,
    hiddenWeeks: spanWeeks - shownWeeks,
  };
};
