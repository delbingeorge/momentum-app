import { Platform } from "react-native";
import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";

import { env } from "@/shared/lib/env";
import { useAuthStore } from "@/shared/stores";

import { TIERS } from "../lib/tiers";

// Entitlement identifier configured in the RevenueCat dashboard
const ENTITLEMENT_ID = "Momentum Pro";

const apiKey = (): string | undefined =>
  (Platform.OS === "ios"
    ? env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY) ?? env.EXPO_PUBLIC_REVENUECAT_KEY;

// Dynamic import keeps Expo Go (no native module) from crashing at load
const getPurchases = async () => {
  const key = apiKey();
  if (!key) return null;
  try {
    const { default: Purchases } = await import("react-native-purchases");
    return Purchases;
  } catch {
    return null;
  }
};

const hasPremium = (info: CustomerInfo): boolean =>
  ENTITLEMENT_ID in info.entitlements.active ||
  Object.keys(info.entitlements.active).length > 0;

let configured = false;
let configuring: Promise<void> | null = null;

const doConfigure = async (): Promise<void> => {
  const Purchases = await getPurchases();
  const key = apiKey();
  if (!Purchases || !key) return;
  try {
    Purchases.configure({ apiKey: key });
    configured = true;
    const info = await Purchases.getCustomerInfo();
    // only ever upgrade locally — never silently revoke
    if (hasPremium(info)) useAuthStore.getState().setPaid(true);
  } catch (error) {
    console.error("purchases configure failed:", error);
  }
};

// Call once at app start; also refreshes the local isPaid flag from the store
export const configurePurchases = (): Promise<void> => {
  configuring ??= doConfigure();
  return configuring;
};

// Bind the RevenueCat customer to our Supabase user id so purchases follow
// the account (and any anonymous purchase on this device transfers to it)
export const logInPurchases = async (userId: string): Promise<void> => {
  await configurePurchases();
  const Purchases = await getPurchases();
  if (!Purchases || !configured) return;
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    if (hasPremium(customerInfo)) useAuthStore.getState().setPaid(true);
  } catch (error) {
    console.error("purchases login failed:", error);
  }
};

export const logOutPurchases = async (): Promise<void> => {
  const Purchases = await getPurchases();
  if (!Purchases || !configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // already anonymous — nothing to do
  }
};

export interface PaywallPackage {
  id: string;
  name: string;
  blurb: string;
  priceString: string;
  suggested: boolean;
  rcPackage: PurchasesPackage;
}

// Map live offering packages onto our tier copy (matched by store product id);
// unknown products still render using their store metadata.
export const getPaywallPackages = async (): Promise<
  PaywallPackage[] | null
> => {
  const Purchases = await getPurchases();
  if (!Purchases || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    if (!packages.length) return null;
    const mapped = packages.map((pkg) => {
      const tier = TIERS.find((t) => t.sku === pkg.product.identifier);
      return {
        id: pkg.identifier,
        name: tier?.name ?? pkg.product.title,
        blurb: tier?.blurb ?? pkg.product.description,
        priceString: pkg.product.priceString,
        suggested: tier?.suggested ?? false,
        rcPackage: pkg,
      };
    });
    // high anchor first, like the tier list
    return mapped.sort(
      (a, b) => b.rcPackage.product.price - a.rcPackage.product.price,
    );
  } catch (error) {
    console.error("offerings fetch failed:", error);
    return null;
  }
};

export type PurchaseResult = "purchased" | "cancelled" | "error";

export const purchasePremium = async (
  pkg: PurchasesPackage,
): Promise<PurchaseResult> => {
  const Purchases = await getPurchases();
  if (!Purchases) return "error";
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (hasPremium(customerInfo)) {
      useAuthStore.getState().setPaid(true);
      return "purchased";
    }
    return "error";
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "userCancelled" in error &&
      error.userCancelled
    ) {
      return "cancelled";
    }
    console.error("purchase failed:", error);
    return "error";
  }
};

export const restorePremium = async (): Promise<PurchaseResult> => {
  const Purchases = await getPurchases();
  if (!Purchases) return "error";
  try {
    const info = await Purchases.restorePurchases();
    if (hasPremium(info)) {
      useAuthStore.getState().setPaid(true);
      return "purchased";
    }
    return "error";
  } catch (error) {
    console.error("restore failed:", error);
    return "error";
  }
};
