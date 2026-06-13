import { useAuthStore } from "@/shared/stores";

import { reconcileEntitlement } from "./reconcile-entitlement";
import { apiKey, getPurchases, hasPremium, isConfigured } from "./rc-client";

jest.mock("./rc-client", () => ({
  apiKey: jest.fn(),
  getPurchases: jest.fn(),
  hasPremium: jest.fn(),
  isConfigured: jest.fn(),
}));

jest.mock("@/features/auth", () => ({
  fetchPaidFlag: jest.fn(),
}));

// pulled in after the mock above is registered
const { fetchPaidFlag } = jest.requireMock("@/features/auth") as {
  fetchPaidFlag: jest.Mock;
};

const mockApiKey = apiKey as jest.Mock;
const mockGetPurchases = getPurchases as jest.Mock;
const mockHasPremium = hasPremium as jest.Mock;
const mockIsConfigured = isConfigured as jest.Mock;

const customerInfo = {};
const withRevenueCat = (premium: boolean) => {
  mockApiKey.mockReturnValue("key_live");
  mockIsConfigured.mockReturnValue(true);
  mockGetPurchases.mockResolvedValue({
    getCustomerInfo: jest.fn(async () => customerInfo),
  });
  mockHasPremium.mockReturnValue(premium);
};

beforeEach(() => {
  useAuthStore.getState().resetAuth();
});

describe("reconcileEntitlement with RevenueCat as authority", () => {
  it("upgrades when the entitlement is active", async () => {
    withRevenueCat(true);
    const result = await reconcileEntitlement();
    expect(result).toBe(true);
    expect(useAuthStore.getState().isPaid).toBe(true);
  });

  it("downgrades when the entitlement is absent", async () => {
    useAuthStore.getState().setPaid(true);
    withRevenueCat(false);
    const result = await reconcileEntitlement();
    expect(result).toBe(false);
    expect(useAuthStore.getState().isPaid).toBe(false);
  });

  it("leaves the flag untouched when the RC call throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    useAuthStore.getState().setPaid(true);
    mockApiKey.mockReturnValue("key_live");
    mockIsConfigured.mockReturnValue(true);
    mockGetPurchases.mockResolvedValue({
      getCustomerInfo: jest.fn(async () => {
        throw new Error("offline");
      }),
    });
    const result = await reconcileEntitlement();
    expect(result).toBe(true);
    expect(useAuthStore.getState().isPaid).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("reconcileEntitlement with RevenueCat unconfigured", () => {
  beforeEach(() => {
    mockApiKey.mockReturnValue(undefined);
    mockIsConfigured.mockReturnValue(false);
  });

  it("upgrades from the webhook-authoritative mirror", async () => {
    fetchPaidFlag.mockResolvedValue(true);
    const result = await reconcileEntitlement({ userId: "u1" });
    expect(result).toBe(true);
    expect(useAuthStore.getState().isPaid).toBe(true);
  });

  it("downgrades when the mirror authoritatively reports unpaid", async () => {
    useAuthStore.getState().setPaid(true);
    fetchPaidFlag.mockResolvedValue(false);
    const result = await reconcileEntitlement({ userId: "u1" });
    expect(result).toBe(false);
    expect(useAuthStore.getState().isPaid).toBe(false);
  });

  it("keeps the current flag when the mirror is unreachable", async () => {
    useAuthStore.getState().setPaid(true);
    fetchPaidFlag.mockResolvedValue(null);
    const result = await reconcileEntitlement({ userId: "u1" });
    expect(result).toBe(true);
    expect(useAuthStore.getState().isPaid).toBe(true);
  });
});
