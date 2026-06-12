import { type Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { useAuthStore, usePlanStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

import { signInWithGoogle } from "../api/auth-api";
import { SignInBackdrop } from "./sign-in-backdrop";

export const SignInScreen = () => {
  // when set, the screen is a step in a flow (e.g. welcome → onboarding)
  // and both closing and signing in continue forward instead of going back
  const { next } = useLocalSearchParams<{ next?: string }>();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = () => {
    if (next) router.replace(next as Href);
    // as the app's first screen there is no back stack; let the index re-route
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  // "Continue" skips sign-in: new users get the app intro, returning free
  // users resume where they left off (mirrors the index route guard)
  const continueFree = () => {
    if (next) return router.replace(next as Href);
    const { goal, level, gender, splitId, schedule } = usePlanStore.getState();
    const hasPlan =
      Boolean(level) &&
      Boolean(gender) &&
      Boolean(splitId) &&
      Boolean(schedule?.length);
    if (!goal) router.replace("/welcome");
    else if (!hasPlan) router.replace("/onboarding/goal");
    else router.replace("/(tabs)");
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await signInWithGoogle());
      leave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SignInBackdrop />

      <View className="flex-1 items-start justify-center gap-6 px-7">
        <View
          className="h-[62px] w-[62px] items-center justify-center rounded-[18px] bg-lime"
          style={{
            shadowColor: COLORS.lime,
            shadowOpacity: 0.28,
            shadowRadius: 40,
            shadowOffset: { width: 0, height: 14 },
            elevation: 12,
          }}
        >
          <Icon name="zap" size={34} color={COLORS.limeText} strokeWidth={2} />
        </View>
        <View>
          <Text className="font-sans-bold text-[34px] leading-[38px] tracking-[-0.8px] text-text">
            Welcome to{"\n"}Momentum
          </Text>
          <Text className="mt-3 font-sans text-base leading-[23px] text-mut">
            Sign in to save your plan, sync your logs, and keep your streak
            going.
          </Text>
        </View>
      </View>

      <View className="gap-3.5 px-7 pb-[30px]">
        <View
          className="rounded-full"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <CtaButton
            label="Continue for free"
            onPress={continueFree}
            disabled={loading}
          />
        </View>
        <PressableScale onPress={handleSignIn} disabled={loading}>
          <Text className="py-2 text-center font-sans-semibold text-[15px] text-mut">
            {loading ? "Signing in…" : "Already a member? Sign In"}
          </Text>
        </PressableScale>
        {error ? (
          <Text className="text-center font-mono text-[11px] text-drop">
            {error}
          </Text>
        ) : null}
        <Text className="text-center font-sans text-xs leading-[17px] text-faint">
          By continuing you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
};
