import * as Notifications from "expo-notifications";

import { randomRestQuote } from "@/shared/lib/motivational-quotes";
import {
  ensureNotificationChannel,
  NOTIFICATION_CHANNEL_ID,
} from "@/shared/lib/notifications";

const DONE_ID = "rest-done";

// Fires "rest complete" at the end time even if the app is backgrounded;
// the OS owns the timing, not our JS interval. Takes the absolute end
// timestamp (not a duration) so the lead time is derived right before
// enqueue — the channel/cancel awaits above can take tens of ms, and anchoring
// to endAt keeps delivery aligned with the on-screen timer instead of drifting
// later by that latency. TIME_INTERVAL fires far more precisely than a short
// DATE/calendar trigger on iOS.
export const startRestNotification = async (endAt: number): Promise<void> => {
  try {
    await ensureNotificationChannel();
    await Notifications.cancelScheduledNotificationAsync(DONE_ID);
    const seconds = Math.max(1, Math.round((endAt - Date.now()) / 1000));
    await Notifications.scheduleNotificationAsync({
      identifier: DONE_ID,
      content: { title: "Rest complete", body: randomRestQuote() },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
  } catch (error) {
    // best-effort; workout flow must never break on notification errors
    console.warn("rest notification schedule failed:", error);
  }
};

export const clearRestNotification = async (): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(DONE_ID);
  } catch (error) {
    // best-effort; workout flow must never break on notification errors
    console.warn("rest notification clear failed:", error);
  }
};
