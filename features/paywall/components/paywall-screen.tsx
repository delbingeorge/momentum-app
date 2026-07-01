import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { signInWithGoogle, signOut } from "@/features/auth";
import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { toast, useAuthStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

import {
  logInPurchases,
  type PaywallPackage,
  purchasePremium,
  restorePremium,
} from "../api/purchases-api";
import { usePaywallPackages } from "../hooks/use-paywall-packages";
import { TIERS } from "../lib/tiers";

interface Perk {
  label: string;
  freeNote?: string;
}

const PERKS: Perk[] = [
  { label: "Form videos for every exercise" },
  {
    label: "Full training history & all-time stats",
    freeNote: "free keeps the last 8 weeks",
  },
  { label: "Unlimited cloud backup" },
  { label: "Sync your logs across devices" },
  { label: "No ads, ever", freeNote: "ads on the free plan" },
  { label: "Pay once, keep it for life" },
];

interface DisplayTier {
  id: string;
  name: string;
  blurb: string;
  priceString: string;
  suggested: boolean;
  rcPackage: PaywallPackage["rcPackage"] | null;
}

const placeholderTiers: DisplayTier[] = TIERS.map((tier) => ({
  id: tier.id,
  name: tier.name,
  blurb: tier.blurb,
  priceString: tier.displayPrice,
  suggested: Boolean(tier.suggested),
  rcPackage: null,
}));

const defaultTierId = (tiers: DisplayTier[]): string | undefined =>
  tiers.find((tier) => tier.suggested)?.id ?? tiers[0]?.id;

const Radio = ({ on }: { on: boolean }) => (
  <View
    className={cn(
      "h-[22px] w-[22px] items-center justify-center rounded-full border-2",
      on ? "border-lime bg-lime" : "border-line2",
    )}
  >
    {on ? (
      <Icon name="check" size={12} color={COLORS.limeText} strokeWidth={3} />
    ) : null}
  </View>
);

// Voluntary upsell reached by an already-signed-in member. It never gates
// access — a member closes it and keeps using the free plan.
export const PaywallScreen = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setPaid = useAuthStore((state) => state.setPaid);
  const { data: packages } = usePaywallPackages();
  const tiers: DisplayTier[] = packages?.length ? packages : placeholderTiers;
  const [selectedId, setSelectedId] = useState(defaultTierId(placeholderTiers));
  const [loading, setLoading] = useState(false);

  // move the selection onto the live packages once they load
  useEffect(() => {
    if (packages?.length) setSelectedId(defaultTierId(packages));
  }, [packages]);

  const selected = tiers.find((tier) => tier.id === selectedId);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const unlock = async () => {
    if (!selected) return;
    setLoading(true);
    if (selected.rcPackage) {
      // members are already signed in, but stay defensive in case a session
      // restore hasn't landed yet — bind the purchase to the account
      let userId = user?.id;
      let signedInInline = false;
      if (!userId) {
        try {
          const signedIn = await signInWithGoogle();
          setUser(signedIn);
          userId = signedIn.id;
          signedInInline = true;
        } catch (err) {
          console.error("paywall sign-in failed:", err);
          setLoading(false);
          toast.error("Sign-in failed. Please try again.");
          return;
        }
      }
      await logInPurchases(userId);
      const result = await purchasePremium(selected.rcPackage);
      setLoading(false);
      if (result === "purchased") {
        // RC owns the entitlement: reconcile already set the local flag from the
        // verified receipt, and the RC webhook mirrors is_paid to the cloud
        close();
      } else {
        // no purchase: undo an inline sign-in so no stray unpaid session lingers
        if (signedInInline) {
          void signOut();
          useAuthStore.getState().resetAuth();
        }
        if (result === "error") toast.error("Purchase failed. Try again.");
      }
    } else {
      // no RC packages (Expo Go / unconfigured build). Unlock locally ONLY in
      // dev to keep the flow testable; in production a missing offering must
      // never grant premium without a verified purchase.
      setLoading(false);
      if (__DEV__) {
        setPaid(true);
        close();
      } else {
        toast.error("Purchases are unavailable right now. Try again later.");
      }
    }
  };

  const restore = async () => {
    if (tiers[0]?.rcPackage) {
      if (user?.id) await logInPurchases(user.id);
      const result = await restorePremium();
      if (result === "purchased") {
        // reconcile already set the local flag from the restored receipt
        close();
      } else {
        toast.error("No previous purchase found.");
      }
    } else {
      setLoading(false);
      if (__DEV__) {
        setPaid(true);
        close();
      } else {
        toast.error("Purchases are unavailable right now. Try again later.");
      }
    }
  };

  return (
    <Screen>
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-4 pt-3">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 rounded-full bg-lime-dim px-3 py-1.5">
            <Icon name="zap" size={14} color={COLORS.lime} strokeWidth={2.2} />
            <Text className="font-mono text-[11px] tracking-wide text-lime">
              UNLOCK MOMENTUM
            </Text>
          </View>
          <PressableScale
            onPress={close}
            className="h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <Icon name="x" size={18} color={COLORS.mut} strokeWidth={2.4} />
          </PressableScale>
        </View>

        <Text className="font-sans-bold text-[32px] leading-9 tracking-tight text-text">
          Pay what feels fair.
        </Text>
        <Text className="mb-5 mt-3 font-sans text-[15.5px] leading-[22px] text-mut">
          Momentum is built by one developer. Training stays free forever.
          Unlock once for your full history, unlimited backup, and to support
          the work.
        </Text>

        <View className="mb-5 gap-3">
          {PERKS.map((perk) => (
            <View key={perk.label} className="flex-row items-center gap-3">
              <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-lime-dim">
                <Icon name="check" size={15} color={COLORS.lime} strokeWidth={3} />
              </View>
              <Text className="flex-1 font-sans text-[15.5px] text-text">
                {perk.label}
                {perk.freeNote ? (
                  <Text className="text-faint"> ({perk.freeNote})</Text>
                ) : null}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-2.5">
          {tiers.map((tier) => (
            <PressableScale
              key={tier.id}
              onPress={() => setSelectedId(tier.id)}
              className={cn(
                "flex-row items-center gap-3.5 rounded-[18px] p-4",
                selectedId === tier.id ? "bg-lime-dim" : "bg-card",
              )}
            >
              <Radio on={selectedId === tier.id} />
              <View className="flex-1 justify-center">
                <View className="flex-row items-center gap-2">
                  <Text className="font-sans-bold text-base text-text">
                    {tier.name}
                  </Text>
                  {tier.suggested ? (
                    <Text className="rounded-full bg-lime px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-lime-text">
                      Suggested
                    </Text>
                  ) : null}
                </View>
                {tier.blurb ? (
                  <Text className="mt-px font-sans text-[12.5px] text-mut">
                    {tier.blurb}
                  </Text>
                ) : null}
              </View>
              <Text className="font-sans-bold text-[19px] tracking-tight text-text">
                {tier.priceString}
              </Text>
            </PressableScale>
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pb-3 pt-2">
        <CtaButton
          label={
            loading
              ? "Processing…"
              : `Pay ${selected?.priceString ?? ""} · ${selected?.name ?? ""}`
          }
          icon={loading ? undefined : "check"}
          disabled={loading || !selected}
          onPress={() => void unlock()}
        />
        <View className="mt-3.5 flex-row items-center justify-center gap-3.5">
          <PressableScale onPress={() => void restore()}>
            <Text className="font-sans-medium text-[13px] text-mut">
              Restore purchase
            </Text>
          </PressableScale>
          <Text className="text-faint">·</Text>
          <Text className="font-sans text-[13px] text-faint">
            Secure payment
          </Text>
        </View>
      </View>
    </Screen>
  );
};
