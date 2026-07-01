import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/shared/stores";

// Reactive enforcement of the sign-in-required invariant: signing out mid-
// session (or any state that clears the user) must bounce back to the sign-in
// screen without waiting for a cold start to re-hit the index gate.
export const useAuthGuard = (): void => {
  const router = useRouter();
  const segments = useSegments();
  const navigationKey = useRootNavigationState()?.key;
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // key is undefined until the root navigator mounts — never navigate before
    // then, or the replace is dropped during the splash/null-render window
    if (!navigationKey) return;
    if (!user && segments[0] !== "sign-in") {
      router.replace("/sign-in");
    }
  }, [navigationKey, user, segments, router]);
};
