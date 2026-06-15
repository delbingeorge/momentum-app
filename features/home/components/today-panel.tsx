import { router } from "expo-router";
import { SheetManager } from "react-native-actions-sheet";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { usePlanStore, useWorkoutStore } from "@/shared/stores";
import { BrandBar, Icon } from "@/shared/ui";

import { DaySwitcher } from "./day-switcher";
import { RecapCard } from "./recap-card";
import { ExercisePreviewRow } from "./exercise-preview-row";
import { StartBar } from "./start-bar";

export const TodayPanel = () => {
  const schedule = usePlanStore((state) => state.schedule);
  const todayIndex = usePlanStore((state) => state.todayIndex);
  const setTodayIndex = usePlanStore((state) => state.setTodayIndex);
  const goal = usePlanStore((state) => state.goal);
  const level = usePlanStore((state) => state.level);
  const days = usePlanStore((state) => state.days);
  const active = useWorkoutStore((state) => state.active);
  const sinceDeload = useWorkoutStore((state) => state.sinceDeload);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);
  const discardWorkout = useWorkoutStore((state) => state.discardWorkout);
  const dropStaleActive = useWorkoutStore((state) => state.dropStaleActive);

  const scheduleLength = schedule?.length ?? 0;
  useEffect(() => {
    dropStaleActive(scheduleLength);
  }, [dropStaleActive, scheduleLength]);

  if (!schedule?.length) return null;
  const day = schedule[Math.min(todayIndex, schedule.length - 1)];
  if (!day) return null;

  const deloadDue = sinceDeload >= days * 4;

  const handleStart = () => {
    startWorkout(day, todayIndex, goal ?? "muscle", level ?? "intermediate", deloadDue);
    router.push("/workout");
  };

  const handleResume = () => {
    if (active) {
      setTodayIndex(active.dayIndex);
      router.push("/workout");
    }
  };

  return (
    <View className="flex-1">
      <BrandBar />
      <View className="px-5 pb-1.5">
        <Text className="font-sans-bold text-[27px] tracking-tight text-text">
          Today's workout
        </Text>
        <View className="mt-2.5 flex-row flex-wrap items-center gap-2">
          <DaySwitcher
            schedule={schedule}
            todayIndex={todayIndex}
            onSelect={setTodayIndex}
          />
          <Text className="font-sans-semibold text-[14.5px] text-mut">
            {day.name}
          </Text>
          <Text className="text-faint">·</Text>
          <Icon name="clock" size={15} color={COLORS.faint} />
          <Text className="font-sans text-[14.5px] text-mut">
            {day.dur} min
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-2">
        <RecapCard />
        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
          <Text className="font-mono text-[11px] uppercase tracking-wider text-faint">
            Exercises
          </Text>
          <Text className="font-mono text-[11px] text-faint">
            Tap for details
          </Text>
        </View>
        <View className="gap-2 px-4">
          {day.exercises
            .filter((exercise) => !exercise.off)
            .map((exercise) => (
              <ExercisePreviewRow
                key={exercise.id}
                exercise={exercise}
                onPress={() =>
                  SheetManager.show("exercise-info", { payload: { exercise } })
                }
              />
            ))}
        </View>
      </ScrollView>

      <StartBar
        hasActive={active !== null}
        onStart={handleStart}
        onResume={handleResume}
        onDiscard={discardWorkout}
      />
    </View>
  );
};
