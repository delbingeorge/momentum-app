import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { BaseSheet, CtaButton, PressableScale } from "@/shared/ui";

export const NoPurchaseSheet = ({
  sheetId,
  payload,
}: SheetProps<"no-purchase">) => {
  const choose = (choice: "purchase" | "free" | "switch") =>
    SheetManager.hide(sheetId, { payload: choice });

  return (
    <BaseSheet height="40%" sheetId={sheetId} title="No purchase found">
      <View className="flex-col items-center gap-3 py-2">
        <Text className="-mt-1 px-5 pb-5 font-sans text-[13.5px] leading-5 text-mut">
          {payload?.email ?? "This Google account"} doesn't have a Momentum
          purchase yet. Unlock once to sync and keep your full history, or keep
          training for free on this device.
        </Text>
        <View className="gap-3 px-5 w-full">
          <CtaButton
            label="Unlock Momentum"
            icon="zap"
            onPress={() => choose("purchase")}
          />
          <PressableScale className="py-4" onPress={() => choose("free")}>
            <Text className="text-center font-sans-semibold text-[15px] text-mut">
              Use for free
            </Text>
          </PressableScale>
        </View>
      </View>
    </BaseSheet>
  );
};
