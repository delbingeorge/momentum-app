import { z } from "zod";

import type { BodyweightEntry, ExerciseHistory, SessionRecord } from "@/shared/types";
import {
  bodyweightEntrySchema,
  dayKeySchema,
  scheduledDaySchema,
  sessionRecordSchema,
  sessionSetSchema,
} from "@/shared/types/schemas";

export const sessionRowSchema = z.object({
  id: z.string(),
  date: z.string(),
  ts: z.number(),
  day_key: dayKeySchema,
  day_name: z.string(),
  duration_sec: z.number(),
  volume: z.number(),
  total_sets: z.number(),
  exercises: sessionRecordSchema.shape.exercises,
  updated_at: z.string(),
});
export type SessionRow = z.infer<typeof sessionRowSchema>;

export const historyRowSchema = z.object({
  exercise_name: z.string(),
  sets: z.array(sessionSetSchema),
  updated_at: z.string(),
});
export type HistoryRow = z.infer<typeof historyRowSchema>;

export const bodyweightRowSchema = z.object({
  date: z.string(),
  kg: z.number(),
  updated_at: z.string(),
});
export type BodyweightRow = z.infer<typeof bodyweightRowSchema>;

export const profileRowSchema = z.object({
  goal: z.string().nullable(),
  level: z.string().nullable(),
  gender: z.string().nullable(),
  weight_kg: z.number().nullable(),
  days: z.number().nullable(),
  split_id: z.string().nullable(),
  unit: z.string().nullable(),
  rest_sec: z.number().nullable(),
  schedule: z.array(scheduledDaySchema).nullable(),
  since_deload: z.number().nullable(),
  is_paid: z.boolean().nullable(),
  updated_at: z.string(),
});
export type ProfileRow = z.infer<typeof profileRowSchema>;

export const sessionToRow = (
  session: SessionRecord,
  userId: string,
): Record<string, unknown> => ({
  id: session.id,
  user_id: userId,
  date: session.date,
  ts: session.ts,
  day_key: session.dayKey,
  day_name: session.dayName,
  duration_sec: session.durationSec,
  volume: session.volume,
  total_sets: session.totalSets,
  exercises: session.exercises,
  updated_at: new Date().toISOString(),
});

export const rowToSession = (row: SessionRow): SessionRecord => ({
  id: row.id,
  date: row.date,
  ts: row.ts,
  dayKey: row.day_key,
  dayName: row.day_name,
  durationSec: row.duration_sec,
  volume: row.volume,
  totalSets: row.total_sets,
  exercises: row.exercises,
});

export const historyToRows = (
  history: ExerciseHistory,
  userId: string,
): Record<string, unknown>[] =>
  Object.entries(history).map(([name, sets]) => ({
    user_id: userId,
    exercise_name: name,
    sets,
    updated_at: new Date().toISOString(),
  }));

export const weightsToRows = (
  weights: BodyweightEntry[],
  userId: string,
): Record<string, unknown>[] =>
  weights.map((entry) => ({
    user_id: userId,
    date: entry.date,
    kg: entry.kg,
    updated_at: new Date().toISOString(),
  }));
