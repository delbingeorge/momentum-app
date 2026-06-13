import { Redirect } from "expo-router";
import { View } from "react-native";

import { useHydrated } from "@/shared/hooks/use-hydrated";
import { resolveLaunchRoute } from "@/shared/lib/auth-route";
import { isPlanComplete } from "@/shared/lib/plan-route";
import { useAuthStore, useLaunchStore, usePlanStore } from "@/shared/stores";

export default function Index() {
  const hydrated = useHydrated();
  const user = useAuthStore((state) => Boolean(state.user));
  const isPaid = useAuthStore((state) => state.isPaid);
  const welcomeBackSeen = useLaunchStore((state) => state.welcomeBackSeen);
  const hasPlan = usePlanStore(isPlanComplete);

  if (!hydrated) return <View className="flex-1 bg-bg" />;
  return (
    <Redirect
      href={resolveLaunchRoute({ user, isPaid, welcomeBackSeen, hasPlan })}
    />
  );
}
