import { round5 } from "@/shared/lib/units";
// direct file import (not the stores barrel) — the barrel pulls in plan-store,
// which imports this module back through the program barrel
import { useCatalogStore } from "@/shared/stores/catalog-store";
import type { ExerciseInstance, Level, Muscle } from "@/shared/types";

import type { ExerciseDef } from "./exercise-catalog";

// Library display order for muscle groups (matches the Muscle union).
const MUSCLE_ORDER: Muscle[] = [
  "Chest",
  "Front delts",
  "Side delts",
  "Rear delts",
  "Triceps",
  "Back",
  "Biceps",
  "Quads",
  "Hamstrings",
  "Calves",
  "Core",
  "Full body",
];

interface CatalogIndex {
  rows: ExerciseDef[];
  byName: Map<string, ExerciseDef>;
  lib: { muscle: Muscle; names: string[] }[];
}

// Lookup indexes over the catalog store, rebuilt only when the store's row
// array is replaced (bundled snapshot at boot, cloud refresh afterwards) so
// the helpers below stay cheap synchronous calls.
let cached: CatalogIndex | null = null;

const index = (): CatalogIndex => {
  const rows = useCatalogStore.getState().exercises;
  if (cached && cached.rows === rows) return cached;

  const byName = new Map(rows.map((def) => [def.name, def]));
  const grouped = new Map<Muscle, string[]>();
  rows.forEach((def) => {
    const names = grouped.get(def.muscle) ?? [];
    names.push(def.name);
    grouped.set(def.muscle, names);
  });
  const lib = MUSCLE_ORDER.flatMap((muscle) => {
    const names = grouped.get(muscle);
    return names ? [{ muscle, names }] : [];
  });

  cached = { rows, byName, lib };
  return cached;
};

const defOf = (name: string): ExerciseDef | undefined =>
  index().byName.get(name);

export const muscleOf = (name: string): Muscle =>
  defOf(name)?.muscle ?? "Full body";

// Exercise library grouped by muscle (for the explore browser and pickers),
// in anatomical order.
export const libGroups = (): { muscle: Muscle; names: string[] }[] =>
  index().lib;

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

export const isBarbell = (name: string): boolean =>
  defOf(name)?.isBarbell ?? false;

// Two-dumbbell (one per hand) lifts. Their loads are stored PER HAND — the
// number the user sees and enters is the weight of a single dumbbell, matching
// standard lifting convention. Volume counts both hands (see buildSession).
export const isDumbbell = (name: string): boolean =>
  defOf(name)?.isDumbbell ?? false;

// Bodyweight core/calisthenics — their default load is 0, so they progress via
// reps (or held seconds for timed holds), not added weight. See progressionFor.
export const isBodyweight = (name: string): boolean =>
  defOf(name)?.isBodyweight ?? false;

// Timed holds — the "reps" we log and progress are seconds, not repetitions.
export const isTimed = (name: string): boolean => defOf(name)?.isTimed ?? false;

// Compound (big) lifts progress in bigger jumps than isolation work
export const isCompound = (name: string): boolean =>
  defOf(name)?.isCompound ?? false;

// Fraction of bodyweight that acts as resistance for a bodyweight movement,
// used to credit it toward session volume (any added weight — a dip belt, a
// plate on the hips — is counted on top). Timed holds like Plank carry no
// load factor: their "reps" are seconds, so kg × reps volume doesn't apply.
export const bodyweightLoad = (name: string, bodyweightKg: number): number =>
  (defOf(name)?.bodyweightLoad ?? 0) * bodyweightKg;

export const defaultKgFor = (
  name: string,
  level: Level = "intermediate",
): number => {
  if (level === "beginner" && isBarbell(name)) return EMPTY_BAR_KG;
  return round5((defOf(name)?.defaultKg ?? 20) * LEVEL_KG_FACTOR[level]);
};

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
