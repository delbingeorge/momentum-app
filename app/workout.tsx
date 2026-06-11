import { router } from "expo-router";
import { Text } from "react-native";

import { CtaButton, Screen } from "@/shared/ui";

export default function WorkoutRoute() {
  return (
    <Screen className="items-center justify-center gap-4 px-6">
      <Text className="font-sans-bold text-xl text-text">Workout session</Text>
      <Text className="font-sans text-base text-mut">Coming in step 6</Text>
      <CtaButton
        label="Minimize"
        onPress={() => router.back()}
        className="self-stretch"
      />
    </Screen>
  );
}
