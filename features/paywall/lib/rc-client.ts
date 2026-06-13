import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";

import { env } from "@/shared/lib/env";

// Shared RevenueCat access seam. Keeping the dynamic import, key lookup, and
// "configured" flag in one place lets both the purchases API and the
// entitlement reconciler use them, and gives tests a single module to mock.

export const ENTITLEMENT_ID = "Momentum Premium";

export const apiKey = (): string | undefined =>
  (Platform.OS === "ios"
    ? env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY) ?? env.EXPO_PUBLIC_REVENUECAT_KEY;

// Dynamic import keeps Expo Go (no native module) from crashing at load
export const getPurchases = async () => {
  if (!apiKey()) return null;
  try {
    const { default: Purchases } = await import("react-native-purchases");
    return Purchases;
  } catch {
    return null;
  }
};

export const hasPremium = (info: CustomerInfo): boolean =>
  ENTITLEMENT_ID in info.entitlements.active;

let configured = false;
export const isConfigured = (): boolean => configured;
export const markConfigured = (): void => {
  configured = true;
};
