import { isWorkingSet } from "@/shared/lib/program";
import type { SessionRecord, SessionSet } from "@/shared/types";

export const relDate = (ts: number): string => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export const recapDur = (sec: number): string =>
  `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`;

export interface RecapExercise {
  name: string;
  muscle: string;
  work: SessionSet[];
  allSets: SessionSet[];
}

export interface Recap {
  last: SessionRecord;
  exercises: RecapExercise[];
}

// Summary of the most recent session for the home recap card/sheet
export const analyzeRecap = (pastSessions: SessionRecord[]): Recap | null => {
  const last = pastSessions[0];
  if (!last) return null;
  const exercises = last.exercises.map((exercise) => ({
    name: exercise.name,
    muscle: exercise.muscle,
    work: exercise.sets.filter(isWorkingSet),
    allSets: exercise.sets,
  }));
  return { last, exercises };
};
