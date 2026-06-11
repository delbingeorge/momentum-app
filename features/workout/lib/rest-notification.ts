import * as Notifications from "expo-notifications";

import { ensureNotificationChannel } from "@/shared/lib/notifications";

const DONE_ID = "rest-done";

// Fires "rest complete" at the end time even if the app is backgrounded —
// the OS owns the timing, not our JS interval.
export const startRestNotification = async (seconds: number): Promise<void> => {
  try {
    await ensureNotificationChannel();
    await Notifications.cancelScheduledNotificationAsync(DONE_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: DONE_ID,
      content: { title: "Rest complete 💪", body: "Time for your next set." },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + seconds * 1000),
      },
    });
  } catch {
    // best-effort — workout flow must never break on notification errors
  }
};

export const clearRestNotification = async (): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(DONE_ID);
  } catch {
    // ignore
  }
};
