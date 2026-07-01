import type { Href } from "expo-router";

export interface LaunchRouteState {
  user: boolean;
  welcomeBackPending: boolean;
  hasPlan: boolean;
}

// Single source of truth for launch-time routing. The index gate consumes this
// declaratively; imperative flows derive their destinations from the same rule
// so there is one place that decides where a user belongs on launch.
export const resolveLaunchRoute = (state: LaunchRouteState): Href => {
  // sign-in is required for everyone: a signed-out launch always starts there,
  // paid or not. Entitlement no longer gates access, only how much is retained.
  if (!state.user) return "/sign-in";
  // no plan means a fresh sign-up with nothing to resume: skip welcome-back
  // (it greets returning members) and start onboarding
  if (!state.hasPlan) return "/onboarding/goal";
  // greet only when a sign-in armed the intent; a plain cold launch leaves
  // this false and resumes straight into the app
  if (state.welcomeBackPending) return "/welcome-back";
  return "/(tabs)";
};
