import { Linking, Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";
import * as StoreReview from "expo-store-review";

import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, CtaButton } from "@/shared/ui";

const STARS = [0, 1, 2, 3, 4];

export const ReviewSheet = ({ sheetId }: SheetProps<"review">) => {
  const completeReviewPrompt = useSettingsStore(
    (state) => state.completeReviewPrompt,
  );

  const rate = async () => {
    completeReviewPrompt();
    await SheetManager.hide(sheetId);
    // Native in-app review only works in store-distributed builds. In dev /
    // sideloaded builds the Play In-App Review API surfaces its own "server
    // error" dialog, so don't trigger it there.
    if (__DEV__) return;
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        return;
      }
    } catch (error) {
      console.warn("store review failed:", error);
    }
    // Fallback: open the store listing directly (uses the *StoreUrl in app.json).
    const url = StoreReview.storeUrl();
    if (url) Linking.openURL(url).catch(() => {});
  };

  const remindLater = () => SheetManager.hide(sheetId);

  return (
    <BaseSheet sheetId={sheetId}>
      <View className="items-center px-6 pt-5">
        <View className="flex-row gap-2">
          {STARS.map((star) => (
            <Text key={star} className="text-3xl text-lime">
              ★
            </Text>
          ))}
        </View>
        <Text className="mt-5 font-sans-bold text-2xl tracking-tight text-text">
          Enjoying Momentum?
        </Text>
        <Text className="mt-2 text-center font-sans text-base leading-6 text-mut">
          You just logged your first workout. A quick rating helps other lifters
          find the app.
        </Text>
      </View>
      <View className="gap-3 px-5 pt-7">
        <CtaButton label="Yes, love it!" onPress={rate} />
        <CtaButton
          label="Remind me later"
          variant="white"
          onPress={remindLater}
        />
      </View>
    </BaseSheet>
  );
};
