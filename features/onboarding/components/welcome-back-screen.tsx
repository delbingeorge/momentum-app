import { router } from "expo-router";
import { Text, View } from "react-native";

import { SignInBackdrop } from "@/features/auth/components/sign-in-backdrop";
import { COLORS } from "@/shared/lib/colors";
import { getPlanRoute } from "@/shared/lib/plan-route";
import { useAuthStore, useLaunchStore, usePlanStore } from "@/shared/stores";
import { CtaButton, Icon, Screen } from "@/shared/ui";

export const WelcomeBackScreen = () => {
  const markSeen = useLaunchStore((state) => state.markWelcomeBackSeen);
  const resetPlan = usePlanStore((state) => state.resetPlan);
  const user = useAuthStore((state) => state.user);

  const continuePrevious = () => {
    markSeen();
    // tabs when a plan was restored; onboarding when there is nothing to resume
    router.replace(getPlanRoute());
  };

  const createNew = () => {
    markSeen();
    resetPlan();
    // push (not replace) so goal keeps a back stack to welcome-back
    router.push("/onboarding/goal");
  };

  return (
    <Screen className="px-7">
      <SignInBackdrop />

      <View className="flex-1 items-start justify-center gap-5">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-lime">
          <Icon
            name="fire"
            size={28}
            color={COLORS.limeText}
            strokeWidth={2.2}
          />
        </View>
        <Text className="font-sans-extrabold text-4xl tracking-tight text-text">
          Welcome back, {user ? user?.name : "champ"}!
        </Text>
        <Text className="font-sans text-lg leading-7 text-mut">
          Show up. {"\n"}Even on the bad days. {"\n"}Especially on the bad days.
        </Text>
      </View>
      <View className="gap-3 pb-2">
        <CtaButton
          label="Continue with previous split"
          icon="chevR"
          onPress={continuePrevious}
        />
        <CtaButton
          label="Create new split"
          icon="plus"
          variant="white"
          onPress={createNew}
        />
      </View>
    </Screen>
  );
};
