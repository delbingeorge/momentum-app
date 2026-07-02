import { getSupabase } from "@/shared/lib/api-client";
import {
  type ExerciseDef,
  exerciseDefSchema,
} from "@/shared/lib/program/exercise-catalog";

// Aliased to camelCase so rows parse straight into ExerciseDef.
const COLUMNS =
  "id, name, muscle, defaultKg:default_kg, isBarbell:is_barbell, " +
  "isDumbbell:is_dumbbell, isBodyweight:is_bodyweight, isTimed:is_timed, " +
  "isCompound:is_compound, bodyweightLoad:bodyweight_load";

// Full catalog, in library display order. Drop schema-invalid rows but surface
// how many, so a drifted table is greppable in device logs instead of silent.
export const fetchExerciseCatalog = async (): Promise<ExerciseDef[]> => {
  const { data, error } = await getSupabase()
    .from("exercises")
    .select(COLUMNS)
    .order("sort_order");
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const parsed = rows.flatMap((row) => {
    const result = exerciseDefSchema.safeParse(row);
    return result.success ? [result.data] : [];
  });
  const dropped = rows.length - parsed.length;
  if (dropped > 0) {
    console.warn(
      `catalog: dropped ${dropped}/${rows.length} exercise rows (schema mismatch)`,
    );
  }
  return parsed;
};
