import { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { COLORS } from "@/shared/lib/colors";

// A soft radial glow that fills the whole canvas; cx/cy place it, rx/ry spread it.
// RN has no CSS blur, the gradient falloff does the job.
const Glow = ({
  width,
  height,
  cx,
  cy,
  rx,
  ry,
  color,
  peak,
}: {
  width: number;
  height: number;
  cx: string;
  cy: string;
  rx: string;
  ry: string;
  color: string;
  peak: number;
}) => (
  <Svg width={width} height={height} style={{ position: "absolute" }}>
    <Defs>
      <RadialGradient id="aura" cx={cx} cy={cy} rx={rx} ry={ry}>
        <Stop offset="0%" stopColor={color} stopOpacity={peak} />
        <Stop offset="100%" stopColor={color} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#aura)" />
  </Svg>
);

// Gentle breathing loop so the aura feels alive without distracting.
const useBreathe = (seconds: number, scaleTo: number) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: seconds * 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [t, seconds]);
  return useAnimatedStyle(() => ({
    opacity: 0.8 + t.value * 0.2,
    transform: [{ scale: 1 + t.value * (scaleTo - 1) }],
  }));
};

export const SignInBackdrop = () => {
  const { width, height } = useWindowDimensions();

  const topRight = useBreathe(9, 1.06);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {/* Solid near-black base so the glow reads against it */}
      <View
        style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bg }}
      />
      {/* Dominant lime aura anchored top-right, bleeding down into the dark */}
      <Animated.View style={[{ position: "absolute", inset: 0 }, topRight]}>
        <Glow
          width={width}
          height={height}
          cx="92%"
          cy="2%"
          rx="110%"
          ry="80%"
          color={COLORS.lime}
          peak={0.55}
        />
      </Animated.View>
    </View>
  );
};
