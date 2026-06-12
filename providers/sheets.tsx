import {
  type SheetDefinition,
  SheetRegister,
} from "react-native-actions-sheet";

import { RecapSheet } from "@/features/home";
import { ExportSheet, ReminderSheet } from "@/features/profile";
import { LogBodyweightSheet, SessionDetailSheet } from "@/features/progress";
import { ExerciseInfoSheet, ExercisePickerSheet } from "@/features/workout";
import type { ExerciseInstance, SessionRecord } from "@/shared/types";

declare module "react-native-actions-sheet" {
  interface Sheets {
    "exercise-picker": SheetDefinition<{
      payload: { title: string };
      returnValue: string;
    }>;
    "exercise-info": SheetDefinition<{
      payload: { exercise: ExerciseInstance };
    }>;
    "session-detail": SheetDefinition<{
      payload: { session: SessionRecord };
    }>;
    "log-bodyweight": SheetDefinition;
    "reminder-config": SheetDefinition;
    "export-data": SheetDefinition;
    "session-recap": SheetDefinition;
  }
}

export const AppSheets = () => (
  <SheetRegister
    sheets={{
      "exercise-picker": ExercisePickerSheet,
      "exercise-info": ExerciseInfoSheet,
      "session-detail": SessionDetailSheet,
      "log-bodyweight": LogBodyweightSheet,
      "reminder-config": ReminderSheet,
      "export-data": ExportSheet,
      "session-recap": RecapSheet,
    }}
  />
);
