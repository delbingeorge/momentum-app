import { router } from "expo-router";
import { View } from "react-native";

import { LEVELS } from "@/shared/lib/program";
import { usePlanStore } from "@/shared/stores";
import { CtaButton, OptionCard } from "@/shared/ui";

import { OnboardingShell } from "./onboarding-shell";

export const ExperienceScreen = () => {
  const level = usePlanStore((state) => state.level);
  const setLevel = usePlanStore((state) => state.setLevel);

  return (
    <OnboardingShell
      step={1}
      title="What's your experience?"
      sub="We'll set starting loads and how fast we push them."
      onBack={() => router.back()}
      footer={
        <CtaButton
          label="Continue"
          icon="chevR"
          disabled={!level}
          onPress={() => router.push("/onboarding/about")}
        />
      }
    >
      <View className="gap-3 pb-2">
        {LEVELS.map((option) => (
          <OptionCard
            key={option.id}
            selected={level === option.id}
            onPress={() => setLevel(option.id)}
            icon={option.icon}
            title={option.name}
            blurb={option.blurb}
          />
        ))}
      </View>
    </OnboardingShell>
  );
};
