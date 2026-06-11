import { Stack } from "expo-router";

import { COLORS } from "@/shared/lib/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    />
  );
}
