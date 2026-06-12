import * as Notifications from "expo-notifications";

import { quoteForDay } from "@/shared/lib/motivational-quotes";
import { ensureNotificationChannel } from "@/shared/lib/notifications";

import { fmt12, reminderSummary } from "./reminder-format";

const CONFIRM_ID = "reminder-confirm";
const DAILY_ID = "reminder-daily"; // legacy id; kept in ALL_IDS so old installs cancel cleanly
const perDayId = (day: number) => `reminder-day-${day}`;
const ALL_IDS = [CONFIRM_ID, DAILY_ID, ...[0, 1, 2, 3, 4, 5, 6].map(perDayId)];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const TITLE = "Time to train";

export const cancelReminder = async (): Promise<void> => {
  await Promise.all(
    ALL_IDS.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  );
};

// (Re)schedule the workout reminder: one weekly trigger per selected day, each
// with its own motivational quote (scheduled content is static, so per-day
// triggers are the only way to vary the copy). `confirm` fires a one-shot
// ~2s later so the user gets immediate proof the reminder is armed; pass
// false when re-arming silently on app launch.
export const scheduleReminder = async (
  time: string,
  days: number[],
  confirm = true,
): Promise<void> => {
  const selected = days.length ? [...days].sort((a, b) => a - b) : ALL_DAYS;
  const [hour = 18, minute = 0] = time.split(":").map(Number);

  await ensureNotificationChannel();
  await cancelReminder();

  await Promise.all(
    selected.map((day) =>
      Notifications.scheduleNotificationAsync({
        identifier: perDayId(day),
        content: { title: TITLE, body: quoteForDay(day) },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour,
          minute,
        },
      }),
    ),
  );

  if (confirm) {
    await Notifications.scheduleNotificationAsync({
      identifier: CONFIRM_ID,
      content: {
        title: "Reminder set",
        body: `${reminderSummary(selected)} at ${fmt12(time)}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }
};
