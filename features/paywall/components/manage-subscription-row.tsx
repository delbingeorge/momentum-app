import { useEffect, useState } from "react";
import { Linking, Platform, Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { toast, useAuthStore } from "@/shared/stores";
import { Icon, PressableScale } from "@/shared/ui";

import { getManagementURL } from "../api/purchases-api";

// Deep link to the store's subscription page (App Store / Play, whichever the
// user bought from). Renders nothing when there's no subscription to manage —
// free users, lifetime buyers, and dev unlocks all have a null managementURL.
export const ManageSubscriptionRow = () => {
  const isPaid = useAuthStore((state) => state.isPaid);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPaid) {
      setUrl(null);
      return;
    }
    let alive = true;
    void getManagementURL().then((managementUrl) => {
      if (alive) setUrl(managementUrl);
    });
    return () => {
      alive = false;
    };
  }, [isPaid]);

  // dev unlocks and Test Store purchases never have a management URL, so in
  // dev builds fall back to the store's generic subscriptions page — otherwise
  // the row is impossible to see before real store products exist
  const fallbackUrl = __DEV__
    ? Platform.select({
        ios: "https://apps.apple.com/account/subscriptions",
        default: "https://play.google.com/store/account/subscriptions",
      })
    : null;
  const target = url ?? (isPaid ? fallbackUrl : null);

  if (!target) return null;

  const open = () =>
    Linking.openURL(target).catch(() =>
      toast.error("Couldn't open the store. Try again."),
    );

  return (
    <PressableScale
      onPress={() => void open()}
      className="mt-2.5 flex-row items-center gap-3 rounded-[18px] bg-card px-4 py-3.5"
    >
      <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
        <Icon name="crown" size={18} color={COLORS.lime} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-[15px] text-text">
          Manage subscription
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-mut">
          Change your plan or cancel in the store
        </Text>
      </View>
      <Icon name="chevR" size={16} color={COLORS.faint} />
    </PressableScale>
  );
};
