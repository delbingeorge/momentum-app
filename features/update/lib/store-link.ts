import { Linking, Platform } from "react-native";
import * as StoreReview from "expo-store-review";

// TODO: fill in once the app is live on the App Store (numeric Apple app id).
// Until then iOS falls back to StoreReview.storeUrl() (ios.appStoreUrl in
// app.json), then this generic bundle-id link.
const IOS_APP_STORE_URL =
  "itms-apps://apps.apple.com/app/id0000000000";
const ANDROID_STORE_URL =
  "market://details?id=com.octane.momentum";
const ANDROID_WEB_URL =
  "https://play.google.com/store/apps/details?id=com.octane.momentum";

// Open the app's store listing so the user can grab the new build.
export const openStoreListing = async (): Promise<void> => {
  const primary = StoreReview.storeUrl();
  const fallback = Platform.select({
    ios: IOS_APP_STORE_URL,
    android: ANDROID_STORE_URL,
    default: ANDROID_WEB_URL,
  });
  const target = primary ?? fallback;
  try {
    await Linking.openURL(target);
  } catch {
    // market:// can be missing on some Android setups — retry via web.
    if (Platform.OS === "android") {
      await Linking.openURL(ANDROID_WEB_URL).catch(() => {});
    }
  }
};
