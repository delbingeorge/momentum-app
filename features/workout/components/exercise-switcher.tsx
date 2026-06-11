import { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import type { ExerciseInstance, WorkoutLog } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

interface ExerciseSwitcherProps {
  exList: ExerciseInstance[];
  log: WorkoutLog;
  current: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

export const ExerciseSwitcher = ({
  exList,
  log,
  current,
  onSelect,
  onAdd,
}: ExerciseSwitcherProps) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: Math.max(0, current * 52 - 100),
      animated: true,
    });
  }, [current]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 py-3"
    >
      {exList.map((exercise, index) => {
        const on = index === current;
        const sets = log[exercise.id] ?? [];
        const exerciseDone = sets.length > 0 && sets.every((set) => set.done);
        return (
          <PressableScale
            key={exercise.id}
            onPress={() => onSelect(index)}
            className={cn(
              "flex-row items-center gap-1.5 rounded-full px-3.5 py-2",
              on ? "bg-lime" : "bg-card",
            )}
          >
            {exerciseDone ? (
              <Icon
                name="check"
                size={12}
                color={on ? COLORS.limeText : COLORS.lime}
                strokeWidth={3}
              />
            ) : null}
            <Text
              className={cn(
                "font-sans-semibold text-[13px]",
                on ? "text-lime-text" : exerciseDone ? "text-lime" : "text-mut",
              )}
            >
              {index + 1}
            </Text>
          </PressableScale>
        );
      })}
      <PressableScale
        onPress={onAdd}
        className="flex-row items-center gap-1 rounded-full border border-dashed border-line2 bg-card px-3 py-2"
      >
        <Icon name="plus" size={14} color={COLORS.lime} strokeWidth={2.6} />
        <Text className="font-sans-semibold text-[13px] text-mut">Add</Text>
      </PressableScale>
      <View className="w-1" />
    </ScrollView>
  );
};
