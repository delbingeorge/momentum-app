import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import type { ExerciseInstance } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

import { muscleGlyph } from "../lib/format";

interface ExercisePreviewRowProps {
  exercise: ExerciseInstance;
  onPress?: () => void;
}

export const ExercisePreviewRow = ({
  exercise,
  onPress,
}: ExercisePreviewRowProps) => (
  <PressableScale
    onPress={onPress}
    className="flex-row items-center gap-3 rounded-2xl border border-line bg-card px-3.5 py-3"
  >
    <View className="h-[46px] w-[46px] items-center justify-center rounded-xl border border-line bg-card2">
      <Icon
        name={muscleGlyph(exercise.muscle)}
        size={20}
        color="rgba(255,255,255,0.25)"
        strokeWidth={1.6}
      />
    </View>
    <View className="flex-1">
      <Text
        numberOfLines={1}
        className="font-sans-semibold text-[15.5px] tracking-tight text-text"
      >
        {exercise.name}
      </Text>
      <Text className="mt-0.5 font-mono text-[11px] text-faint">
        {exercise.sets} sets · {exercise.target} reps
      </Text>
    </View>
    <Icon name="chevR" size={18} color={COLORS.faint} />
  </PressableScale>
);
