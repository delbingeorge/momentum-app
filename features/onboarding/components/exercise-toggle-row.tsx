import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import type { ExerciseInstance } from "@/shared/types";
import { Checkbox, Icon, PressableScale } from "@/shared/ui";

interface ExerciseToggleRowProps {
  exercise: ExerciseInstance;
  onToggle: () => void;
  onBump: (delta: number) => void;
  onSwap?: () => void;
}

export const ExerciseToggleRow = ({
  exercise,
  onToggle,
  onBump,
  onSwap,
}: ExerciseToggleRowProps) => {
  const off = Boolean(exercise.off);
  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl bg-card py-3 pl-3.5 pr-3",
        off && "opacity-50",
      )}
    >
      <Checkbox checked={!off} onCheckedChange={onToggle} />
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={cn(
            "font-sans-semibold text-[15px] text-text",
            off && "line-through",
          )}
        >
          {exercise.name}
        </Text>
        <Text className="mt-0.5 font-mono text-[11px] text-faint">
          {exercise.muscle}
        </Text>
      </View>
      {onSwap ? (
        <PressableScale
          onPress={onSwap}
          className="h-7 w-7 items-center justify-center rounded-full bg-bg"
        >
          <Icon name="replace" size={14} color={COLORS.mut} strokeWidth={2} />
        </PressableScale>
      ) : null}
      <View className="flex-row items-center gap-0.5 rounded-full bg-bg p-0.5">
        <PressableScale
          onPress={() => onBump(-1)}
          className="h-7 w-7 items-center justify-center rounded-full"
        >
          <Icon name="minus" size={15} color={COLORS.mut} strokeWidth={2.4} />
        </PressableScale>
        <Text className="w-8 text-center font-mono text-[13px] text-text">
          {exercise.sets}×
        </Text>
        <PressableScale
          onPress={() => onBump(1)}
          className="h-7 w-7 items-center justify-center rounded-full"
        >
          <Icon name="plus" size={15} color={COLORS.lime} strokeWidth={2.4} />
        </PressableScale>
      </View>
    </View>
  );
};
