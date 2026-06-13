// One-off generator: 100 exercise_history rows as CSV for a user.
// Columns match supabase exercise_history table; PK (user_id, exercise_name).
// `sets` is JSON array of last-logged SessionSet { kg, reps, type }.
import { writeFileSync } from "node:fs";

const USER_ID = "68b3cf21-cf51-4505-96c2-9ef1e9d9cb65";
const COUNT = 100;
const UPDATED_AT = "2026-06-13T18:30:00.000Z";

// Deterministic PRNG so reruns are stable.
let seed = 0x9e3779b9;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 1_000_000) / 1_000_000;
};
const jitter = (base, step, n) => base + step * (Math.floor(rand() * (n * 2 + 1)) - n);

// base movement -> { baseKg, reps }; bodyweight moves use baseKg 0
const MOVES = [
  { name: "Bench Press", kg: 80, reps: 8 },
  { name: "Incline Bench Press", kg: 70, reps: 8 },
  { name: "Decline Bench Press", kg: 75, reps: 8 },
  { name: "Overhead Press", kg: 45, reps: 8 },
  { name: "Push Press", kg: 60, reps: 6 },
  { name: "Dumbbell Shoulder Press", kg: 24, reps: 10 },
  { name: "Arnold Press", kg: 20, reps: 10 },
  { name: "Lateral Raise", kg: 12, reps: 14 },
  { name: "Cable Lateral Raise", kg: 10, reps: 15 },
  { name: "Front Raise", kg: 10, reps: 14 },
  { name: "Rear Delt Fly", kg: 12, reps: 15 },
  { name: "Face Pull", kg: 25, reps: 15 },
  { name: "Cable Fly", kg: 18, reps: 14 },
  { name: "Pec Deck", kg: 45, reps: 12 },
  { name: "Incline Dumbbell Press", kg: 28, reps: 10 },
  { name: "Triceps Pushdown", kg: 30, reps: 12 },
  { name: "Overhead Triceps Extension", kg: 25, reps: 12 },
  { name: "Skullcrusher", kg: 35, reps: 10 },
  { name: "Close Grip Bench Press", kg: 65, reps: 8 },
  { name: "Dip", kg: 0, reps: 10 },
  { name: "Deadlift", kg: 140, reps: 5 },
  { name: "Romanian Deadlift", kg: 90, reps: 8 },
  { name: "Sumo Deadlift", kg: 130, reps: 5 },
  { name: "Rack Pull", kg: 160, reps: 5 },
  { name: "Barbell Row", kg: 70, reps: 8 },
  { name: "Pendlay Row", kg: 75, reps: 6 },
  { name: "T-Bar Row", kg: 60, reps: 10 },
  { name: "Seated Cable Row", kg: 70, reps: 10 },
  { name: "Single Arm Dumbbell Row", kg: 32, reps: 10 },
  { name: "Lat Pulldown", kg: 65, reps: 10 },
  { name: "Close Grip Pulldown", kg: 60, reps: 10 },
  { name: "Pull Up", kg: 0, reps: 8 },
  { name: "Chin Up", kg: 0, reps: 8 },
  { name: "Straight Arm Pulldown", kg: 25, reps: 14 },
  { name: "Shrug", kg: 80, reps: 12 },
  { name: "Barbell Curl", kg: 35, reps: 10 },
  { name: "EZ Bar Curl", kg: 30, reps: 10 },
  { name: "Hammer Curl", kg: 16, reps: 12 },
  { name: "Incline Dumbbell Curl", kg: 14, reps: 12 },
  { name: "Preacher Curl", kg: 25, reps: 10 },
  { name: "Concentration Curl", kg: 12, reps: 12 },
  { name: "Cable Curl", kg: 22, reps: 12 },
  { name: "Squat", kg: 110, reps: 6 },
  { name: "Front Squat", kg: 80, reps: 6 },
  { name: "Hack Squat", kg: 120, reps: 8 },
  { name: "Leg Press", kg: 180, reps: 10 },
  { name: "Bulgarian Split Squat", kg: 24, reps: 10 },
  { name: "Walking Lunge", kg: 20, reps: 12 },
  { name: "Leg Extension", kg: 55, reps: 12 },
  { name: "Leg Curl", kg: 50, reps: 12 },
  { name: "Seated Leg Curl", kg: 55, reps: 12 },
  { name: "Stiff Leg Deadlift", kg: 80, reps: 8 },
  { name: "Good Morning", kg: 50, reps: 10 },
  { name: "Hip Thrust", kg: 100, reps: 10 },
  { name: "Glute Bridge", kg: 80, reps: 12 },
  { name: "Calf Raise", kg: 60, reps: 15 },
  { name: "Seated Calf Raise", kg: 40, reps: 15 },
  { name: "Standing Calf Raise", kg: 70, reps: 15 },
  { name: "Hanging Leg Raise", kg: 0, reps: 12 },
  { name: "Cable Crunch", kg: 35, reps: 15 },
  { name: "Plank", kg: 0, reps: 60 },
  { name: "Russian Twist", kg: 10, reps: 20 },
  { name: "Ab Wheel Rollout", kg: 0, reps: 12 },
  { name: "Wrist Curl", kg: 20, reps: 15 },
  { name: "Reverse Wrist Curl", kg: 12, reps: 15 },
];

// Build 100 unique names: base moves, then variant-prefixed extras.
const VARIANTS = ["Smith Machine", "Machine", "Cable", "Dumbbell", "Paused", "Tempo", "Banded"];
const names = [];
const seen = new Set();
const addRow = (move) => {
  if (seen.has(move.name)) return;
  seen.add(move.name);
  names.push(move);
};
MOVES.forEach(addRow);
let vi = 0;
while (names.length < COUNT) {
  const base = MOVES[names.length % MOVES.length];
  const prefix = VARIANTS[vi % VARIANTS.length];
  vi++;
  addRow({ name: `${prefix} ${base.name}`, kg: base.kg, reps: base.reps });
}
const rows100 = names.slice(0, COUNT);

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = ["user_id", "exercise_name", "sets", "updated_at"];
const rows = [header];

rows100.forEach((move) => {
  const workKg = move.kg === 0 ? 0 : Math.round(jitter(move.kg, 2.5, 2));
  const sets = [];
  if (move.kg > 0) sets.push({ kg: Math.round(workKg * 0.5), reps: 10, type: "warmup" });
  const workSets = 2 + Math.floor(rand() * 2); // 2-3 working sets
  for (let s = 0; s < workSets; s++) {
    sets.push({ kg: workKg, reps: jitter(move.reps, 1, 1), type: "normal" });
  }
  if (rand() > 0.85) {
    sets.push({ kg: Math.round(workKg * 0.7), reps: move.reps + 4, type: "drop" });
  }
  rows.push([USER_ID, move.name, JSON.stringify(sets), UPDATED_AT]);
});

const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
writeFileSync("workout-history.csv", csv);
console.log(`wrote workout-history.csv: ${rows.length - 1} exercise_history rows`);
