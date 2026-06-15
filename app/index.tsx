import { Redirect } from "expo-router";

import { resolveLaunchRoute } from "@/shared/lib/auth-route";
import { isPlanComplete } from "@/shared/lib/plan-route";
import { useAuthStore, useLaunchStore, usePlanStore } from "@/shared/stores";

// MMKV is synchronous, so persisted stores are already hydrated on first render
// and the launch route resolves against real state with no gate.
export default function Index() {
  const user = useAuthStore((state) => Boolean(state.user));
  const isPaid = useAuthStore((state) => state.isPaid);
  const welcomeBackSeen = useLaunchStore((state) => state.welcomeBackSeen);
  const hasPlan = usePlanStore(isPlanComplete);

  return (
    <Redirect
      href={resolveLaunchRoute({ user, isPaid, welcomeBackSeen, hasPlan })}
    />
  );
}
