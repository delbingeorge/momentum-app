import { File, Paths } from "expo-file-system";
import * as LegacyFS from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import {
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";
import type { Unit } from "@/shared/types";

export type ExportDest = "share" | "save";

export interface DeliverOpts {
  dest: ExportDest;
  // Android SAF directory uri, picked once and reused for every file this run
  saveDir?: string | null;
}

// Android: ask the user for a folder once so a multi-file export does not
// prompt per file. iOS has no folder picker; "save" routes through the share
// sheet's "Save to Files", so no dir is needed.
export const requestSaveDir = async (): Promise<string | null> => {
  if (Platform.OS !== "android") return null;
  const perm =
    await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();
  return perm.granted ? perm.directoryUri : null;
};

const csvCell = (value: string | number): string => {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows: (string | number)[][]): string =>
  rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

const kgToUnit = (kg: number, unit: Unit): number =>
  unit === "kg" ? Math.round(kg * 10) / 10 : Math.round(kg * 2.2046 * 10) / 10;

const deliver = async (
  opts: DeliverOpts,
  filename: string,
  content: string,
  mimeType: string,
): Promise<void> => {
  if (opts.dest === "save" && Platform.OS === "android" && opts.saveDir) {
    const base = filename.replace(/\.[^.]+$/, "");
    const uri = await LegacyFS.StorageAccessFramework.createFileAsync(
      opts.saveDir,
      base,
      mimeType,
    );
    await LegacyFS.writeAsStringAsync(uri, content);
    return;
  }
  const file = new File(Paths.cache, filename);
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType });
};

// Per-exercise last-logged sets, grouped by training day
export const exportWorkoutsCsv = async (
  opts: DeliverOpts = { dest: "share" },
): Promise<void> => {
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
  await deliver(opts, "momentum-workouts.csv", toCsv(rows), "text/csv");
};

export const exportBodyweightCsv = async (
  opts: DeliverOpts = { dest: "share" },
): Promise<void> => {
  const { weights } = useBodyStore.getState();
  const { unit } = useSettingsStore.getState();
  const rows: (string | number)[][] = [["Date", `Weight (${unit})`]];
  weights.forEach((entry) => rows.push([entry.date, kgToUnit(entry.kg, unit)]));
  await deliver(opts, "momentum-bodyweight.csv", toCsv(rows), "text/csv");
};

export const exportSessionsCsv = async (
  opts: DeliverOpts = { dest: "share" },
): Promise<void> => {
  const { sessionDates } = useWorkoutStore.getState();
  const rows: (string | number)[][] = [["Date", "Trained"]];
  [...sessionDates].sort().forEach((date) => rows.push([date, "yes"]));
  await deliver(opts, "momentum-sessions.csv", toCsv(rows), "text/csv");
};

// Full state backup: everything needed to restore the app
export const exportBackupJson = async (
  opts: DeliverOpts = { dest: "share" },
): Promise<void> => {
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
  await deliver(
    opts,
    "momentum-backup.json",
    JSON.stringify(backup, null, 2),
    "application/json",
  );
};
