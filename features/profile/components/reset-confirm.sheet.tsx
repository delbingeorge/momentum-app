import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { BaseSheet, Icon, PressableScale } from "@/shared/ui";

export const ResetConfirmSheet = ({
  sheetId,
  payload,
}: SheetProps<"reset-confirm">) => {
  const close = (confirmed: boolean) =>
    SheetManager.hide(sheetId, { payload: confirmed });

  return (
    <BaseSheet height="40%" sheetId={sheetId} title="Erase everything?">
      <View className="flex-col gap-5 px-5 py-2">
        <Text className="font-sans text-[14px] leading-5 text-mut">
          This wipes your plan, workouts, bodyweight and history on this device
          {payload?.paid
            ? ", and deletes your synced cloud data too. You stay signed in, but this can't be undone."
            : ". This can't be undone."}
        </Text>
        <View className="gap-3">
          <PressableScale
            onPress={() => close(true)}
            className="h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-danger"
          >
            <Icon name="rotate" size={18} color={COLORS.bg} strokeWidth={2.4} />
            <Text className="font-sans-bold text-[15px] text-bg">
              Erase everything
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => close(false)}
            className="h-[52px] items-center justify-center rounded-full bg-card2"
          >
            <Text className="font-sans-semibold text-[15px] text-text">
              Cancel
            </Text>
          </PressableScale>
        </View>
      </View>
    </BaseSheet>
  );
};
