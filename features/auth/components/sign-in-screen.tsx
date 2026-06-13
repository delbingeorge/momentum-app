import { type Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { logInPurchases, reconcileEntitlement } from "@/features/paywall";
import { syncNow } from "@/features/sync";
import { COLORS } from "@/shared/lib/colors";
import { getPlanRoute } from "@/shared/lib/plan-route";
import { clearLocalData, toast, useAuthStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

import { signInWithGoogle, signOut } from "../api/auth-api";
import { SignInBackdrop } from "./sign-in-backdrop";

export const SignInScreen = () => {
  // when set, the screen is a step in a flow (e.g. mid-onboarding)
  // and both closing and signing in continue forward instead of going back
  const { next } = useLocalSearchParams<{ next?: string }>();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  // "Continue" skips sign-in into a fresh guest session
  const continueFree = () => {
    if (next) return router.replace(next as Href);
    // wiping local data clears the plan, so the user always starts at step one;
    // push (not replace) keeps a back stack so they can return to sign-in
    clearLocalData();
    router.push("/onboarding/goal");
  };

  // Sign-in is for paid members only. Settle both entitlement sources
  // (RevenueCat, then the profiles mirror) before deciding: paid users
  // continue in, unpaid ones get told and choose purchase or free.
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const signedIn = await signInWithGoogle();
      setUser(signedIn);
      // settle both entitlement sources before deciding: RevenueCat authority,
      // then the profiles mirror when RC is unconfigured
      await logInPurchases(signedIn.id);
      await reconcileEntitlement({ userId: signedIn.id });
      if (useAuthStore.getState().isPaid) {
        // restore plan + history from cloud before routing; otherwise
        // getPlanRoute reads the just-cleared local plan and sends paid
        // users back to onboarding step zero
        await syncNow();
        setLoading(false);
        // greet every paid member; welcome-back routes continue/restart from
        // there based on whether a plan was restored
        if (next) router.replace(next as Href);
        else router.replace("/welcome-back");
        return;
      }
      setLoading(false);
      const choice = await SheetManager.show("no-purchase", {
        payload: { email: signedIn.email },
      });
      if (choice === "purchase") {
        router.push({ pathname: "/paywall", params: { gate: "1" } });
      } else {
        // anything else drops the unpaid session first
        await signOut();
        useAuthStore.getState().resetAuth();
        if (choice === "free") {
          clearLocalData();
          router.replace(getPlanRoute());
        }
        // purchase may live on another Google account: rerun the whole
        // flow, the picker shows again since sign-in clears its session
        else if (choice === "switch") return handleSignIn();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed.");
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
            HHey, Welcome to{"\n"}Momentum
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
        <Text className="text-center font-sans text-xs leading-[17px] text-faint">
          By continuing you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
};
