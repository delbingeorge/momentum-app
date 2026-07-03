export type PlanId = "monthly" | "annual" | "lifetime";

interface PaywallPlan {
  id: PlanId;
  // RevenueCat PACKAGE_TYPE value this plan maps to
  packageType: "MONTHLY" | "ANNUAL" | "LIFETIME";
  name: string;
  blurb: string;
  displayPrice: string;
  cadence: string;
  badge?: string;
  featured?: boolean;
}

// Order is intentional and preserved in the UI: the annual hero sits first.
export const PLANS: PaywallPlan[] = [
  {
    id: "annual",
    packageType: "ANNUAL",
    name: "Annual",
    blurb: "Best value · about ₹67/mo",
    displayPrice: "₹799",
    cadence: "/yr",
    badge: "7-day free trial",
    featured: true,
  },
  {
    id: "monthly",
    packageType: "MONTHLY",
    name: "Monthly",
    blurb: "Flexible, cancel anytime",
    displayPrice: "₹149",
    cadence: "/mo",
  },
  {
    id: "lifetime",
    packageType: "LIFETIME",
    name: "Lifetime",
    blurb: "Pay once, keep forever",
    displayPrice: "₹1,999",
    cadence: "one-time",
  },
];

export const DEFAULT_PLAN_ID: PlanId = "annual";

export const planOrder = (id: string): number => {
  const index = PLANS.findIndex((plan) => plan.id === id);
  return index === -1 ? PLANS.length : index;
};
