import * as Notifications from "expo-notifications";

import {
  ensureNotificationChannel,
  NOTIFICATION_CHANNEL_ID,
} from "@/shared/lib/notifications";
import { cycleWipeTs, RETENTION_WARN_DAYS } from "@/shared/lib/retention";
import { useAuthStore, useWorkoutStore } from "@/shared/stores";

const WARN_ID = "retention-warning";
const DAY_MS = 86400000;

const TITLE = "Workout history resets today";
const BODY =
  "Your workout data for the past 8 weeks is ready to be wiped today. Upgrade to Premium to keep it, or continue with a new workout cycle.";

export const cancelRetentionWarning = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(WARN_ID).catch(
    () => undefined,
  );
};

// One-shot local notification on the final day of the cycle, just before the
// wipe. Paid users and an empty log cancel it. Re-armed every launch so it
// tracks the cycle; a fire time already past is skipped (the wipe runs and the
// in-app surfaces cover it).
export const scheduleRetentionWarning = async (): Promise<void> => {
  await cancelRetentionWarning();
  if (useAuthStore.getState().isPaid) return;

  const wipeAt = cycleWipeTs(useWorkoutStore.getState().pastSessions);
  if (wipeAt === null) return;

  const fireAt = wipeAt - RETENTION_WARN_DAYS * DAY_MS;
  if (fireAt - Date.now() <= 0) return;

  await ensureNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: WARN_ID,
    content: { title: TITLE, body: BODY },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });
};
