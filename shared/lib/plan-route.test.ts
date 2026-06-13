import type { ScheduledDay } from "@/shared/types";
import { usePlanStore } from "@/shared/stores";

import { getPlanRoute } from "./plan-route";

const scheduledDay: ScheduledDay = {
  key: "pushA",
  name: "Push",
  sub: "Chest, shoulders, triceps",
  dur: 60,
  label: "Push",
  muscles: [],
  exercises: [],
};

const completePlan = {
  goal: "muscle" as const,
  level: "beginner" as const,
  gender: "male" as const,
  splitId: "ppl",
  schedule: [scheduledDay],
};

beforeEach(() => {
  usePlanStore.setState({
    goal: null,
    level: null,
    gender: null,
    splitId: null,
    schedule: null,
  });
});

describe("getPlanRoute", () => {
  it("routes to onboarding when the plan is incomplete", () => {
    expect(getPlanRoute()).toBe("/onboarding/goal");
  });

  it("routes to onboarding when only the schedule is missing", () => {
    usePlanStore.setState({ ...completePlan, schedule: null });
    expect(getPlanRoute()).toBe("/onboarding/goal");
  });

  it("routes to onboarding when the schedule is empty", () => {
    usePlanStore.setState({ ...completePlan, schedule: [] });
    expect(getPlanRoute()).toBe("/onboarding/goal");
  });

  it("routes to the tabs when the plan is complete", () => {
    usePlanStore.setState(completePlan);
    expect(getPlanRoute()).toBe("/(tabs)");
  });
});
