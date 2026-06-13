import type { Href } from "expo-router";

export interface LaunchRouteState {
  user: boolean;
  isPaid: boolean;
  welcomeBackSeen: boolean;
  hasPlan: boolean;
}

const GATE_PAYWALL: Href = { pathname: "/paywall", params: { gate: "1" } };

// Single source of truth for launch-time routing. The index gate consumes this
// declaratively; imperative flows derive their destinations from the same rule
// so there is one place that decides where a user belongs on launch.
export const resolveLaunchRoute = (state: LaunchRouteState): Href => {
  if (!state.user) return "/sign-in";
  // paid-only sign-in invariant: a signed-in member must be paying
  if (!state.isPaid) return GATE_PAYWALL;
  if (!state.welcomeBackSeen) return "/welcome-back";
  if (!state.hasPlan) return "/onboarding/goal";
  return "/(tabs)";
};
