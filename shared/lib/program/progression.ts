import { isoDate } from "@/shared/lib/dates";
import { round5 } from "@/shared/lib/units";
import type {
  ExerciseHistory,
  ExerciseInstance,
  Goal,
  Level,
  ProgressionSuggestion,
  ScheduledDay,
  SessionRecord,
  SessionSet,
  WorkoutLog,
} from "@/shared/types";

import { defaultKgFor, isCompound, isDumbbell } from "./exercises";

// Warmups don't count toward progression or working volume
export const isWorkingSet = (set: { type?: SessionSet["type"] }): boolean =>
  (set.type ?? "normal") !== "warmup";

// Beginners can add load faster (linear progression); advanced lifters slower.
const LEVEL_INCREMENT_FACTOR: Record<Level, number> = {
  beginner: 1.5,
  intermediate: 1,
  advanced: 0.5,
};

// kg to add when last session cleared the top of its rep range, by goal & level
export const progressIncrement = (
  name: string,
  goal: Goal,
  level: Level,
): number => {
  const base = isCompound(name) ? 2.5 : 1.25;
  const goalFactor = goal === "fatloss" ? 0.5 : 1;
  return base * goalFactor * LEVEL_INCREMENT_FACTOR[level];
};

// Suggest next-session load. Bumps weight when last working sets cleared the
// top of the rep range; drops to ~60% on a deload week.
export const progressionFor = (
  name: string,
  lastSets: SessionSet[] | undefined,
  goal: Goal,
  level: Level,
  deload: boolean,
  target?: string,
): ProgressionSuggestion => {
  const range = target ?? "8–12";
  const topMatch = range.match(/(\d+)\s*$/);
  const botMatch = range.match(/^(\d+)/);
  const topReps = topMatch?.[1] ? parseInt(topMatch[1], 10) : 12;
  const botReps = botMatch?.[1] ? parseInt(botMatch[1], 10) : 8;
  const work = (lastSets ?? []).filter(isWorkingSet);
  const baseKg = work.length
    ? Math.max(...work.map((set) => set.kg))
    : defaultKgFor(name, level);
  if (deload) {
    return {
      kg: round5(baseKg * 0.6),
      reps: Math.round((topReps + botReps) / 2),
      note: "deload",
    };
  }
  const cleared = work.length > 0 && work.every((set) => set.reps >= topReps);
  if (cleared) {
    return {
      kg: round5(baseKg + progressIncrement(name, goal, level)),
      reps: botReps,
      note: "overload",
    };
  }
  return { kg: baseKg, reps: work[0]?.reps ?? botReps, note: null };
};

// Pre-fill each exercise's sets from goal-driven progression (or a deload)
export const initLog = (
  day: ScheduledDay,
  history: ExerciseHistory,
  opts: { goal: Goal; level: Level; deload: boolean },
): WorkoutLog => {
  const log: WorkoutLog = {};
  day.exercises
    .filter((exercise) => !exercise.off)
    .forEach((exercise) => {
      const suggestion = progressionFor(
        exercise.name,
        history[exercise.name],
        opts.goal,
        opts.level,
        opts.deload,
        exercise.target,
      );
      const setCount = opts.deload
        ? Math.max(2, exercise.sets - 1)
        : exercise.sets;
      log[exercise.id] = Array.from({ length: setCount }).map(() => ({
        kg: suggestion.kg,
        reps: suggestion.reps,
        done: false,
        type: "normal",
      }));
    });
  return log;
};

export const buildSession = (
  exList: ExerciseInstance[],
  log: WorkoutLog,
  elapsedSec: number,
  day: Pick<ScheduledDay, "key" | "name">,
): SessionRecord => {
  const exercises = exList
    .map((exercise) => ({
      name: exercise.name,
      muscle: exercise.muscle,
      sets: (log[exercise.id] ?? [])
        .filter((set) => set.done)
        .map((set) => ({ kg: set.kg, reps: set.reps, type: set.type })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
  // Dumbbell loads are stored per hand, so their volume counts both hands.
  const volume = exercises.reduce((total, exercise) => {
    const hands = isDumbbell(exercise.name) ? 2 : 1;
    return (
      total +
      exercise.sets
        .filter(isWorkingSet)
        .reduce((sum, set) => sum + set.kg * set.reps * hands, 0)
    );
  }, 0);
  const totalSets = exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(isWorkingSet).length,
    0,
  );
  const now = new Date();
  return {
    id: `s${now.getTime()}`,
    date: isoDate(now),
    ts: now.getTime(),
    dayKey: day.key,
    dayName: day.name,
    durationSec: elapsedSec,
    volume: Math.round(volume),
    totalSets,
    exercises,
  };
};
