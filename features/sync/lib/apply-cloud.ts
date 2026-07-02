import { MAX_PAST_SESSIONS } from "@/shared/stores/workout-store";
import type {
  BodyweightEntry,
  ExerciseHistory,
  SessionRecord,
} from "@/shared/types";

import type { BodyweightRow, HistoryRow, SessionRow } from "./serializers";
import { rowToSession } from "./serializers";

// The cloud is the source of truth: fetched rows map straight into the store
// shapes and REPLACE the local caches — no merging. The engine only applies
// them when the entity has no unpushed local changes (see pullAll), and always
// pushes before pulling, so nothing local-only can be clobbered.

export const sessionsFromRows = (rows: SessionRow[]): SessionRecord[] =>
  rows
    .map(rowToSession)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_PAST_SESSIONS);

export const datesFromSessions = (sessions: SessionRecord[]): string[] =>
  [...new Set(sessions.map((session) => session.date))].sort();

export const historyFromRows = (rows: HistoryRow[]): ExerciseHistory =>
  Object.fromEntries(rows.map((row) => [row.exercise_name, row.sets]));

export const weightsFromRows = (rows: BodyweightRow[]): BodyweightEntry[] =>
  rows
    .map((row) => ({ date: row.date, kg: row.kg }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
