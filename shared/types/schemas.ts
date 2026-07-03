import { z } from "zod";

export const goalSchema = z.enum(["muscle", "fatloss", "strength"]);
export const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const genderSchema = z.enum(["male", "female", "other"]);
export const unitSchema = z.enum(["kg", "lb"]);

export const dayKeySchema = z.enum([
  "pushA",
  "pullA",
  "legs",
  "pushB",
  "pullB",
  "upper",
  "lower",
  "full",
  "chest",
  "back",
  "shoulders",
  "arms",
]);

export const muscleSchema = z.enum([
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
]);

export const exerciseInstanceSchema = z.object({
  id: z.string(),
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  target: z.string(),
  muscle: muscleSchema,
  off: z.boolean().optional(),
});

export const scheduledDaySchema = z.object({
  key: dayKeySchema,
  name: z.string(),
  sub: z.string(),
  dur: z.number(),
  label: z.string(),
  muscles: z.array(muscleSchema),
  exercises: z.array(exerciseInstanceSchema),
});

const setTypeSchema = z.enum(["normal", "warmup", "drop"]);

export const loggedSetSchema = z.object({
  kg: z.number(),
  reps: z.number(),
  done: z.boolean(),
  type: setTypeSchema,
});

export const sessionSetSchema = z.object({
  kg: z.number(),
  reps: z.number(),
  type: setTypeSchema,
});

export const sessionRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  ts: z.number(),
  dayKey: dayKeySchema,
  dayName: z.string(),
  durationSec: z.number(),
  volume: z.number(),
  totalSets: z.number(),
  exercises: z.array(
    z.object({
      name: z.string(),
      muscle: muscleSchema,
      sets: z.array(sessionSetSchema),
    }),
  ),
});

export const bodyweightEntrySchema = z.object({
  date: z.string(),
  kg: z.number(),
});
