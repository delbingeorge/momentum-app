import { Redirect } from "expo-router";
import { View } from "react-native";

import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useAuthStore, usePlanStore } from "@/shared/stores";

export default function Index() {
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const goal = usePlanStore((state) => state.goal);
  const hasPlan = usePlanStore(
    (state) =>
      Boolean(state.level) &&
      Boolean(state.gender) &&
      Boolean(state.splitId) &&
      Boolean(state.schedule?.length),
  );

  if (!hydrated) return <View className="flex-1 bg-bg" />;
  if (!user) return <Redirect href="/sign-in" />;
  if (!goal) return <Redirect href="/welcome" />;
  if (!hasPlan) return <Redirect href="/onboarding/goal" />;
  return <Redirect href="/(tabs)" />;
}
