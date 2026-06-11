import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { useAuthStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

const PERKS = [
  "Google login & cloud backup",
  "Sync your logs across devices",
  "No ads, ever",
  "Lifetime access — one payment",
];

// High anchor first makes the suggested tier read as the sensible pick
const TIERS = [
  { id: "champion", amount: 999, name: "Champion", blurb: "Go all in — back an indie dev" },
  { id: "support", amount: 499, name: "Support", blurb: "Fuels development", suggested: true },
  { id: "unlock", amount: 299, name: "Unlock", blurb: "Just the features" },
];
const MIN_AMOUNT = 299;

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

export const PaywallScreen = () => {
  const setPaid = useAuthStore((state) => state.setPaid);
  const [selected, setSelected] = useState("support");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const customAmount = parseInt(custom, 10);
  const customValid =
    custom !== "" && !Number.isNaN(customAmount) && customAmount >= MIN_AMOUNT;
  const amount =
    selected === "custom"
      ? customValid
        ? customAmount
        : null
      : (TIERS.find((tier) => tier.id === selected)?.amount ?? null);

  // TODO(octane): replace the fake delay with real IAP (RevenueCat) before release
  const unlock = () => {
    if (!amount) return;
    setLoading(true);
    setTimeout(() => {
      setPaid(true);
      setLoading(false);
      router.back();
    }, 1200);
  };

  const restore = () => {
    setPaid(true);
    router.back();
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
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <Icon name="x" size={18} color={COLORS.mut} strokeWidth={2.4} />
          </PressableScale>
        </View>

        <Text className="font-sans-bold text-[32px] leading-9 tracking-tight text-text">
          Pay what feels fair.
        </Text>
        <Text className="mb-5 mt-3 font-sans text-[15.5px] leading-[22px] text-mut">
          Momentum is built by one developer. The whole app is free — unlock to
          sync your data and support the work.
        </Text>

        <View className="mb-5 gap-3">
          {PERKS.map((perk) => (
            <View key={perk} className="flex-row items-center gap-3">
              <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-lime-dim">
                <Icon name="check" size={15} color={COLORS.lime} strokeWidth={3} />
              </View>
              <Text className="font-sans text-[15.5px] text-text">{perk}</Text>
            </View>
          ))}
        </View>

        <View className="gap-2.5">
          {TIERS.map((tier) => (
            <PressableScale
              key={tier.id}
              onPress={() => setSelected(tier.id)}
              className={cn(
                "flex-row items-center gap-3.5 rounded-[18px] p-4",
                selected === tier.id ? "bg-lime-dim" : "bg-card",
              )}
            >
              <Radio on={selected === tier.id} />
              <View className="flex-1">
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
                <Text className="mt-px font-sans text-[12.5px] text-mut">
                  {tier.blurb}
                </Text>
              </View>
              <Text className="font-sans-bold text-[19px] tracking-tight text-text">
                ₹{tier.amount}
              </Text>
            </PressableScale>
          ))}

          <PressableScale
            onPress={() => setSelected("custom")}
            className={cn(
              "flex-row items-center gap-3.5 rounded-[18px] p-4",
              selected === "custom" ? "bg-lime-dim" : "bg-card",
            )}
          >
            <Radio on={selected === "custom"} />
            <View className="flex-1">
              <Text className="font-sans-bold text-base text-text">Custom</Text>
              <Text className="mt-px font-sans text-[12.5px] text-mut">
                Any amount from ₹{MIN_AMOUNT}
              </Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Text className="font-sans-bold text-[19px] text-mut">₹</Text>
              <TextInput
                value={custom}
                keyboardType="number-pad"
                placeholder={String(MIN_AMOUNT)}
                placeholderTextColor={COLORS.faint}
                onFocus={() => setSelected("custom")}
                onChangeText={(text) => {
                  setCustom(text.replace(/[^0-9]/g, ""));
                  setSelected("custom");
                }}
                className="w-16 p-0 text-right font-sans-bold text-[19px] text-text"
              />
            </View>
          </PressableScale>
          {selected === "custom" && custom !== "" && !customValid ? (
            <Text className="font-sans text-[12.5px] text-drop">
              Minimum ₹{MIN_AMOUNT}.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="px-6 pb-3 pt-2">
        <CtaButton
          label={
            loading
              ? "Processing…"
              : amount
                ? `Pay ₹${amount}`
                : `Enter at least ₹${MIN_AMOUNT}`
          }
          icon={loading ? undefined : "check"}
          disabled={loading || !amount}
          onPress={unlock}
        />
        <View className="mt-3.5 flex-row items-center justify-center gap-3.5">
          <PressableScale onPress={restore}>
            <Text className="font-sans-medium text-[13px] text-mut">
              Restore purchase
            </Text>
          </PressableScale>
          <Text className="text-faint">·</Text>
          <Text className="font-sans text-[13px] text-faint">Secure payment</Text>
        </View>
      </View>
    </Screen>
  );
};
