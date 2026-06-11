import { type Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { COLORS } from "@/shared/lib/colors";
import { useAuthStore } from "@/shared/stores";
import { Icon, PressableScale, Screen } from "@/shared/ui";

import { signInWithGoogle } from "../api/auth-api";

const GoogleMark = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.9 6.2C12.3 13.4 17.6 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.4z"
    />
    <Path
      fill="#FBBC05"
      d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l7.9-6.2z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.4 0-11.7-3.9-13.6-9.4l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
    />
  </Svg>
);

// A soft radial glow circle; RN has no CSS blur, the gradient falloff does the job
const Flare = ({
  size,
  color,
  peak,
  mid,
  midStop,
}: {
  size: number;
  color: string;
  peak: number;
  mid: number;
  midStop: number;
}) => (
  <Svg width={size} height={size}>
    <Defs>
      <RadialGradient id="flare" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={color} stopOpacity={peak} />
        <Stop offset={`${midStop}%`} stopColor={color} stopOpacity={mid} />
        <Stop offset="100%" stopColor={color} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#flare)" />
  </Svg>
);

// Looping drift used by both flares; mirrors the MVP's keyframe animations
const useDrift = (dx: number, dy: number, scaleTo: number, seconds: number) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: (seconds * 1000) / 2,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [t, seconds]);
  return useAnimatedStyle(() => ({
    opacity: 0.85 + t.value * 0.15,
    transform: [
      { translateX: t.value * dx },
      { translateY: t.value * dy },
      { scale: 1 + t.value * (scaleTo - 1) },
    ],
  }));
};

export const SignInScreen = () => {
  const { width, height } = useWindowDimensions();
  // when set, the screen is a step in a flow (e.g. welcome → onboarding)
  // and both closing and signing in continue forward instead of going back
  const { next } = useLocalSearchParams<{ next?: string }>();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = () => {
    if (next) router.replace(next as Href);
    else router.back();
  };

  const flareA = useDrift(-18, 22, 1.12, 14);
  const flareB = useDrift(24, -16, 1.1, 18);

  const halo = useSharedValue(0);
  useEffect(() => {
    halo.value = withRepeat(
      withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [halo]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + halo.value * 0.3,
    transform: [{ scale: 1 + halo.value * 0.15 }],
  }));

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
      <View pointerEvents="none" className="absolute inset-0">
        <Svg width={width} height={height} style={{ position: "absolute" }}>
          <Defs>
            <Pattern
              id="dots"
              width={22}
              height={22}
              patternUnits="userSpaceOnUse"
            >
              <Circle cx={1} cy={1} r={1} fill="rgba(255,255,255,0.05)" />
            </Pattern>
            <RadialGradient id="dotFade" cx="70%" cy="18%" rx="60%" ry="40%">
              <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
              <Stop offset="72%" stopColor="#fff" stopOpacity={0} />
            </RadialGradient>
            <Mask id="dotMask">
              <Rect width="100%" height="100%" fill="url(#dotFade)" />
            </Mask>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            fill="url(#dots)"
            mask="url(#dotMask)"
            opacity={0.5}
          />
        </Svg>
        <Animated.View
          style={[{ position: "absolute", top: -150, right: -110 }, flareA]}
        >
          <Flare
            size={420}
            color={COLORS.lime}
            peak={0.22}
            mid={0.05}
            midStop={45}
          />
        </Animated.View>
        <Animated.View
          style={[{ position: "absolute", bottom: -170, left: -140 }, flareB]}
        >
          <Flare
            size={380}
            color={COLORS.green}
            peak={0.14}
            mid={0.03}
            midStop={48}
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: height * 0.34 - 150,
              left: width * 0.3 - 150,
            },
            haloStyle,
          ]}
        >
          <Flare
            size={300}
            color={COLORS.lime}
            peak={0.1}
            mid={0.04}
            midStop={40}
          />
        </Animated.View>
        <Svg
          width={width}
          height={240}
          style={{ position: "absolute", bottom: 0 }}
        >
          <Defs>
            <LinearGradient id="vignette" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="8%" stopColor={COLORS.bg} stopOpacity={1} />
              <Stop offset="100%" stopColor={COLORS.bg} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#vignette)" />
        </Svg>
      </View>

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
            opacity: loading ? 0.7 : 1,
          }}
        >
          <PressableScale
            onPress={handleSignIn}
            disabled={loading}
            className="h-[58px] flex-row items-center justify-center gap-3 rounded-full bg-white"
          >
            {loading ? (
              <Text className="font-sans-semibold text-[17px] text-[#5f6368]">
                Signing in…
              </Text>
            ) : (
              <>
                <GoogleMark size={22} />
                <Text className="font-sans-bold text-[17px] text-[#1a1a1a]">
                  Continue with Google
                </Text>
              </>
            )}
          </PressableScale>
        </View>
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
