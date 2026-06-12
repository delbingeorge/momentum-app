import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { usePlanStore } from "@/shared/stores";
import type { ExerciseInstance } from "@/shared/types";
import { CtaButton, PressableScale } from "@/shared/ui";

import { ExerciseToggleRow } from "./exercise-toggle-row";
import { OnboardingShell } from "./onboarding-shell";

const shortDayName = (name: string) => name.replace(/ (day|body)/i, "");

export const ExerciseCustomizeScreen = () => {
  const schedule = usePlanStore((state) => state.schedule);
  const setSchedule = usePlanStore((state) => state.setSchedule);
  const setTodayIndex = usePlanStore((state) => state.setTodayIndex);
  const [activeDay, setActiveDay] = useState(0);

  if (!schedule?.length) return null;
  const day = schedule[Math.min(activeDay, schedule.length - 1)];
  if (!day) return null;

  const patchDay = (
    exerciseId: string,
    patch: (exercise: ExerciseInstance) => ExerciseInstance,
  ) =>
    setSchedule(
      schedule.map((entry, index) =>
        index !== activeDay
          ? entry
          : {
              ...entry,
              exercises: entry.exercises.map((exercise) =>
                exercise.id === exerciseId ? patch(exercise) : exercise,
              ),
            },
      ),
    );

  const toggle = (exerciseId: string) =>
    patchDay(exerciseId, (exercise) => ({ ...exercise, off: !exercise.off }));

  const bump = (exerciseId: string, delta: number) =>
    patchDay(exerciseId, (exercise) => ({
      ...exercise,
      sets: Math.max(1, Math.min(8, exercise.sets + delta)),
    }));

  const activeCount = day.exercises.filter((exercise) => !exercise.off).length;

  const finish = () => {
    setTodayIndex(0);
    // straight to tabs: "/" would bounce a signed-out user back to the sign-in gate
    router.replace("/(tabs)");
  };

  return (
    <OnboardingShell
      step={5}
      title="Tune your exercises"
      sub="Drop exercises or adjust sets. You can change this anytime."
      onBack={() => router.back()}
      footer={<CtaButton label="Finish setup" icon="check" onPress={finish} />}
      sticky={
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pb-3.5"
        >
          {schedule.map((entry, index) => {
            const on = index === activeDay;
            return (
              <PressableScale
                key={`${entry.key}-${index}`}
                onPress={() => setActiveDay(index)}
                className={cn(
                  "flex-row items-center gap-1.5 rounded-full px-4 py-2",
                  on ? "bg-white" : "bg-card",
                )}
              >
                <Text
                  className={cn(
                    "font-mono text-[11px]",
                    on ? "text-black/60" : "text-faint",
                  )}
                >
                  {entry.label}
                </Text>
                <Text
                  className={cn(
                    "font-sans-semibold text-[13px]",
                    on ? "text-black" : "text-mut",
                  )}
                >
                  {shortDayName(entry.name)}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      }
    >
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="font-sans-bold text-base text-text">{day.name}</Text>
        <Text className="font-mono text-[11px] text-faint">
          {activeCount} exercises · {day.dur} min
        </Text>
      </View>
      <View className="gap-2.5 pb-2">
        {day.exercises.map((exercise) => (
          <ExerciseToggleRow
            key={exercise.id}
            exercise={exercise}
            onToggle={() => toggle(exercise.id)}
            onBump={(delta) => bump(exercise.id, delta)}
          />
        ))}
      </View>
    </OnboardingShell>
  );
};
