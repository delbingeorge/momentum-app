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

const ANDROID_CHANNEL = "momentum";

export const ensureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: "Momentum",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
};

export type NotificationPermission = "granted" | "denied" | "unsupported";

export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!Device.isDevice) return "unsupported";
    await ensureNotificationChannel();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return "granted";
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? "granted" : "denied";
  };
