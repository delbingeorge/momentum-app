import { router } from "expo-router";
import { View } from "react-native";

import { GOALS } from "@/shared/lib/program";
import { usePlanStore } from "@/shared/stores";
import { CtaButton, OptionCard } from "@/shared/ui";

import { OnboardingShell } from "./onboarding-shell";

export const GoalScreen = () => {
  const goal = usePlanStore((state) => state.goal);
  const setGoal = usePlanStore((state) => state.setGoal);

  return (
    <OnboardingShell
      step={0}
      title="What's your goal?"
      sub="We'll shape your volume, rep ranges and rest around this."
      onBack={router.canGoBack() ? () => router.back() : undefined}
      footer={
        <CtaButton
          label="Continue"
          icon="chevR"
          disabled={!goal}
          onPress={() => router.push("/onboarding/experience")}
        />
      }
    >
      <View className="gap-3 pb-2">
        {GOALS.map((option) => (
          <OptionCard
            key={option.id}
            selected={goal === option.id}
            onPress={() => setGoal(option.id)}
            icon={option.icon}
            title={option.name}
            blurb={option.blurb}
          />
        ))}
      </View>
    </OnboardingShell>
  );
};
