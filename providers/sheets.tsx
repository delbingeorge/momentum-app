import {
  type SheetDefinition,
  SheetRegister,
} from "react-native-actions-sheet";

import { NoPurchaseSheet } from "@/features/auth";
import { RecapSheet } from "@/features/home";
import {
  DataWarningSheet,
  ExportSheet,
  FeedbackSheet,
  ReminderSheet,
  ResetConfirmSheet,
} from "@/features/profile";
import {
  LogBodyweightSheet,
  SessionDetailSheet,
  StreakJourneySheet,
  WeighInGuideSheet,
} from "@/features/progress";
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
    "weigh-in-guide": SheetDefinition;
    "reminder-config": SheetDefinition;
    "export-data": SheetDefinition;
    feedback: SheetDefinition;
    "reset-confirm": SheetDefinition<{
      payload: { paid: boolean };
      returnValue: boolean;
    }>;
    "data-warning": SheetDefinition;
    "session-recap": SheetDefinition;
    "streak-journey": SheetDefinition;
    "no-purchase": SheetDefinition<{
      payload: { email: string | null };
      returnValue: "purchase" | "free" | "switch";
    }>;
  }
}

export const AppSheets = () => (
  <SheetRegister
    sheets={{
      "exercise-picker": ExercisePickerSheet,
      "exercise-info": ExerciseInfoSheet,
      "session-detail": SessionDetailSheet,
      "log-bodyweight": LogBodyweightSheet,
      "weigh-in-guide": WeighInGuideSheet,
      "reminder-config": ReminderSheet,
      "export-data": ExportSheet,
      feedback: FeedbackSheet,
      "reset-confirm": ResetConfirmSheet,
      "data-warning": DataWarningSheet,
      "session-recap": RecapSheet,
      "streak-journey": StreakJourneySheet,
      "no-purchase": NoPurchaseSheet,
    }}
  />
);
