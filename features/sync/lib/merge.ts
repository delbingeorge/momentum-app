import type { BodyweightEntry, ExerciseHistory, SessionRecord } from "@/shared/types";

import type { BodyweightRow, HistoryRow, SessionRow } from "./serializers";
import { rowToSession } from "./serializers";

const MAX_SESSIONS = 60;

// Sessions are append-only: union by id, newest first, capped
export const mergeSessions = (
  local: SessionRecord[],
  remote: SessionRow[],
): SessionRecord[] => {
  const byId = new Map<string, SessionRecord>();
  remote.forEach((row) => byId.set(row.id, rowToSession(row)));
  local.forEach((session) => byId.set(session.id, session));
  return [...byId.values()].sort((a, b) => b.ts - a.ts).slice(0, MAX_SESSIONS);
};

export const mergeSessionDates = (
  local: string[],
  sessions: SessionRecord[],
): string[] =>
  [...new Set([...local, ...sessions.map((session) => session.date)])].sort();

// Last-write-wins per exercise: remote rows newer than the last sync override
export const mergeHistory = (
  local: ExerciseHistory,
  remote: HistoryRow[],
  lastSyncedAt: number,
): ExerciseHistory => {
  const merged: ExerciseHistory = { ...local };
  remote.forEach((row) => {
    const remoteAt = Date.parse(row.updated_at);
    if (!(row.exercise_name in merged) || remoteAt > lastSyncedAt) {
      merged[row.exercise_name] = row.sets;
    }
  });
  return merged;
};

// Per-date merge: remote entries win for dates the device hasn't touched since sync
export const mergeWeights = (
  local: BodyweightEntry[],
  remote: BodyweightRow[],
  lastSyncedAt: number,
): BodyweightEntry[] => {
  const byDate = new Map<string, BodyweightEntry>();
  local.forEach((entry) => byDate.set(entry.date, entry));
  remote.forEach((row) => {
    const remoteAt = Date.parse(row.updated_at);
    if (!byDate.has(row.date) || remoteAt > lastSyncedAt) {
      byDate.set(row.date, { date: row.date, kg: row.kg });
    }
  });
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
};
