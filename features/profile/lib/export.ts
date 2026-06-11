import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";
import type { Unit } from "@/shared/types";

const csvCell = (value: string | number): string => {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows: (string | number)[][]): string =>
  rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

const kgToUnit = (kg: number, unit: Unit): number =>
  unit === "kg" ? Math.round(kg * 10) / 10 : Math.round(kg * 2.2046 * 10) / 10;

const writeAndShare = async (
  filename: string,
  content: string,
  mimeType: string,
): Promise<void> => {
  const file = new File(Paths.cache, filename);
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType });
};

// Per-exercise last-logged sets, grouped by training day
export const exportWorkoutsCsv = async (): Promise<void> => {
  const { schedule } = usePlanStore.getState();
  const { history } = useWorkoutStore.getState();
  const { unit } = useSettingsStore.getState();
  const rows: (string | number)[][] = [
    ["Day", "Exercise", "Muscle", "Set", `Weight (${unit})`, "Reps"],
  ];
  (schedule ?? []).forEach((day) => {
    day.exercises.forEach((exercise) => {
      const sets = history[exercise.name] ?? [];
      if (!sets.length) {
        rows.push([day.name, exercise.name, exercise.muscle, "", "", ""]);
        return;
      }
      sets.forEach((set, index) =>
        rows.push([
          day.name,
          exercise.name,
          exercise.muscle,
          index + 1,
          kgToUnit(set.kg, unit),
          set.reps,
        ]),
      );
    });
  });
  await writeAndShare("momentum-workouts.csv", toCsv(rows), "text/csv");
};

export const exportBodyweightCsv = async (): Promise<void> => {
  const { weights } = useBodyStore.getState();
  const { unit } = useSettingsStore.getState();
  const rows: (string | number)[][] = [["Date", `Weight (${unit})`]];
  weights.forEach((entry) => rows.push([entry.date, kgToUnit(entry.kg, unit)]));
  await writeAndShare("momentum-bodyweight.csv", toCsv(rows), "text/csv");
};

export const exportSessionsCsv = async (): Promise<void> => {
  const { sessionDates } = useWorkoutStore.getState();
  const rows: (string | number)[][] = [["Date", "Trained"]];
  [...sessionDates].sort().forEach((date) => rows.push([date, "yes"]));
  await writeAndShare("momentum-sessions.csv", toCsv(rows), "text/csv");
};

// Full state backup: everything needed to restore the app
export const exportBackupJson = async (): Promise<void> => {
  const plan = usePlanStore.getState();
  const workout = useWorkoutStore.getState();
  const body = useBodyStore.getState();
  const settings = useSettingsStore.getState();
  const backup = {
    goal: plan.goal,
    level: plan.level,
    gender: plan.gender,
    weightKg: plan.weightKg,
    days: plan.days,
    splitId: plan.splitId,
    schedule: plan.schedule,
    todayIndex: plan.todayIndex,
    log: workout.log,
    history: workout.history,
    pastSessions: workout.pastSessions,
    sessionDates: workout.sessionDates,
    sinceDeload: workout.sinceDeload,
    weights: body.weights,
    unit: settings.unit,
    restSec: settings.restSec,
    reminder: settings.reminder,
  };
  await writeAndShare(
    "momentum-backup.json",
    JSON.stringify(backup, null, 2),
    "application/json",
  );
};
