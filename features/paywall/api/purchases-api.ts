import type { PurchasesPackage } from "react-native-purchases";

import { TIERS } from "../lib/tiers";
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
  if (!Purchases || !isConfigured()) return null;
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
