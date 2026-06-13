import { fetchPaidFlag } from "@/features/auth";
import { useAuthStore } from "@/shared/stores";

import { apiKey, getPurchases, hasPremium, isConfigured } from "./rc-client";

// The single writer for isPaid against the outside world. RevenueCat is the
// authority and may move the flag UP or DOWN. The Supabase mirror is only a
// fallback when RC is unconfigured, and it may only ever upgrade (it can lag a
// lapse, so it must never revoke). A failed RC call leaves the flag untouched
// so an offline launch can't eject a paid user to the gate.
export const reconcileEntitlement = async (
  opts: { userId?: string } = {},
): Promise<boolean> => {
  const { setPaid } = useAuthStore.getState();
  const current = (): boolean => useAuthStore.getState().isPaid;

  // RC unconfigured (Expo Go / no key): the Supabase mirror is the authority.
  // is_paid is written only by the RC webhook (the DB trigger blocks clients),
  // so trust it both ways — but a null read means offline/unknown, so leave the
  // flag untouched rather than ejecting a paid user who is briefly offline.
  if (!apiKey() || !isConfigured()) {
    if (opts.userId) {
      const paid = await fetchPaidFlag(opts.userId);
      if (paid !== null) {
        setPaid(paid);
        return paid;
      }
    }
    return current();
  }

  const Purchases = await getPurchases();
  if (!Purchases) return current();
  try {
    const info = await Purchases.getCustomerInfo();
    const paid = hasPremium(info);
    setPaid(paid);
    return paid;
  } catch (error) {
    // offline or RC error: authoritative state is unknown, so do not downgrade
    console.error("entitlement reconcile failed:", error);
    return current();
  }
};
