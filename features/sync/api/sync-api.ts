import { z } from "zod";

import { getSupabase } from "@/shared/lib/api-client";
import type { BodyweightEntry, ExerciseHistory, SessionRecord } from "@/shared/types";

import {
  type BodyweightRow,
  bodyweightRowSchema,
  type HistoryRow,
  historyRowSchema,
  historyToRows,
  type ProfileRow,
  profileRowSchema,
  type SessionRow,
  sessionRowSchema,
  sessionToRow,
  weightsToRows,
} from "../lib/serializers";

const parseRows = <T>(schema: z.ZodType<T>, rows: unknown[]): T[] =>
  rows.flatMap((row) => {
    const parsed = schema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });

export const fetchSessions = async (): Promise<SessionRow[]> => {
  const { data, error } = await getSupabase().from("workout_sessions").select();
  if (error) throw new Error(error.message);
  return parseRows(sessionRowSchema, data ?? []);
};

export const fetchHistory = async (): Promise<HistoryRow[]> => {
  const { data, error } = await getSupabase().from("exercise_history").select();
  if (error) throw new Error(error.message);
  return parseRows(historyRowSchema, data ?? []);
};

export const fetchBodyweight = async (): Promise<BodyweightRow[]> => {
  const { data, error } = await getSupabase().from("bodyweight_logs").select();
  if (error) throw new Error(error.message);
  return parseRows(bodyweightRowSchema, data ?? []);
};

export const fetchProfile = async (): Promise<ProfileRow | null> => {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const parsed = profileRowSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
};

export const pushSessions = async (
  sessions: SessionRecord[],
  userId: string,
): Promise<void> => {
  if (!sessions.length) return;
  const { error } = await getSupabase()
    .from("workout_sessions")
    .upsert(sessions.map((session) => sessionToRow(session, userId)));
  if (error) throw new Error(error.message);
};

export const pushHistory = async (
  history: ExerciseHistory,
  userId: string,
): Promise<void> => {
  const rows = historyToRows(history, userId);
  if (!rows.length) return;
  const { error } = await getSupabase().from("exercise_history").upsert(rows);
  if (error) throw new Error(error.message);
};

export const pushBodyweight = async (
  weights: BodyweightEntry[],
  userId: string,
): Promise<void> => {
  const rows = weightsToRows(weights, userId);
  if (!rows.length) return;
  const { error } = await getSupabase().from("bodyweight_logs").upsert(rows);
  if (error) throw new Error(error.message);
};

export const pushProfile = async (
  profile: Record<string, unknown>,
  userId: string,
): Promise<void> => {
  const { error } = await getSupabase()
    .from("profiles")
    .upsert({ ...profile, id: userId, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
};

// Delete the user's logged data for "start over". Leaves the profiles row so
// the entitlement mirror (is_paid) survives; the cleared plan is written back
// separately via pushProfile.
export const clearCloudData = async (userId: string): Promise<void> => {
  const db = getSupabase();
  const results = await Promise.all([
    db.from("workout_sessions").delete().eq("user_id", userId),
    db.from("exercise_history").delete().eq("user_id", userId),
    db.from("bodyweight_logs").delete().eq("user_id", userId),
  ]);
  for (const { error } of results) {
    if (error) throw new Error(error.message);
  }
};
