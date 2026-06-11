import { router } from "expo-router";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { useBodyStore, usePlanStore, useWorkoutStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

// TODO(octane): remove DevControls once the onboarding funnel lands in step 4
const DevControls = () => {
  const plan = usePlanStore();
  const seedWorkouts = useWorkoutStore((state) => state.seedIfEmpty);
  const resetWorkouts = useWorkoutStore((state) => state.resetWorkouts);
  const seedBody = useBodyStore((state) => state.seedIfEmpty);
  const resetBody = useBodyStore((state) => state.resetBody);

  const buildPlan = () => {
    plan.setGoal("muscle");
    plan.setLevel("intermediate");
    plan.setGender("male");
    const schedule = usePlanStore.getState().confirmSplit();
    seedWorkouts(schedule, usePlanStore.getState().days);
    seedBody("muscle");
    router.replace("/");
  };

  const reset = () => {
    plan.resetPlan();
    resetWorkouts();
    resetBody();
  };

  return (
    <View className="flex-row justify-center gap-4">
      {[
        ["dev: set goal", () => plan.setGoal("muscle")] as const,
        ["dev: build plan", buildPlan] as const,
        ["dev: reset", reset] as const,
      ].map(([label, onPress]) => (
        <PressableScale key={label} onPress={onPress}>
          <Text className="font-mono text-xs text-faint">{label}</Text>
        </PressableScale>
      ))}
    </View>
  );
};

export default function WelcomeScreen() {
  return (
    <Screen className="justify-between px-6 pb-4 pt-16">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-lime">
          <Icon
            name="logo"
            size={24}
            color={COLORS.limeText}
            strokeWidth={2.4}
          />
        </View>
        <Text className="font-sans-extrabold text-2xl tracking-tight text-text">
          Momentum
        </Text>
      </View>

      <View className="gap-3">
        <Text className="font-sans-extrabold text-4xl tracking-tight text-text">
          Train smarter.{"\n"}Keep momentum.
        </Text>
        <Text className="font-sans text-lg text-mut">
          Personalized workout programs, smart progression, and progress
          tracking — all in one place.
        </Text>
      </View>

      <View className="gap-4">
        <DevControls />
        <CtaButton label="Get started" icon="zap" onPress={() => {}} />
      </View>
    </Screen>
  );
}
