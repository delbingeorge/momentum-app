import { isoDate } from "@/shared/lib/dates";
import type {
  BodyweightEntry,
  ExerciseHistory,
  Goal,
  ScheduledDay,
  SessionRecord,
} from "@/shared/types";

import { defaultKgFor, isCompound } from "./exercises";

// Seed a believable "last session" for every exercise so the progression
// reference is visible from day one. Keyed by exercise NAME.
export const seedHistory = (schedule: ScheduledDay[]): ExerciseHistory => {
  const history: ExerciseHistory = {};
  schedule.forEach((day) =>
    day.exercises.forEach((exercise) => {
      if (history[exercise.name]) return;
      const kg = defaultKgFor(exercise.name);
      const reps = parseInt(exercise.target, 10) || 10;
      history[exercise.name] = Array.from({ length: exercise.sets }).map(
        () => ({
          kg,
          reps,
          type: "normal",
        }),
      );
    }),
  );
  return history;
};

// Seed a few past sessions so the history list is populated on day one
export const seedPastSessions = (schedule: ScheduledDay[]): SessionRecord[] => {
  const out: SessionRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  [2, 4, 6, 9, 11, 13].forEach((offset, index) => {
    const day = schedule[index % schedule.length];
    if (!day) return;
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const exercises = day.exercises
      .filter((exercise) => !exercise.off)
      .map((exercise) => {
        const baseKg = Math.max(
          0,
          defaultKgFor(exercise.name) -
            Math.round(offset / 4) * (isCompound(exercise.name) ? 2.5 : 1.25),
        );
        const reps = parseInt(exercise.target, 10) || 10;
        return {
          name: exercise.name,
          muscle: exercise.muscle,
          sets: Array.from({ length: exercise.sets }).map(() => ({
            kg: baseKg,
            reps,
            type: "normal" as const,
          })),
        };
      });
    const volume = exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.reduce((sum, set) => sum + set.kg * set.reps, 0),
      0,
    );
    const totalSets = exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
    out.push({
      id: `seed${offset}`,
      date: isoDate(date),
      ts: date.getTime(),
      dayKey: day.key,
      dayName: day.name,
      durationSec: 60 * (48 + (offset % 18)),
      volume: Math.round(volume),
      totalSets,
      exercises,
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
};

// Seed 8 weekly bodyweight points trending toward the goal
export const seedWeights = (goal: Goal): BodyweightEntry[] => {
  const weeklyDelta = goal === "fatloss" ? -0.6 : goal === "muscle" ? 0.4 : 0.1;
  const base = goal === "fatloss" ? 82 : goal === "muscle" ? 72 : 77;
  const out: BodyweightEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const noise = (((i * 37) % 5) - 2) * 0.15;
    const kg = Math.round((base + weeklyDelta * (7 - i) + noise) * 10) / 10;
    out.push({ date: isoDate(date), kg });
  }
  return out;
};
