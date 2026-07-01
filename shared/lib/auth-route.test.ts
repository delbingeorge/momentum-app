import { resolveLaunchRoute } from "./auth-route";

describe("resolveLaunchRoute", () => {
  const settled = {
    user: true,
    welcomeBackPending: false,
    hasPlan: true,
  };

  it("sends a signed-out user to sign-in, even with a plan", () => {
    expect(resolveLaunchRoute({ ...settled, user: false })).toBe("/sign-in");
    expect(
      resolveLaunchRoute({ ...settled, user: false, hasPlan: false }),
    ).toBe("/sign-in");
  });

  it("routes a signed-in member without a plan into onboarding", () => {
    expect(resolveLaunchRoute({ ...settled, hasPlan: false })).toBe(
      "/onboarding/goal",
    );
  });

  it("greets a member when sign-in armed the welcome-back intent", () => {
    expect(resolveLaunchRoute({ ...settled, welcomeBackPending: true })).toBe(
      "/welcome-back",
    );
  });

  it("resumes a member straight into the app on a plain cold launch", () => {
    expect(resolveLaunchRoute(settled)).toBe("/(tabs)");
  });

  it("skips welcome-back for a fresh sign-up with no plan", () => {
    expect(
      resolveLaunchRoute({
        ...settled,
        welcomeBackPending: true,
        hasPlan: false,
      }),
    ).toBe("/onboarding/goal");
  });

  it("prioritises auth, then plan, then greeting", () => {
    expect(
      resolveLaunchRoute({
        user: false,
        welcomeBackPending: true,
        hasPlan: false,
      }),
    ).toBe("/sign-in");
  });
});
