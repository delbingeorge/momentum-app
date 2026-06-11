import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import type { ExerciseInstance } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

interface ExerciseToggleRowProps {
  exercise: ExerciseInstance;
  onToggle: () => void;
  onBump: (delta: number) => void;
}

export const ExerciseToggleRow = ({
  exercise,
  onToggle,
  onBump,
}: ExerciseToggleRowProps) => {
  const off = Boolean(exercise.off);
  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl bg-card py-3 pl-3.5 pr-3",
        off && "opacity-50",
      )}
    >
      <PressableScale
        onPress={onToggle}
        className={cn(
          "h-[21px] w-[21px] items-center justify-center rounded-md border-2",
          off ? "border-line2 bg-transparent" : "border-lime bg-lime",
        )}
      >
        {!off && (
          <Icon name="check" size={13} color={COLORS.limeText} strokeWidth={3} />
        )}
      </PressableScale>
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
