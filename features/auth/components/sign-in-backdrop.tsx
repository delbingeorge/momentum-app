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

// A buttery radial falloff sampled into many stops. A plain 2-stop gradient
// interpolates opacity linearly and bands badly over a large radius; densely
// sampling a soft curve removes every visible ring.
//
// We use a Gaussian bell (exp(-k·t²)) rather than smoothstep: it has no point
// where the slope snaps to flat, so the glow melts into the dark with no seam.
// Re-normalised so the very edge lands exactly on 0 (the bell's tiny residual
// would otherwise leave a faint hard rim).
const SAMPLES = 32;
const FALLOFF = 5.5; // higher = tighter core, longer soft tail
const EDGE = Math.exp(-FALLOFF);
const STOPS = Array.from({ length: SAMPLES + 1 }, (_, i) => {
  const t = i / SAMPLES;
  const bell = (Math.exp(-FALLOFF * t * t) - EDGE) / (1 - EDGE);
  return { offset: t, opacity: Math.max(0, bell) };
});

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
        {STOPS.map((s) => (
          <Stop
            key={s.offset}
            offset={`${s.offset * 100}%`}
            stopColor={color}
            stopOpacity={peak * s.opacity}
          />
        ))}
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
