import { isWorkingSet } from "@/shared/lib/program";
import type { SessionRecord } from "@/shared/types";

export interface TrainingStats {
  total: number;
  thisWeek: number;
}

export const trainingStats = (pastSessions: SessionRecord[]): TrainingStats => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - now.getDay());
  const thisWeek = pastSessions.filter(
    (s) => s.ts >= weekStart.getTime(),
  ).length;
  return { total: pastSessions.length, thisWeek };
};

export interface PersonalRecord {
  name: string;
  kg?: number;
  reps?: number;
  delta: number;
  ts: number;
}

// Walk history oldest→newest; emit a PR each time an exercise beats its prior best
export const recentPRs = (
  pastSessions: SessionRecord[],
  max = 4,
): PersonalRecord[] => {
  const sorted = [...pastSessions].sort((a, b) => a.ts - b.ts);
  const best: Record<string, number> = {};
  const prs: PersonalRecord[] = [];
  sorted.forEach((session) =>
    session.exercises.forEach((exercise) => {
      const work = exercise.sets.filter(isWorkingSet);
      if (!work.length) return;
      const maxKg = Math.max(...work.map((set) => set.kg));
      if (maxKg > 0) {
        const prev = best[exercise.name];
        if (prev === undefined || maxKg > prev) {
          if (prev !== undefined) {
            prs.push({
              name: exercise.name,
              kg: maxKg,
              delta: maxKg - prev,
              ts: session.ts,
            });
          }
          best[exercise.name] = maxKg;
        }
      } else {
        const maxReps = Math.max(...work.map((set) => set.reps));
        const key = `r:${exercise.name}`;
        const prev = best[key];
        if (prev === undefined || maxReps > prev) {
          if (prev !== undefined) {
            prs.push({
              name: exercise.name,
              reps: maxReps,
              delta: maxReps - prev,
              ts: session.ts,
            });
          }
          best[key] = maxReps;
        }
      }
    }),
  );
  return prs.sort((a, b) => b.ts - a.ts).slice(0, max);
};
