import { useBodyStore } from "./body-store";
import { usePlanStore } from "./plan-store";
import { useSettingsStore } from "./settings-store";
import { useSyncStore } from "./sync-store";
import { useWorkoutStore } from "./workout-store";

// Wipe all per-user local data at an identity boundary (sign out, continue
// free). Auth is reset separately by callers that also drop the session.
export const clearLocalData = () => {
  useWorkoutStore.getState().resetWorkouts();
  useBodyStore.getState().resetBody();
  usePlanStore.getState().resetPlan();
  useSettingsStore.getState().resetSettings();
  useSyncStore.getState().resetSync();
};
