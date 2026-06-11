import { router } from "expo-router";
import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { usePlanStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale } from "@/shared/ui";

import { OnboardingShell } from "./onboarding-shell";

const DAY_OPTIONS = [2, 3, 4, 5, 6];

const DAY_NOTE: Record<number, string> = {
  2: "Minimal but effective — full-body focus.",
  3: "A balanced base. Plenty of recovery.",
  4: "The sweet spot for steady progress.",
  5: "Higher volume, faster results.",
  6: "Serious frequency for advanced lifters.",
};

export const DaysScreen = () => {
  const days = usePlanStore((state) => state.days);
  const setDays = usePlanStore((state) => state.setDays);

  return (
    <OnboardingShell
      step={3}
      title="How many days a week?"
      sub="Be honest about what you can sustain."
      onBack={() => router.back()}
      footer={
        <CtaButton
          label="Continue"
          icon="chevR"
          onPress={() => router.push("/onboarding/split")}
        />
      }
    >
      <View className="mt-1 flex-row gap-2.5">
        {DAY_OPTIONS.map((count) => {
          const selected = days === count;
          return (
            <PressableScale
              key={count}
              onPress={() => setDays(count)}
              className={cn(
                "h-[78px] flex-1 items-center justify-center rounded-[20px]",
                selected ? "bg-lime" : "bg-card",
              )}
            >
              <Text
                className={cn(
                  "font-sans-bold text-3xl",
                  selected ? "text-lime-text" : "text-text",
                )}
              >
                {count}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <View className="mt-6 flex-row items-center gap-3.5 rounded-[20px] bg-card px-5 py-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-lime-dim">
          <Icon name="activity" size={20} color={COLORS.lime} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[15px] text-text">
            {days} days per week
          </Text>
          <Text className="mt-0.5 font-sans text-[13px] leading-[18px] text-mut">
            {DAY_NOTE[days]}
          </Text>
        </View>
      </View>
    </OnboardingShell>
  );
};
