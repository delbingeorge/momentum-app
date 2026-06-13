import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { signInWithGoogle, signOut, upsertPaidFlag } from "@/features/auth";
import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { getPlanRoute } from "@/shared/lib/plan-route";
import { clearLocalData, toast, useAuthStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

import {
  getPaywallPackages,
  logInPurchases,
  type PaywallPackage,
  purchasePremium,
  restorePremium,
} from "../api/purchases-api";
import { TIERS } from "../lib/tiers";

interface Perk {
  label: string;
  // shown when the free tier is selected, so the loss framing stays honest
  freeNote?: string;
  freeIncluded?: boolean;
}

const PERKS: Perk[] = [
  { label: "Form demo videos for every exercise" },
  {
    label: "Full training history & all-time stats",
    freeNote: "8 weeks, recent stats only",
  },
  { label: "Google login & cloud backup" },
  { label: "Sync your logs across devices" },
  { label: "No ads, ever", freeIncluded: true },
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

// display-only row, never purchasable; appended in gate mode so picking it
// shows what staying free costs before the user confirms
const FREE_TIER: DisplayTier = {
  id: "free",
  name: "Free forever",
  blurb: "Training stays free, premium locked",
  priceString: "₹0",
  suggested: false,
  rcPackage: null,
};

const Radio = ({ on, muted }: { on: boolean; muted?: boolean }) => (
  <View
    className={cn(
      "h-[22px] w-[22px] items-center justify-center rounded-full border-2",
      on
        ? muted
          ? "border-line2 bg-card2"
          : "border-lime bg-lime"
        : "border-line2",
    )}
  >
    {on ? (
      <Icon
        name="check"
        size={12}
        color={muted ? COLORS.mut : COLORS.limeText}
        strokeWidth={3}
      />
    ) : null}
  </View>
);

export const PaywallScreen = () => {
  // gate mode: reached signed-in but unpaid (sign-in without entitlement,
  // lapsed sub) — the only ways out are paying or dropping the session
  const { gate } = useLocalSearchParams<{ gate?: string }>();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setPaid = useAuthStore((state) => state.setPaid);
  const [tiers, setTiers] = useState<DisplayTier[]>(placeholderTiers);
  const [selectedId, setSelectedId] = useState(
    placeholderTiers.find((tier) => tier.suggested)?.id ??
      placeholderTiers[0]?.id,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPaywallPackages().then((packages) => {
      if (!packages?.length) return;
      setTiers(packages);
      setSelectedId(
        packages.find((pkg) => pkg.suggested)?.id ?? packages[0]?.id,
      );
    });
  }, []);

  // derived, not state: the RC package load resets `tiers`, so appending the
  // free row in state would get wiped
  const displayTiers = gate ? [...tiers, FREE_TIER] : tiers;
  const selected = displayTiers.find((tier) => tier.id === selectedId);
  const freeSelected = selectedId === FREE_TIER.id;

  // the gate redirect replaces the stack, so back isn't always available
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  // signed in but not paying: drop the session (paid-only sign-in invariant),
  // local data stays, then continue free from wherever the plan left off
  const continueFree = async () => {
    setLoading(true);
    await signOut();
    useAuthStore.getState().resetAuth();
    clearLocalData();
    router.replace(getPlanRoute());
  };

  // gate close: drop the unpaid session (paid-only sign-in invariant) and
  // return to sign-in, not into the free plan flow
  const backToSignIn = async () => {
    setLoading(true);
    await signOut();
    useAuthStore.getState().resetAuth();
    router.replace("/sign-in");
  };

  const unlock = async () => {
    if (!selected) return;
    setLoading(true);
    if (selected.rcPackage) {
      // sign in first so the purchase lands on the account, not an
      // anonymous device id — entitlement then syncs across devices
      let userId = user?.id;
      let signedInInline = false;
      if (!userId) {
        try {
          const signedIn = await signInWithGoogle();
          setUser(signedIn);
          userId = signedIn.id;
          signedInInline = true;
        } catch (err) {
          setLoading(false);
          toast.error(err instanceof Error ? err.message : "Sign-in failed.");
          return;
        }
      }
      await logInPurchases(userId);
      const result = await purchasePremium(selected.rcPackage);
      setLoading(false);
      if (result === "purchased") {
        void upsertPaidFlag(userId, true);
        close();
      } else {
        // no purchase: undo the inline sign-in so an unpaid session
        // doesn't linger behind the paywall
        if (signedInInline) {
          void signOut();
          useAuthStore.getState().resetAuth();
        }
        if (result === "error") toast.error("Purchase failed. Try again.");
      }
    } else {
      // TODO(octane): remove dev fallback once store builds always have RC configured
      setTimeout(() => {
        setPaid(true);
        setLoading(false);
        close();
      }, 1200);
    }
  };

  const restore = async () => {
    if (tiers[0]?.rcPackage) {
      if (user?.id) await logInPurchases(user.id);
      const result = await restorePremium();
      if (result === "purchased") {
        if (user?.id) void upsertPaidFlag(user.id, true);
        close();
      } else {
        toast.error("No previous purchase found.");
      }
    } else {
      setPaid(true);
      close();
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
            onPress={() => (gate ? void backToSignIn() : close())}
            className="h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <Icon name="x" size={18} color={COLORS.mut} strokeWidth={2.4} />
          </PressableScale>
        </View>

        <Text className="font-sans-bold text-[32px] leading-9 tracking-tight text-text">
          Pay what feels fair.
        </Text>
        <Text className="mb-5 mt-3 font-sans text-[15.5px] leading-[22px] text-mut">
          {freeSelected
            ? "Free covers your training. Everything below stays locked."
            : "Momentum is built by one developer. Training stays free forever. Unlock once for your full history, sync, and to support the work."}
        </Text>

        <View className="mb-5 gap-3">
          {PERKS.map((perk) => {
            const lost = freeSelected && !perk.freeIncluded;
            return (
              <View key={perk.label} className="flex-row items-center gap-3">
                <View
                  className={cn(
                    "h-[26px] w-[26px] items-center justify-center rounded-full",
                    lost ? "bg-danger/10" : "bg-lime-dim",
                  )}
                >
                  <Icon
                    name={lost ? "x" : "check"}
                    size={15}
                    color={lost ? COLORS.danger : COLORS.lime}
                    strokeWidth={3}
                  />
                </View>
                <Text
                  className={cn(
                    "flex-1 font-sans text-[15.5px]",
                    lost ? "text-mut" : "text-text",
                  )}
                >
                  {perk.label}
                  {lost && perk.freeNote ? (
                    <Text className="text-faint"> ({perk.freeNote})</Text>
                  ) : null}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="gap-2.5">
          {displayTiers.map((tier) => (
            <PressableScale
              key={tier.id}
              onPress={() => setSelectedId(tier.id)}
              className={cn(
                "flex-row items-center gap-3.5 rounded-[18px] p-4",
                selectedId === tier.id
                  ? tier.id === FREE_TIER.id
                    ? "bg-card2"
                    : "bg-lime-dim"
                  : "bg-card",
              )}
            >
              <Radio
                on={selectedId === tier.id}
                muted={tier.id === FREE_TIER.id}
              />
              <View className="flex-1 justify-center">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={cn(
                      "font-sans-bold text-base",
                      tier.id === FREE_TIER.id ? "text-mut" : "text-text",
                    )}
                  >
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
              <Text
                className={cn(
                  "font-sans-bold text-[19px] tracking-tight",
                  tier.id === FREE_TIER.id ? "text-mut" : "text-text",
                )}
              >
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
              : freeSelected
                ? "Continue for free"
                : `${user ? "Pay" : "Sign in & pay"} ${selected?.priceString ?? ""} · ${selected?.name ?? ""}`
          }
          icon={loading ? undefined : freeSelected ? "chevR" : "check"}
          disabled={loading || !selected}
          onPress={() => void (freeSelected ? continueFree() : unlock())}
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
