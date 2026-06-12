import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { Icon, PressableScale } from "@/shared/ui";

import { useAuthStore } from "@/shared/stores";

import { signOut } from "../api/auth-api";

export const AccountCard = () => {
  const user = useAuthStore((state) => state.user);
  const isPaid = useAuthStore((state) => state.isPaid);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      resetAuth();
      setBusy(false);
    }
  };

  if (!isPaid) {
    return (
      <View className="overflow-hidden rounded-[18px] border border-line bg-card">
        <View className="flex-row items-center gap-3 border-b border-line px-4 py-3.5">
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-card2">
            <Icon name="user" size={18} color={COLORS.mut} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-[15px] text-text">
              Free · local only
            </Text>
            <Text className="mt-px font-sans text-xs text-mut">
              Your data lives on this device.
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 px-4 py-3 opacity-50">
          <Icon name="rotate" size={18} color={COLORS.mut} />
          <Text className="flex-1 font-sans text-[14.5px] text-text">
            Sign in to sync
          </Text>
          <Icon name="medal" size={15} color={COLORS.faint} />
        </View>
        <View className="px-3.5 pb-3.5 pt-1">
          <PressableScale
            onPress={() => router.push("/paywall")}
            className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-lime"
          >
            <Icon
              name="zap"
              size={17}
              color={COLORS.limeText}
              strokeWidth={2.4}
            />
            <Text className="font-sans-bold text-[15px] text-lime-text">
              Unlock Momentum
            </Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-[18px] border border-line bg-card">
      <View className="flex-row items-center gap-3 border-b border-line px-4 py-3.5">
        <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
          <Icon name="zap" size={18} color={COLORS.lime} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[15px] text-text">
            Premium · unlocked
          </Text>
          <Text className="mt-px font-sans text-xs text-mut">
            Lifetime access. Thank you.
          </Text>
        </View>
      </View>
      {user ? (
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <Icon name="check" size={18} color={COLORS.green} strokeWidth={2.6} />
          <View className="flex-1">
            <Text className="font-sans text-[14.5px] text-text">
              {user ? `${user.email}` : ""}
            </Text>
          </View>
          <PressableScale onPress={handleSignOut} disabled={busy}>
            <Text className="font-sans-semibold text-[13px] text-mut">
              Sign out
            </Text>
          </PressableScale>
        </View>
      ) : (
        <View className="px-3.5 pb-3.5 pt-3">
          <PressableScale
            onPress={() => router.push("/sign-in")}
            className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-white"
          >
            <Icon name="user" size={16} color={COLORS.bg} strokeWidth={2.2} />
            <Text className="font-sans-bold text-[15px] text-bg">
              Sign in with Google to sync
            </Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
};
