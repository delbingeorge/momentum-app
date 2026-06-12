import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { weekStreak } from "@/shared/lib/streaks";
import { useWorkoutStore } from "@/shared/stores";
import { Icon } from "@/shared/ui";
import { PressableScale } from "@/shared/ui/pressable-scale";

export const BrandBar = () => {
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const streak = weekStreak(sessionDates);

  return (
    <View className="flex-row items-center justify-between px-5 pb-3.5 pt-1">
      <View className="flex-row items-center gap-2.5">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-lime">
          <Icon
            name="logo"
            size={18}
            color={COLORS.limeText}
            strokeWidth={2.2}
          />
        </View>
        <Text className="font-sans-extrabold text-xl tracking-tight text-text">
          Momentum
        </Text>
      </View>
      <PressableScale
        onPress={() => SheetManager.show("streak-journey")}
        className="flex-row items-center gap-1.5 rounded-full bg-card py-1.5 pl-2.5 pr-3"
      >
        <Icon name="fire" size={15} color={COLORS.lime} />
        <Text className="font-mono text-[12.5px] text-text">{streak}</Text>
      </PressableScale>
    </View>
  );
};
