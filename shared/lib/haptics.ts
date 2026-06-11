import * as ExpoHaptics from "expo-haptics";

import { useSettingsStore } from "@/shared/stores";

const fire = (effect: () => Promise<void>) => {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void effect().catch(() => {});
};

export const haptics = {
  tap: () =>
    fire(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)),

  select: () => fire(() => ExpoHaptics.selectionAsync()),

  success: () =>
    fire(() =>
      ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Success,
      ),
    ),

  warning: () =>
    fire(() =>
      ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Warning,
      ),
    ),

  timerDone: () =>
    fire(async () => {
      await ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Success,
      );
      await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
    }),
};
