import Constants from "expo-constants";
import { router } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/shared/lib/colors";
import { Icon, PressableScale } from "@/shared/ui";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

// Fade + rise in, staggered by delay. One instance owns one animation, so the
// hooks stay top-level and rules-of-hooks safe.
const FadeUp = ({
  delay,
  children,
}: {
  delay: number;
  children: ReactNode;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
};

export const AboutScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <PressableScale
        onPress={() => router.back()}
        className="ml-5 mt-2 h-9 w-9 items-center justify-center rounded-full bg-card2"
      >
        <Icon name="chevL" size={18} color={COLORS.text} strokeWidth={2.2} />
      </PressableScale>

      <View className="flex-1 items-center justify-center px-8">
        <FadeUp delay={80}>
          <View className="h-28 w-28 items-center justify-center rounded-[34px] bg-card">
            <Icon name="logo" size={62} color={COLORS.lime} strokeWidth={2.2} />
          </View>
        </FadeUp>

        <View className="mt-6 items-center">
          <FadeUp delay={250}>
            <Text className="font-sans-extrabold text-4xl tracking-tight text-text">
              Momentum
            </Text>
          </FadeUp>
          <FadeUp delay={420}>
            <Text className="mt-3 font-mono text-sm tracking-wide text-lime">
              v{APP_VERSION}
            </Text>
          </FadeUp>
          <FadeUp delay={600}>
            <Text className="mt-5 text-center font-sans text-[15px] leading-6 text-mut">
              Log your lifts and follow a plan that gets harder as you do.
            </Text>
          </FadeUp>
          <FadeUp delay={820}>
            <Text className="mt-9 font-sans text-xs tracking-wide text-faint">
              Made by Octane Innovations
            </Text>
          </FadeUp>
        </View>
      </View>
    </View>
  );
};
