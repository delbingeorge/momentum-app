import type { DayKey, Muscle } from "./program";

export type SetType = "normal" | "warmup" | "drop";

export interface LoggedSet {
  kg: number;
  reps: number;
  done: boolean;
  type: SetType;
}

export interface SessionSet {
  kg: number;
  reps: number;
  type: SetType;
}

export interface SessionExercise {
  name: string;
  muscle: Muscle;
  sets: SessionSet[];
}

export interface SessionRecord {
  id: string;
  date: string;
  ts: number;
  dayKey: DayKey;
  dayName: string;
  durationSec: number;
  volume: number;
  totalSets: number;
  exercises: SessionExercise[];
}

export type ExerciseHistory = Record<string, SessionSet[]>;

export type WorkoutLog = Record<string, LoggedSet[]>;

export interface ProgressionSuggestion {
  kg: number;
  reps: number;
  note: "deload" | "overload" | null;
}
