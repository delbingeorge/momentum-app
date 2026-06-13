import { usePlanStore } from "@/shared/stores";

interface PlanProgress {
  goal: unknown;
  level: unknown;
  gender: unknown;
  splitId: unknown;
  schedule: unknown[] | null;
}

// Whether the user has finished plan setup. Used as a store selector and by the
// launch-route resolver so the "has a plan" check lives in one place.
export const isPlanComplete = (plan: PlanProgress): boolean =>
  Boolean(plan.goal) &&
  Boolean(plan.level) &&
  Boolean(plan.gender) &&
  Boolean(plan.splitId) &&
  Boolean(plan.schedule?.length);

// Where a user lands based on plan progress, for flows that route imperatively
// (sign-in, paywall, welcome-back) once auth and entitlement are already settled.
export const getPlanRoute = (): "/onboarding/goal" | "/(tabs)" =>
  isPlanComplete(usePlanStore.getState()) ? "/(tabs)" : "/onboarding/goal";
