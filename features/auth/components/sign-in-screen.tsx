import { router } from "expo-router";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { logInPurchases, reconcileEntitlement } from "@/features/paywall";
import { syncNow } from "@/features/sync";
import { COLORS } from "@/shared/lib/colors";
import { toast, useAuthStore, useLaunchStore } from "@/shared/stores";
import { CtaButton, Icon, Screen, SignInBackdrop } from "@/shared/ui";

import { signInWithGoogle } from "../api/auth-api";

export const SignInScreen = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  // Sign-in is required for everyone. Entitlement is settled after sign-in only
  // to set isPaid (which caps how much is retained), never to gate access:
  // paid and unpaid members both continue into the app.
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const signedIn = await signInWithGoogle();
      setUser(signedIn);
      // bind RC to the account, then settle entitlement so isPaid is correct
      // before the first sync decides how much to pull/push
      await logInPurchases(signedIn.id);
      await reconcileEntitlement({ userId: signedIn.id });
      // restore plan + history from cloud before routing; otherwise the index
      // gate reads the local plan and may send a returning member to onboarding
      await syncNow();
      setLoading(false);
      // arm the one-shot greeting: the index gate shows welcome-back when a
      // plan was restored, onboarding when this is a fresh sign-up
      useLaunchStore.getState().requestWelcomeBack();
      // re-enter the index gate so the resolver decides where to land
      router.replace("/");
    } catch (err) {
      console.error("sign-in failed:", err);
      toast.error("Sign-in failed. Please try again.");
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
            Hey, Welcome to{"\n"}Momentum
          </Text>
          <Text className="mt-3 font-sans text-base leading-[23px] text-mut">
            Build strength, stay consistent, and become the version of you that
            never skips a workout.
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
            label={loading ? "Signing in…" : "Continue with Google"}
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>
        <Text className="text-center font-sans text-xs leading-[17px] text-faint">
          By continuing you agree to our{" "}
          <Text
            className="font-sans-medium text-mut underline"
            onPress={() =>
              void Linking.openURL("https://momentum.octane.team/privacy")
            }
          >
            Terms & Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </Screen>
  );
};
