// Regenerates supabase/seed-exercises.sql from the bundled catalog snapshot.
//
// To change the catalog: edit shared/lib/program/exercise-catalog.json (bump
// its "version" so stale persisted copies are invalidated), run
// `node scripts/generate-exercise-seed.mjs`, then run the SQL in the Supabase
// SQL editor. Exercise names key users' exercise_history rows — only ever add
// rows, never rename existing ones.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { exercises } = JSON.parse(
  readFileSync(join(root, "shared/lib/program/exercise-catalog.json"), "utf8"),
);

const q = (s) => `'${s.replace(/'/g, "''")}'`;
const num = (n) => (n === null ? "null" : String(n));

const values = exercises
  .map(
    (r, i) =>
      `  (${q(r.id)}, ${q(r.name)}, ${q(r.muscle)}, ${num(r.defaultKg)}, ` +
      `${r.isBarbell}, ${r.isDumbbell}, ${r.isBodyweight}, ${r.isTimed}, ` +
      `${r.isCompound}, ${num(r.bodyweightLoad)}, ${i})`,
  )
  .join(",\n");

const sql = `-- Exercise catalog seed — generated from shared/lib/program/exercise-catalog.json
-- via scripts/generate-exercise-seed.mjs; do not edit by hand.
-- Idempotent: re-running updates existing rows in place. Run in the Supabase
-- SQL editor after schema.sql.

insert into public.exercises
  (id, name, muscle, default_kg, is_barbell, is_dumbbell, is_bodyweight,
   is_timed, is_compound, bodyweight_load, sort_order)
values
${values}
on conflict (id) do update set
  name = excluded.name,
  muscle = excluded.muscle,
  default_kg = excluded.default_kg,
  is_barbell = excluded.is_barbell,
  is_dumbbell = excluded.is_dumbbell,
  is_bodyweight = excluded.is_bodyweight,
  is_timed = excluded.is_timed,
  is_compound = excluded.is_compound,
  bodyweight_load = excluded.bodyweight_load,
  sort_order = excluded.sort_order,
  updated_at = now();
`;

writeFileSync(join(root, "supabase/seed-exercises.sql"), sql);
console.log(`wrote supabase/seed-exercises.sql (${exercises.length} rows)`);
