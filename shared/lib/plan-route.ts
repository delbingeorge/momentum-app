import { usePlanStore } from "@/shared/stores";

// Where a user lands based on plan progress — mirrors the index route guard
// so flows that route imperatively (sign-in, paywall) stay consistent with it
export const getPlanRoute = (): "/onboarding/goal" | "/(tabs)" => {
  const { goal, level, gender, splitId, schedule } = usePlanStore.getState();
  const hasPlan =
    Boolean(goal) &&
    Boolean(level) &&
    Boolean(gender) &&
    Boolean(splitId) &&
    Boolean(schedule?.length);
  if (!hasPlan) return "/onboarding/goal";
  return "/(tabs)";
};
