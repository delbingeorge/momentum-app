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

import {
  bodyweightLoad,
  defaultKgFor,
  isBodyweight,
  isCompound,
  isDumbbell,
  isTimed,
  isUnilateral,
} from "./exercises";

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
const progressIncrement = (
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
  // Pull the bounds out of any target string — "12–15", "30–45s" (timed),
  // "10 ea" (per side), or a single number all resolve correctly.
  const nums = (range.match(/\d+/g) ?? []).map((n) => parseInt(n, 10));
  const botReps = nums[0] ?? 8;
  const topReps = nums[1] ?? nums[0] ?? 12;
  const work = (lastSets ?? []).filter(isWorkingSet);
  const bodyweight = isBodyweight(name);
  const baseKg = work.length
    ? Math.max(...work.map((set) => set.kg))
    : defaultKgFor(name, level);
  if (deload) {
    return {
      kg: bodyweight ? 0 : round5(baseKg * 0.6),
      reps: Math.round((topReps + botReps) / 2),
      note: "deload",
    };
  }
  const cleared = work.length > 0 && work.every((set) => set.reps >= topReps);
  if (cleared) {
    // Bodyweight work has no load to add, so it overloads by reps — or by a
    // few seconds for timed holds — instead of weight.
    if (bodyweight) {
      return {
        kg: 0,
        reps: topReps + (isTimed(name) ? 5 : 1),
        note: "overload",
      };
    }
    return {
      kg: round5(baseKg + progressIncrement(name, goal, level)),
      reps: botReps,
      note: "overload",
    };
  }
  return {
    kg: bodyweight ? 0 : baseKg,
    reps: work[0]?.reps ?? botReps,
    note: null,
  };
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
  bodyweightKg = 0,
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
  // A logged set is counted for both sides when the lift loads both at once
  // (two dumbbells, stored per hand) OR is unilateral (done one side at a time
  // and repeated) — either way ×2, never compounded past it. Bodyweight
  // movements credit a share of bodyweight per rep (plus any added load), and
  // that credit doubles for unilateral work too. See bodyweightLoad.
  const volume = exercises.reduce((total, exercise) => {
    const bothSides =
      isDumbbell(exercise.name) || isUnilateral(exercise.name);
    const mult = bothSides ? 2 : 1;
    const bwLoad = bodyweightLoad(exercise.name, bodyweightKg);
    return (
      total +
      exercise.sets
        .filter(isWorkingSet)
        .reduce((sum, set) => sum + (set.kg + bwLoad) * mult * set.reps, 0)
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
