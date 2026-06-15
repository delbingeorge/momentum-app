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
  // signed-out guest (free tier): resume into the app once onboarding is done,
  // otherwise start at sign-in so a first launch still leads into the flow
  if (!state.user) return state.hasPlan ? "/(tabs)" : "/sign-in";
  // paid-only sign-in invariant: a signed-in member must be paying
  if (!state.isPaid) return GATE_PAYWALL;
  // no plan means a fresh sign-up with nothing to resume: skip welcome-back
  // (it greets returning members) and start onboarding
  if (!state.hasPlan) return "/onboarding/goal";
  if (!state.welcomeBackSeen) return "/welcome-back";
  return "/(tabs)";
};
