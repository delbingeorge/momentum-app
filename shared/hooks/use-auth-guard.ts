import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/shared/stores";

// Reactive enforcement of the paid-only sign-in invariant: a signed-in user who
// is not paying may only sit on the sign-in or paywall screens. Runs on every
// auth/entitlement/segment change, so a mid-session entitlement lapse or refund
// (reconciled when the app returns to the foreground) redirects to the paywall
// without waiting for a cold start to re-hit the index gate.
export const useAuthGuard = (): void => {
  const router = useRouter();
  const segments = useSegments();
  const navigationKey = useRootNavigationState()?.key;
  const user = useAuthStore((state) => state.user);
  const isPaid = useAuthStore((state) => state.isPaid);

  useEffect(() => {
    // key is undefined until the root navigator mounts — never navigate before
    // then, or the replace is dropped during the splash/null-render window
    if (!navigationKey) return;
    const root = segments[0];
    const inAuthArea = root === "sign-in" || root === "paywall";
    if (user && !isPaid && !inAuthArea) {
      router.replace({ pathname: "/paywall", params: { gate: "1" } });
    }
  }, [navigationKey, user, isPaid, segments, router]);
};
