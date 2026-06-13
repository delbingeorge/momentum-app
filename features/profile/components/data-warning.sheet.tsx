import { router } from "expo-router";
import { Text, View } from "react-native";
import { type SheetProps, SheetManager } from "react-native-actions-sheet";

import { PressableScale } from "@/shared/ui/pressable-scale";
import { useRetentionWarning } from "@/shared/hooks/use-retention-warning";
import { startNewCycle } from "@/shared/lib/retention";
import { BaseSheet, CtaButton } from "@/shared/ui";

export const DataWarningSheet = ({ sheetId }: SheetProps<"data-warning">) => {
  const { count } = useRetentionWarning();
  const workouts = count === 1 ? "1 workout" : `${count} workouts`;

  const upgrade = () => {
    void SheetManager.hide(sheetId);
    router.push("/paywall");
  };

  const newCycle = () => {
    startNewCycle();
    void SheetManager.hide(sheetId);
  };

  return (
    <BaseSheet sheetId={sheetId} title="Your 8-week cycle is ending">
      <View className="gap-5 px-5 pb-4 pt-1">
        <Text className="font-sans text-[15px] leading-[22px] text-mut">
          Your workout history for the past 8 weeks ({workouts}) is ready to be
          wiped today. Upgrade to Premium to keep it forever, or continue with a
          fresh workout cycle.
        </Text>
        <Text className="font-sans text-[15px] leading-[22px] text-mut">
          Either way your plan, split and working weights stay. Only the logged
          workouts are cleared.
        </Text>
        <View className="gap-3">
          <CtaButton label="Keep my history" icon="zap" onPress={upgrade} />
          <PressableScale
            className="items-center justify-center py-2"
            onPress={newCycle}
          >
            <Text className="text-center font-sans-semibold text-[15px] text-text">
              Start new cycle
            </Text>
          </PressableScale>
        </View>
      </View>
    </BaseSheet>
  );
};
