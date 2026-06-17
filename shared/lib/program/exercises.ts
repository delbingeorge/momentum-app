import { round5 } from "@/shared/lib/units";
import type { ExerciseInstance, Level, Muscle } from "@/shared/types";

export const EX: Record<string, Muscle> = {
  "Barbell Bench Press": "Chest",
  "Incline Dumbbell Press": "Chest",
  "Flat Dumbbell Press": "Chest",
  "Incline Machine Press": "Chest",
  "Cable Chest Fly": "Chest",
  "Dumbbell Chest Fly": "Chest",
  "Cable Crossover": "Chest",
  "Pec Deck": "Chest",
  "Decline Barbell Bench Press": "Chest",
  "Push-ups": "Chest",
  "Seated Shoulder Press": "Front delts",
  "Overhead Barbell Press": "Front delts",
  "Dumbbell Shoulder Press": "Front delts",
  "Arnold Press": "Front delts",
  "Front Raise": "Front delts",
  "Lateral Raises": "Side delts",
  "Cable Lateral Raise": "Side delts",
  "Machine Lateral Raise": "Side delts",
  "Upright Row": "Side delts",
  "Rear Delt Fly": "Rear delts",
  "Reverse Fly": "Rear delts",
  "Face Pulls": "Rear delts",
  "Tricep Rope Pushdown": "Triceps",
  "Overhead Tricep Extension": "Triceps",
  "Close-Grip Bench Press": "Triceps",
  "Skull Crushers": "Triceps",
  "Tricep Dips": "Triceps",
  "Tricep Kickback": "Triceps",
  "Single-Arm Pushdown": "Triceps",
  Deadlift: "Back",
  "Pull-ups": "Back",
  "Barbell Row": "Back",
  "Lat Pulldown": "Back",
  "Wide-Grip Lat Pulldown": "Back",
  "Seated Cable Row": "Back",
  "Chest-Supported Row": "Back",
  "Single-Arm Cable Row": "Back",
  "T-Bar Row": "Back",
  "Dumbbell Row": "Back",
  "Straight-Arm Pulldown": "Back",
  "Close-Grip Lat Pulldown": "Back",
  "Inverted Row": "Back",
  "EZ-Bar Curl": "Biceps",
  "Hammer Curl": "Biceps",
  "Incline Dumbbell Curl": "Biceps",
  "Preacher Curl": "Biceps",
  "Barbell Curl": "Biceps",
  "Cable Curl": "Biceps",
  "Concentration Curl": "Biceps",
  "Barbell Back Squat": "Quads",
  "Leg Press": "Quads",
  "Walking Lunges": "Quads",
  "Front Squat": "Quads",
  "Hack Squat": "Quads",
  "Leg Extension": "Quads",
  "Bulgarian Split Squat": "Quads",
  "Goblet Squat": "Quads",
  "Romanian Deadlift": "Hamstrings",
  "Leg Curl": "Hamstrings",
  "Seated Leg Curl": "Hamstrings",
  "Good Morning": "Hamstrings",
  "Hip Thrust": "Hamstrings",
  "Standing Calf Raise": "Calves",
  "Seated Calf Raise": "Calves",
  "Hanging Leg Raise": "Core",
  "Hanging Knee Raise": "Core",
  "Toes to Bar": "Core",
  "Lying Leg Raise": "Core",
  "Reverse Crunch": "Core",
  "Crunch": "Core",
  "Sit-up": "Core",
  "Decline Sit-up": "Core",
  "Bicycle Crunch": "Core",
  "V-Up": "Core",
  "Dead Bug": "Core",
  "Ab Wheel Rollout": "Core",
  "Cable Crunch": "Core",
  "Machine Crunch": "Core",
  "Russian Twist": "Core",
  "Cable Woodchopper": "Core",
  "Landmine Twist": "Core",
  "Pallof Press": "Core",
  "Plank": "Core",
  "Side Plank": "Core",
  "Hollow Hold": "Core",
  "Flutter Kicks": "Core",
  "Mountain Climbers": "Core",
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
  "Dumbbell Chest Fly": 10,
  "Cable Crossover": 12,
  "Pec Deck": 40,
  "Decline Barbell Bench Press": 60,
  "Push-ups": 0,
  "Seated Shoulder Press": 11,
  "Overhead Barbell Press": 40,
  "Dumbbell Shoulder Press": 12,
  "Arnold Press": 10,
  "Front Raise": 6,
  "Lateral Raises": 5,
  "Cable Lateral Raise": 9,
  "Machine Lateral Raise": 25,
  "Upright Row": 30,
  "Rear Delt Fly": 6,
  "Reverse Fly": 12,
  "Face Pulls": 25,
  "Tricep Rope Pushdown": 30,
  "Overhead Tricep Extension": 22,
  "Close-Grip Bench Press": 50,
  "Skull Crushers": 25,
  "Tricep Dips": 0,
  "Tricep Kickback": 6,
  "Single-Arm Pushdown": 10,
  "Pull-ups": 0,
  "Barbell Row": 60,
  "Lat Pulldown": 50,
  "Wide-Grip Lat Pulldown": 50,
  "Seated Cable Row": 50,
  "Chest-Supported Row": 20,
  "Single-Arm Cable Row": 22,
  "T-Bar Row": 40,
  "Dumbbell Row": 22,
  "Straight-Arm Pulldown": 25,
  "Close-Grip Lat Pulldown": 50,
  "Inverted Row": 0,
  "EZ-Bar Curl": 30,
  "Hammer Curl": 7,
  "Incline Dumbbell Curl": 7,
  "Preacher Curl": 30,
  "Barbell Curl": 30,
  "Cable Curl": 25,
  "Concentration Curl": 8,
  "Barbell Back Squat": 80,
  "Leg Press": 120,
  "Walking Lunges": 10,
  "Front Squat": 60,
  "Hack Squat": 60,
  "Leg Extension": 40,
  "Bulgarian Split Squat": 10,
  "Goblet Squat": 20,
  "Leg Curl": 45,
  "Seated Leg Curl": 45,
  "Good Morning": 40,
  "Hip Thrust": 60,
  "Standing Calf Raise": 60,
  "Seated Calf Raise": 40,
  "Hanging Leg Raise": 0,
  "Hanging Knee Raise": 0,
  "Toes to Bar": 0,
  "Lying Leg Raise": 0,
  "Reverse Crunch": 0,
  Crunch: 0,
  "Sit-up": 0,
  "Decline Sit-up": 0,
  "Bicycle Crunch": 0,
  "V-Up": 0,
  "Dead Bug": 0,
  "Ab Wheel Rollout": 0,
  "Cable Crunch": 30,
  "Machine Crunch": 45,
  "Russian Twist": 5,
  "Cable Woodchopper": 20,
  "Landmine Twist": 20,
  "Pallof Press": 15,
  "Plank": 0,
  "Side Plank": 0,
  "Hollow Hold": 0,
  "Flutter Kicks": 0,
  "Mountain Climbers": 0,
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
  "Decline Barbell Bench Press",
  "Front Squat",
  "Good Morning",
  "Hip Thrust",
  "Barbell Curl",
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
  "Dumbbell Chest Fly",
  "Dumbbell Shoulder Press",
  "Arnold Press",
  "Front Raise",
  "Tricep Kickback",
  "Dumbbell Row",
  "Concentration Curl",
  "Bulgarian Split Squat",
]);

