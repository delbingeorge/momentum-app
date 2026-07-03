import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Every scheduled notification must pass this as its trigger `channelId`.
// Without it, Android delivers backgrounded notifications through a fallback
// channel with heads-up disabled — so they only surface while the app is open
// (the foreground handler force-shows them). See expo/expo#30762.
export const NOTIFICATION_CHANNEL_ID = "momentum";

export const ensureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: "Momentum",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
};

type NotificationPermission = "granted" | "denied" | "unsupported";

export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!Device.isDevice) return "unsupported";
    await ensureNotificationChannel();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return "granted";
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? "granted" : "denied";
  };
