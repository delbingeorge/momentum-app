import { resolveLaunchRoute } from "./auth-route";

describe("resolveLaunchRoute", () => {
  const settled = {
    user: true,
    isPaid: true,
    welcomeBackPending: false,
    hasPlan: true,
  };

  it("resumes a signed-out guest with a plan into the app", () => {
    expect(resolveLaunchRoute({ ...settled, user: false })).toBe("/(tabs)");
  });

  it("sends a signed-out guest without a plan to sign-in", () => {
    expect(
      resolveLaunchRoute({ ...settled, user: false, hasPlan: false }),
    ).toBe("/sign-in");
  });

  it("gates signed-in unpaid users to the paywall", () => {
    expect(resolveLaunchRoute({ ...settled, isPaid: false })).toEqual({
      pathname: "/paywall",
      params: { gate: "1" },
    });
  });

  it("greets a paid member when sign-in armed the welcome-back intent", () => {
    expect(resolveLaunchRoute({ ...settled, welcomeBackPending: true })).toBe(
      "/welcome-back",
    );
  });

  it("resumes a paid member straight into the app on a plain cold launch", () => {
    expect(resolveLaunchRoute({ ...settled, welcomeBackPending: false })).toBe(
      "/(tabs)",
    );
  });

  it("routes paid members without a plan into onboarding", () => {
    expect(resolveLaunchRoute({ ...settled, hasPlan: false })).toBe(
      "/onboarding/goal",
    );
  });

  it("skips welcome-back for a fresh paid sign-up with no plan", () => {
    expect(
      resolveLaunchRoute({
        ...settled,
        welcomeBackPending: true,
        hasPlan: false,
      }),
    ).toBe("/onboarding/goal");
  });

  it("lands fully set-up members in the app", () => {
    expect(resolveLaunchRoute(settled)).toBe("/(tabs)");
  });

  it("prioritises auth, then entitlement, then plan", () => {
    expect(
      resolveLaunchRoute({
        user: false,
        isPaid: false,
        welcomeBackPending: false,
        hasPlan: false,
      }),
    ).toBe("/sign-in");
  });
});
