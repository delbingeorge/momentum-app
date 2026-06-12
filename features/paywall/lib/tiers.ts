// Pay-what-you-want one-time tiers. Store products (RevenueCat) will own the
// real localized prices; until then these display prices are placeholders.
// SKU ids must match the products created in Play Console / App Store Connect.
export interface PaywallTier {
  id: string;
  sku: string;
  name: string;
  blurb: string;
  displayPrice: string;
  suggested?: boolean;
}

export const TIERS: PaywallTier[] = [
  {
    id: "champion",
    sku: "momentum.champion",
    name: "Champion",
    blurb: "Go all in and back an indie dev",
    displayPrice: "₹999",
  },
  {
    id: "support",
    sku: "momentum.support",
    name: "Support",
    blurb: "Fuels development",
    displayPrice: "₹499",
    suggested: true,
  },
  {
    id: "unlock",
    sku: "momentum.unlock",
    name: "Unlock",
    blurb: "Just the features",
    displayPrice: "₹299",
  },
];

export const DEFAULT_TIER_ID = "support";
