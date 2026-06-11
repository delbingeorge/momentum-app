import {
  type SheetDefinition,
  SheetRegister,
} from "react-native-actions-sheet";

import { RecapSheet } from "@/features/home/components/recap.sheet";
import { ExportSheet } from "@/features/profile/components/export.sheet";
import { ReminderSheet } from "@/features/profile/components/reminder.sheet";
import { LogBodyweightSheet } from "@/features/progress/components/log-bodyweight.sheet";
import { SessionDetailSheet } from "@/features/progress/components/session-detail.sheet";
import { ExerciseInfoSheet } from "@/features/workout/components/exercise-info.sheet";
import { ExercisePickerSheet } from "@/features/workout/components/exercise-picker.sheet";
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
