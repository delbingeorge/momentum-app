import { Text } from "react-native";

import { Screen } from "@/shared/ui";

// Placeholder — the real onboarding funnel lands in the next step
export default function GoalScreen() {
  return (
    <Screen className="items-center justify-center">
      <Text className="font-sans-bold text-xl text-text">
        Onboarding · Goal
      </Text>
      <Text className="font-sans text-base text-mut">Coming in step 4</Text>
    </Screen>
  );
}
