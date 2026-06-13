import { Redirect } from "expo-router";
import { View } from "react-native";

import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useAuthStore, useLaunchStore, usePlanStore } from "@/shared/stores";

export default function Index() {
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const isPaid = useAuthStore((state) => state.isPaid);
  const welcomeBackSeen = useLaunchStore((state) => state.welcomeBackSeen);
  const hasPlan = usePlanStore(
    (state) =>
      Boolean(state.goal) &&
      Boolean(state.level) &&
      Boolean(state.gender) &&
      Boolean(state.splitId) &&
      Boolean(state.schedule?.length),
  );

  if (!hydrated) return <View className="flex-1 bg-bg" />;
  if (!user) return <Redirect href="/sign-in" />;
  // only paid members stay signed in — gate catches lapsed entitlements and
  // sessions left behind by a cancelled purchase
  if (!isPaid)
    return <Redirect href={{ pathname: "/paywall", params: { gate: "1" } }} />;
  // greet every returning paid member once per launch, before the plan gate
  // so users with and without a plan both land on welcome-back
  if (!welcomeBackSeen) return <Redirect href="/welcome-back" />;
  if (!hasPlan) return <Redirect href="/onboarding/goal" />;
  return <Redirect href="/(tabs)" />;
}
