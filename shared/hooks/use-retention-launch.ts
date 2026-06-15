import { useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";
import { SheetManager } from "react-native-actions-sheet";

import { useRetentionWarning } from "@/shared/hooks/use-retention-warning";
import { wipeExpiredWorkoutLog } from "@/shared/lib/retention";
import { scheduleRetentionWarning } from "@/shared/lib/retention-notification";
import { useAuthStore, useLaunchStore } from "@/shared/stores";

// Free-tier data-retention lifecycle, run once from the root layout: prune data
// past the window, (re)arm the 7-day warning notification, and surface the
// warning sheet once per launch when deletion is near.
export const useRetentionLaunch = (): void => {
  const isPaid = useAuthStore((state) => state.isPaid);
  const navigationKey = useRootNavigationState()?.key;
  const segments = useSegments();
  const { show } = useRetentionWarning();
  const seen = useLaunchStore((state) => state.dataWarningSeen);

  // prune + reschedule on launch, and again whenever entitlement settles
  useEffect(() => {
    wipeExpiredWorkoutLog();
    void scheduleRetentionWarning();
  }, [isPaid]);

  // surface the sheet once per launch, only on the main tabs so it never
  // interrupts sign-in, paywall, or onboarding
  useEffect(() => {
    if (!navigationKey || !show || seen) return;
    if (segments[0] !== "(tabs)") return;
    useLaunchStore.getState().markDataWarningSeen();
    void SheetManager.show("data-warning");
  }, [navigationKey, show, seen, segments]);
};
