import { useQuery } from "@tanstack/react-query";

import { getPaywallPackages, type PaywallPackage } from "../api/purchases-api";

// Store offerings are the one genuine server read with a UI consumer, so they
// live in TanStack Query. Offerings rarely change, hence the long stale time.
export const usePaywallPackages = () =>
  useQuery<PaywallPackage[] | null>({
    queryKey: ["paywall", "packages"],
    queryFn: getPaywallPackages,
    staleTime: 1000 * 60 * 30,
  });
