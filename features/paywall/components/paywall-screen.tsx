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
import { DEFAULT_PLAN_ID, PLANS, type PlanId } from "../lib/plans";

interface Perk {
  label: string;
  // shown as a muted note so the free/premium difference stays honest
  freeNote?: string;
}

const PERKS: Perk[] = [
  {
    label: "All-time history, stats & PRs",
    freeNote: "free sees the last 8 weeks",
  },
  { label: "Multi-device sync" },
  { label: "Data export (CSV + full backup)" },
  { label: "Form videos for every exercise" },
  { label: "Advanced analytics & full heatmap" },
  { label: "No ads, ever", freeNote: "ads on the free plan" },
  { label: "Early access to AI coach & Health sync" },
];

interface DisplayPlan {
  id: PlanId;
  name: string;
  blurb: string;
  priceString: string;
  cadence: string;
  badge?: string;
  featured: boolean;
  rcPackage: PaywallPackage["rcPackage"] | null;
}

const placeholderPlans: DisplayPlan[] = PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  blurb: plan.blurb,
  priceString: plan.displayPrice,
  cadence: plan.cadence,
  badge: plan.badge,
  featured: Boolean(plan.featured),
  rcPackage: null,
}));

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
  const plans: DisplayPlan[] = packages?.length ? packages : placeholderPlans;
  const [selectedId, setSelectedId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [loading, setLoading] = useState(false);

  // keep the selection valid if the live offering is missing the default plan
  useEffect(() => {
    const first = packages?.[0];
    if (first && !packages.some((p) => p.id === selectedId)) {
      setSelectedId(first.id);
    }
  }, [packages, selectedId]);

  const selected = plans.find((plan) => plan.id === selectedId);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const ctaLabel = (): string => {
    if (loading) return "Processing…";
    if (!selected) return "Unavailable";
    if (selected.id === "annual") return "Start 7-day free trial";
    if (selected.id === "lifetime") {
      return `Unlock lifetime · ${selected.priceString}`;
    }
    return `Subscribe · ${selected.priceString}${selected.cadence}`;
  };

  const billingNote = (): string => {
    if (!selected) return "";
    if (selected.id === "annual") {
      return `7 days free, then ${selected.priceString}/yr. Cancel anytime.`;
    }
    if (selected.id === "monthly") return "Billed monthly. Cancel anytime.";
    return "One-time payment. Yours forever.";
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
    if (plans.some((plan) => plan.rcPackage)) {
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
              MOMENTUM PREMIUM
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
          See your all-time progress.
        </Text>
        <Text className="mb-5 mt-3 font-sans text-[15.5px] leading-[22px] text-mut">
          Training stays free forever. Upgrade to unlock your full history, sync
          across devices, export your data, and back the work.
        </Text>

        <View className="mb-5 gap-3">
          {PERKS.map((perk) => (
            <View key={perk.label} className="flex-row items-center gap-3">
              <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-lime-dim">
                <Icon
                  name="check"
                  size={15}
                  color={COLORS.lime}
                  strokeWidth={3}
                />
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
          {plans.map((plan) => {
            const active = selectedId === plan.id;
            return (
              <PressableScale
                key={plan.id}
                onPress={() => setSelectedId(plan.id)}
                className={cn(
                  "flex-row items-center gap-3.5 rounded-[18px] border p-4",
                  active
                    ? "border-transparent bg-lime-dim"
                    : plan.featured
                      ? "border-line2 bg-card"
                      : "border-transparent bg-card",
                )}
              >
                <Radio on={active} />
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-sans-bold text-base text-text">
                      {plan.name}
                    </Text>
                    {plan.badge ? (
                      <Text className="rounded-full bg-lime px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-lime-text">
                        {plan.badge}
                      </Text>
                    ) : null}
                  </View>
                  {plan.blurb ? (
                    <Text className="mt-px font-sans text-[12.5px] text-mut">
                      {plan.blurb}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end">
                  <Text className="font-sans-bold text-[19px] tracking-tight text-text">
                    {plan.priceString}
                  </Text>
                  <Text className="font-sans text-[11.5px] text-faint">
                    {plan.cadence}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-3 pt-2">
        <CtaButton
          label={ctaLabel()}
          icon={loading ? undefined : "check"}
          disabled={loading || !selected}
          onPress={() => void unlock()}
        />
        <Text className="mt-2.5 text-center font-sans text-[12px] text-faint">
          {billingNote()}
        </Text>
        <View className="mt-2 flex-row items-center justify-center gap-3.5">
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
