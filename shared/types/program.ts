import type { IconName } from "@/shared/ui";

export type Goal = "muscle" | "fatloss" | "strength";
export type Level = "beginner" | "intermediate" | "advanced";
export type Gender = "male" | "female" | "other";
export type Unit = "kg" | "lb";

export type DayKey =
  | "pushA"
  | "pullA"
  | "legs"
  | "pushB"
  | "pullB"
  | "upper"
  | "lower"
  | "full"
  | "chest"
  | "back"
  | "shoulders"
  | "arms";

export type Muscle =
  | "Chest"
  | "Front delts"
  | "Side delts"
  | "Rear delts"
  | "Triceps"
  | "Back"
  | "Biceps"
  | "Quads"
  | "Hamstrings"
  | "Calves"
  | "Core"
  | "Full body";

export interface GoalOption {
  id: Goal;
  name: string;
  icon: IconName;
  blurb: string;
  tag: string;
}

export interface LevelOption {
  id: Level;
  name: string;
  icon: IconName;
  blurb: string;
}

export interface GenderOption {
  id: Gender;
  name: string;
}

export interface ExerciseInstance {
  id: string;
  name: string;
  sets: number;
  reps: string;
  target: string;
  muscle: Muscle;
  off?: boolean;
}

export interface DayTemplate {
  key: DayKey;
  name: string;
  sub: string;
  dur: number;
  muscles: Muscle[];
  exercises: ExerciseInstance[];
}

export interface ScheduledDay extends DayTemplate {
  label: string;
}

export interface Split {
  id: string;
  family: string;
  name: string;
  sub: string;
  plan: DayKey[];
}