export const isDumbbell = (name: string): boolean => DUMBBELL.has(name);

// Bodyweight core/calisthenics — their default load is 0, so they progress via
// reps (or held seconds for timed holds), not added weight. See progressionFor.
const BODYWEIGHT = new Set([
  "Hanging Leg Raise",
  "Hanging Knee Raise",
  "Toes to Bar",
  "Lying Leg Raise",
  "Reverse Crunch",
  "Crunch",
  "Sit-up",
  "Decline Sit-up",
  "Bicycle Crunch",
  "V-Up",
  "Dead Bug",
  "Ab Wheel Rollout",
  "Plank",
  "Side Plank",
  "Hollow Hold",
  "Flutter Kicks",
  "Mountain Climbers",
]);

export const isBodyweight = (name: string): boolean => BODYWEIGHT.has(name);

// Timed holds — the "reps" we log and progress are seconds, not repetitions.
const TIMED = new Set([
  "Plank",
  "Side Plank",
  "Hollow Hold",
  "Flutter Kicks",
  "Mountain Climbers",
]);

export const isTimed = (name: string): boolean => TIMED.has(name);

// Fraction of bodyweight that acts as resistance for each bodyweight movement,
// used to credit it toward session volume (any added weight — a dip belt, a
// plate on the hips — is counted on top). Timed holds like Plank are excluded:
// their "reps" are seconds, so kg × reps volume doesn't apply.
const BODYWEIGHT_LOAD: Record<string, number> = {
  "Pull-ups": 1,
  "Tricep Dips": 1,
  "Push-ups": 0.64,
  "Inverted Row": 0.6,
  "Toes to Bar": 0.55,
  "Hanging Leg Raise": 0.5,
  "Decline Sit-up": 0.5,
  "Ab Wheel Rollout": 0.5,
  "V-Up": 0.45,
  "Hanging Knee Raise": 0.4,
  "Lying Leg Raise": 0.4,
  "Sit-up": 0.4,
  "Reverse Crunch": 0.3,
  "Bicycle Crunch": 0.3,
  Crunch: 0.25,
  "Dead Bug": 0.2,
};

export const bodyweightLoad = (name: string, bodyweightKg: number): number =>
  (BODYWEIGHT_LOAD[name] ?? 0) * bodyweightKg;

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
  "Decline Barbell Bench Press",
  "T-Bar Row",
  "Dumbbell Row",
  "Front Squat",
  "Hack Squat",
  "Hip Thrust",
  "Deadlift",
  "Romanian Deadlift",
];

export const isCompound = (name: string): boolean => COMPOUND.includes(name);

// Default rep/time target for an exercise added from the library: timed holds
// are prescribed in seconds, everything else in reps.
export const defaultTargetFor = (name: string): string =>
  isTimed(name) ? "30–45s" : "8–12";

// Unique id so duplicates can coexist mid-workout
export const makeExercise = (
  name: string,
  sets = 3,
  target = defaultTargetFor(name),
): ExerciseInstance => ({
  id: `${name}#${Math.random().toString(36).slice(2, 6)}`,
  name,
  sets,
  reps: target,
  target,
  muscle: muscleOf(name),
});
