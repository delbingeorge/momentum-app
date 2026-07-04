import {
  type SheetDefinition,
  SheetRegister,
} from "react-native-actions-sheet";

import { RecapSheet } from "@/features/home";
import {
  ExportSheet,
  FeedbackSheet,
  ReminderSheet,
  ResetConfirmSheet,
  ReviewSheet,
} from "@/features/profile";
import {
  BodyweightHistorySheet,
  LogBodyweightSheet,
  SessionDetailSheet,
  StreakJourneySheet,
  WeighInGuideSheet,
} from "@/features/progress";
import { AppUpdateSheet } from "@/features/update";
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
    "bodyweight-history": SheetDefinition;
    "weigh-in-guide": SheetDefinition;
    "reminder-config": SheetDefinition;
    "export-data": SheetDefinition;
    feedback: SheetDefinition;
    "reset-confirm": SheetDefinition<{
      payload: { paid: boolean };
      returnValue: boolean;
    }>;
    review: SheetDefinition;
    "session-recap": SheetDefinition<{
      payload: { session: SessionRecord };
    }>;
    "streak-journey": SheetDefinition;
    "app-update": SheetDefinition<{
      payload: { mode: "soft" | "force"; latestVersion: string };
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
      "bodyweight-history": BodyweightHistorySheet,
      "weigh-in-guide": WeighInGuideSheet,
      "reminder-config": ReminderSheet,
      "export-data": ExportSheet,
      feedback: FeedbackSheet,
      "reset-confirm": ResetConfirmSheet,
      review: ReviewSheet,
      "session-recap": RecapSheet,
      "streak-journey": StreakJourneySheet,
      "app-update": AppUpdateSheet,
    }}
  />
);
