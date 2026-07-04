import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, CtaButton } from "@/shared/ui";

import { openStoreListing } from "../lib/store-link";

export const AppUpdateSheet = ({
  sheetId,
  payload,
}: SheetProps<"app-update">) => {
  const dismissUpdatePrompt = useSettingsStore(
    (state) => state.dismissUpdatePrompt,
  );
  const isForce = payload?.mode === "force";

  const update = () => {
    void openStoreListing();
    // For a soft prompt, remember we handled this version so we don't nag
    // again. A force gate stays put — the old build must not keep running.
    if (!isForce) {
      dismissUpdatePrompt(payload?.latestVersion ?? "");
      void SheetManager.hide(sheetId);
    }
  };

  const later = () => {
    dismissUpdatePrompt(payload?.latestVersion ?? "");
    void SheetManager.hide(sheetId);
  };

  return (
    <BaseSheet sheetId={sheetId} dismissible={!isForce}>
      <View className="items-center px-6 pt-6">
        <Text className="text-4xl">🚀</Text>
        <Text className="mt-4 font-sans-bold text-2xl tracking-tight text-text">
          {isForce ? "Update required" : "A new version is out"}
        </Text>
        <Text className="mt-2 text-center font-sans text-base leading-6 text-mut">
          {isForce
            ? "This version of Momentum is no longer supported. Update to keep tracking your workouts."
            : "We’ve shipped improvements and fixes. Grab the latest build for the best experience."}
        </Text>
      </View>
      <View className="gap-3 px-5 pt-7">
        <CtaButton label="Update now" onPress={update} />
        {isForce ? null : (
          <CtaButton label="Later" variant="white" onPress={later} />
        )}
      </View>
    </BaseSheet>
  );
};
