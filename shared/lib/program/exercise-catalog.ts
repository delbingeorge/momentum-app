import { z } from "zod";

import { muscleSchema } from "@/shared/types/schemas";

import bundled from "./exercise-catalog.json";

// One catalog row. Loads: defaultKg is the first-session weight (per hand for
// dumbbell lifts); bodyweightLoad is the fraction of bodyweight that acts as
// resistance for volume credit (null for loaded or timed movements).
export const exerciseDefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  muscle: muscleSchema,
  defaultKg: z.number().nullable(),
  isBarbell: z.boolean(),
  isDumbbell: z.boolean(),
  isBodyweight: z.boolean(),
  isTimed: z.boolean(),
  isCompound: z.boolean(),
  bodyweightLoad: z.number().nullable(),
});

export type ExerciseDef = z.infer<typeof exerciseDefSchema>;

// Bundled snapshot (generated alongside supabase/seed-exercises.sql) so the
// library works on first launch, offline, and with cloud unconfigured. Bump
// the JSON's version whenever the snapshot is regenerated — it invalidates
// the persisted copy from older installs (see catalog-store).
export const BUNDLED_CATALOG_VERSION: number = bundled.version;

export const BUNDLED_EXERCISES: ExerciseDef[] = z
  .array(exerciseDefSchema)
  .min(1)
  .parse(bundled.exercises);
