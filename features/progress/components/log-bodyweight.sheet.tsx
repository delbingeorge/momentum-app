import { useState } from "react";
import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { KG_PER_LB } from "@/shared/lib/units";
import { useBodyStore, useSettingsStore } from "@/shared/stores";
import { BaseSheet, CtaButton, Icon, PressableScale } from "@/shared/ui";

export const LogBodyweightSheet = ({
  sheetId,
}: SheetProps<"log-bodyweight">) => {
  const weights = useBodyStore((state) => state.weights);
  const logWeight = useBodyStore((state) => state.logWeight);
  const unit = useSettingsStore((state) => state.unit);

  const lastKg = weights[weights.length - 1]?.kg ?? 70;
  const [draftKg, setDraftKg] = useState(lastKg);
  const step = unit === "kg" ? 0.5 : 1 / KG_PER_LB;
  const disp = (kg: number) =>
    unit === "kg"
      ? Math.round(kg * 10) / 10
      : Math.round(kg * KG_PER_LB * 10) / 10;

  return (
    <BaseSheet sheetId={sheetId} title="Log bodyweight">
      <View className="gap-5 px-5 pt-2">
        <View className="flex-row items-center justify-between rounded-[20px] bg-card p-4">
          <PressableScale
            onPress={() => setDraftKg((kg) => Math.max(20, kg - step))}
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
          >
            <Icon name="minus" size={20} strokeWidth={2.4} />
          </PressableScale>
          <View className="flex-row items-baseline gap-1.5">
            <Text className="font-sans-bold text-4xl tracking-tight text-text">
              {disp(draftKg)}
            </Text>
            <Text className="font-mono text-sm text-mut">{unit}</Text>
          </View>
          <PressableScale
            onPress={() => setDraftKg((kg) => Math.min(300, kg + step))}
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
          >
            <Icon name="plus" size={20} color={COLORS.lime} strokeWidth={2.4} />
          </PressableScale>
        </View>
        <PressableScale
          onPress={() => SheetManager.show("weigh-in-guide")}
          className="-mt-2 flex-row items-center justify-center gap-1.5"
        >
          <Icon name="info" size={14} color={COLORS.mut} strokeWidth={2} />
          <Text className="font-sans-semibold text-[12.5px] text-mut">
            How to weigh properly?
          </Text>
        </PressableScale>
        <CtaButton
          label="Save"
          icon="check"
          onPress={() => {
            logWeight(Math.round(draftKg * 10) / 10);
            SheetManager.hide(sheetId);
          }}
        />
      </View>
    </BaseSheet>
  );
};
