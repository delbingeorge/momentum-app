import { resolveLaunchRoute } from "./auth-route";

describe("resolveLaunchRoute", () => {
  const settled = {
    user: true,
    isPaid: true,
    welcomeBackSeen: true,
    hasPlan: true,
  };

  it("sends signed-out users to sign-in", () => {
    expect(resolveLaunchRoute({ ...settled, user: false })).toBe("/sign-in");
  });

  it("gates signed-in unpaid users to the paywall", () => {
    expect(resolveLaunchRoute({ ...settled, isPaid: false })).toEqual({
      pathname: "/paywall",
      params: { gate: "1" },
    });
  });

  it("greets returning paid members once per launch", () => {
    expect(resolveLaunchRoute({ ...settled, welcomeBackSeen: false })).toBe(
      "/welcome-back",
    );
  });

  it("routes paid members without a plan into onboarding", () => {
    expect(resolveLaunchRoute({ ...settled, hasPlan: false })).toBe(
      "/onboarding/goal",
    );
  });

  it("lands fully set-up members in the app", () => {
    expect(resolveLaunchRoute(settled)).toBe("/(tabs)");
  });

  it("prioritises auth, then entitlement, then plan", () => {
    expect(
      resolveLaunchRoute({
        user: false,
        isPaid: false,
        welcomeBackSeen: false,
        hasPlan: false,
      }),
    ).toBe("/sign-in");
  });
});
