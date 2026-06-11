import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import { Icon, PressableScale } from "@/shared/ui";

interface WorkoutHeaderProps {
  dayName: string;
  elapsed: number;
  totalDone: number;
  totalSets: number;
  onMinimize: () => void;
}

export const WorkoutHeader = ({
  dayName,
  elapsed,
  totalDone,
  totalSets,
  onMinimize,
}: WorkoutHeaderProps) => {
  const pct = Math.round((totalDone / Math.max(1, totalSets)) * 100);
  return (
    <View className="px-4 pb-2.5 pt-1.5">
      <View className="flex-row items-center justify-between">
        <PressableScale
          onPress={onMinimize}
          className="h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Icon name="x" size={20} strokeWidth={2.4} />
        </PressableScale>
        <View className="items-center">
          <Text className="font-sans-bold text-[15px] text-text">
            {dayName}
          </Text>
          <Text className="mt-px font-mono text-[11px] text-faint">
            <Text className="text-lime">{fmtDur(elapsed)}</Text> · {totalDone}/
            {totalSets} sets
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-card">
          <Text className="font-mono text-xs text-lime">{pct}%</Text>
        </View>
      </View>
      <View className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <View
          className="h-full rounded-full bg-lime"
          style={{ width: `${(totalDone / Math.max(1, totalSets)) * 100}%` }}
        />
      </View>
    </View>
  );
};
