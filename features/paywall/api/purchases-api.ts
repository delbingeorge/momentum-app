import type { PurchasesPackage } from "react-native-purchases";

import { PLANS, type PlanId, planOrder } from "../lib/plans";
import {
  apiKey,
  getPurchases,
  hasPremium,
  isConfigured,
  markConfigured,
} from "../lib/rc-client";
import { reconcileEntitlement } from "../lib/reconcile-entitlement";

let configuring: Promise<void> | null = null;

const doConfigure = async (): Promise<void> => {
  const Purchases = await getPurchases();
  const key = apiKey();
  if (!Purchases || !key) return;
  try {
    Purchases.configure({
      apiKey: key,
      // Test Store has no Play billing client; skip Play in-app messages so
      // the SDK doesn't log a billing connection error on Android in dev
      shouldShowInAppMessagesAutomatically: !key.startsWith("test_"),
    });
    markConfigured();
  } catch (error) {
    console.error("purchases configure failed:", error);
  }
};

// Call once at app start. Entitlement is reconciled separately by
// reconcileEntitlement, which owns every write to the isPaid flag.
export const configurePurchases = (): Promise<void> => {
  configuring ??= doConfigure();
  return configuring;
};

// Bind the RevenueCat customer to our Supabase user id so purchases follow
// the account (and any anonymous purchase on this device transfers to it).
// Does not touch isPaid; callers run reconcileEntitlement after.
export const logInPurchases = async (userId: string): Promise<void> => {
  await configurePurchases();
  const Purchases = await getPurchases();
  if (!Purchases || !isConfigured()) return;
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("purchases login failed:", error);
  }
};

export const logOutPurchases = async (): Promise<void> => {
  const Purchases = await getPurchases();
  if (!Purchases || !isConfigured()) return;
  try {
    await Purchases.logOut();
  } catch {
    // already anonymous — nothing to do
  }
};

export interface PaywallPackage {
  id: PlanId;
  name: string;
  blurb: string;
  priceString: string;
  cadence: string;
  badge?: string;
  featured: boolean;
  rcPackage: PurchasesPackage;
}

// Map live offering packages onto our plan copy, matched by RevenueCat package
// type (MONTHLY / ANNUAL / LIFETIME). Store packages that don't correspond to
// one of our three plans are dropped rather than rendered raw.
export const getPaywallPackages = async (): Promise<
  PaywallPackage[] | null
> => {
  // configure may still be in flight at app start; await the shared promise so
  // the offerings read doesn't lose a race and cache a null result for staleTime
  await configurePurchases();
  const Purchases = await getPurchases();
  if (!Purchases || !isConfigured()) {
    // distinguishes a missing key / unconfigured SDK (path A) from an empty
    // RC offering (path B) — both otherwise surface the same paywall toast
    console.warn("paywall: no Purchases SDK or not configured", {
      hasPurchases: Boolean(Purchases),
      configured: isConfigured(),
      hasKey: Boolean(apiKey()),
    });
    return null;
  }
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    if (!packages.length) {
      console.warn("paywall: RC returned no packages", {
        hasCurrent: Boolean(offerings.current),
        allOfferings: Object.keys(offerings.all ?? {}),
      });
      return null;
    }
    const mapped = packages.flatMap<PaywallPackage>((pkg) => {
      const plan = PLANS.find(
        (p) => p.packageType === String(pkg.packageType),
      );
      if (!plan) return [];
      return [
        {
          id: plan.id,
          name: plan.name,
          blurb: plan.blurb,
          priceString: pkg.product.priceString,
          cadence: plan.cadence,
          badge: plan.badge,
          featured: Boolean(plan.featured),
          rcPackage: pkg,
        },
      ];
    });
    // preserve the deliberate plan order (annual hero first), not price
    return mapped.sort((a, b) => planOrder(a.id) - planOrder(b.id));
  } catch (error) {
    console.error("offerings fetch failed:", error);
    return null;
  }
};

// Store page where the user's subscription is changed or cancelled — billing
// belongs to the store, so the app only deep-links there. Null when there is
// nothing to manage (free user, lifetime purchase, SDK unavailable).
export const getManagementURL = async (): Promise<string | null> => {
  await configurePurchases();
  const Purchases = await getPurchases();
  if (!Purchases || !isConfigured()) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.managementURL;
  } catch (error) {
    console.error("management url fetch failed:", error);
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
      // reconcile owns the isPaid write; it re-reads the fresh CustomerInfo
      await reconcileEntitlement();
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
      await reconcileEntitlement();
      return "purchased";
    }
    return "error";
  } catch (error) {
    console.error("restore failed:", error);
    return "error";
  }
};
