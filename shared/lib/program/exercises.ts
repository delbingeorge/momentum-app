import { round5 } from "@/shared/lib/units";
import type { ExerciseInstance, Level, Muscle } from "@/shared/types";

export const EX: Record<string, Muscle> = {
  "Barbell Bench Press": "Chest",
  "Incline Dumbbell Press": "Chest",
  "Flat Dumbbell Press": "Chest",
  "Incline Machine Press": "Chest",
  "Cable Chest Fly": "Chest",
  "Seated Shoulder Press": "Front delts",
  "Overhead Barbell Press": "Front delts",
  "Lateral Raises": "Side delts",
  "Cable Lateral Raise": "Side delts",
  "Rear Delt Fly": "Rear delts",
  "Reverse Fly": "Rear delts",
  "Face Pulls": "Rear delts",
  "Tricep Rope Pushdown": "Triceps",
  "Overhead Tricep Extension": "Triceps",
  "Close-Grip Bench Press": "Triceps",
  Deadlift: "Back",
  "Pull-ups": "Back",
  "Barbell Row": "Back",
  "Lat Pulldown": "Back",
  "Wide-Grip Lat Pulldown": "Back",
  "Seated Cable Row": "Back",
  "Chest-Supported Row": "Back",
  "Single-Arm Cable Row": "Back",
  "EZ-Bar Curl": "Biceps",
  "Hammer Curl": "Biceps",
  "Incline Dumbbell Curl": "Biceps",
  "Preacher Curl": "Biceps",
  "Barbell Back Squat": "Quads",
  "Leg Press": "Quads",
  "Walking Lunges": "Quads",
  "Romanian Deadlift": "Hamstrings",
  "Leg Curl": "Hamstrings",
  "Standing Calf Raise": "Calves",
  "Hanging Leg Raise": "Core",
};

export const muscleOf = (name: string): Muscle => EX[name] ?? "Full body";

// Exercise library grouped by muscle (for swap/add pickers)
export const LIB: Partial<Record<Muscle, string[]>> = (() => {
  const grouped: Partial<Record<Muscle, string[]>> = {};
  Object.entries(EX).forEach(([name, muscle]) => {
    (grouped[muscle] = grouped[muscle] ?? []).push(name);
  });
  return grouped;
})();

// First-session starting loads. Dumbbell lifts (see DUMBBELL) are per hand;
// everything else is the total on the bar/stack/machine.
export const DEFAULT_KG: Record<string, number> = {
  "Barbell Bench Press": 60,
  "Incline Dumbbell Press": 12,
  "Flat Dumbbell Press": 13,
  "Incline Machine Press": 40,
  "Cable Chest Fly": 15,
  "Seated Shoulder Press": 11,
  "Overhead Barbell Press": 40,
  "Lateral Raises": 5,
  "Cable Lateral Raise": 9,
  "Rear Delt Fly": 6,
  "Reverse Fly": 12,
  "Face Pulls": 25,
  "Tricep Rope Pushdown": 30,
  "Overhead Tricep Extension": 22,
  "Close-Grip Bench Press": 50,
  "Pull-ups": 0,
  "Barbell Row": 60,
  "Lat Pulldown": 50,
  "Wide-Grip Lat Pulldown": 50,
  "Seated Cable Row": 50,
  "Chest-Supported Row": 20,
  "Single-Arm Cable Row": 22,
  "EZ-Bar Curl": 30,
  "Hammer Curl": 7,
  "Incline Dumbbell Curl": 7,
  "Preacher Curl": 30,
  "Barbell Back Squat": 80,
  "Leg Press": 120,
  "Walking Lunges": 10,
  "Leg Curl": 45,
  "Standing Calf Raise": 60,
  "Hanging Leg Raise": 0,
  Deadlift: 100,
  "Romanian Deadlift": 70,
};

// Scale the (intermediate-baseline) default loads to the user's experience.
// First-session only — once history exists, progression takes over.
export const LEVEL_KG_FACTOR: Record<Level, number> = {
  beginner: 0.6,
  intermediate: 1,
  advanced: 1.3,
};

// An Olympic barbell weighs 20kg. Novices start barbell lifts here and ramp up
// via progression, rather than from a scaled estimate that overshoots the bar.
export const EMPTY_BAR_KG = 20;

const BARBELL = new Set([
  "Barbell Bench Press",
  "Overhead Barbell Press",
  "Barbell Row",
  "Barbell Back Squat",
  "Close-Grip Bench Press",
  "Deadlift",
  "Romanian Deadlift",
]);

export const isBarbell = (name: string): boolean => BARBELL.has(name);

// Two-dumbbell (one per hand) lifts. Their loads are stored PER HAND — the
// number the user sees and enters is the weight of a single dumbbell, matching
// standard lifting convention. Volume counts both hands (see buildSession).
const DUMBBELL = new Set([
  "Incline Dumbbell Press",
  "Flat Dumbbell Press",
  "Lateral Raises",
  "Rear Delt Fly",
  "Hammer Curl",
  "Incline Dumbbell Curl",
  "Seated Shoulder Press",
  "Walking Lunges",
  "Chest-Supported Row",
]);

export const isDumbbell = (name: string): boolean => DUMBBELL.has(name);

export const defaultKgFor = (
  name: string,
  level: Level = "intermediate",
): number => {
  if (level === "beginner" && isBarbell(name)) return EMPTY_BAR_KG;
  return round5((DEFAULT_KG[name] ?? 20) * LEVEL_KG_FACTOR[level]);
};

// Compound (big) lifts progress in bigger jumps than isolation work
const COMPOUND = [
  "Barbell Bench Press",
  "Overhead Barbell Press",
  "Barbell Row",
  "Barbell Back Squat",
  "Leg Press",
  "Pull-ups",
  "Close-Grip Bench Press",
  "Chest-Supported Row",
  "Flat Dumbbell Press",
  "Incline Dumbbell Press",
  "Deadlift",
  "Romanian Deadlift",
];

export const isCompound = (name: string): boolean => COMPOUND.includes(name);

// Unique id so duplicates can coexist mid-workout
export const makeExercise = (
  name: string,
  sets = 3,
  target = "8–12",
): ExerciseInstance => ({
  id: `${name}#${Math.random().toString(36).slice(2, 6)}`,
  name,
  sets,
  reps: target,
  target,
  muscle: muscleOf(name),
});
