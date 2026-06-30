import { useState } from "react";
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/shared/lib/colors";
import { haptics } from "@/shared/lib/haptics";
import { Icon, type IconName } from "@/shared/ui/icon";

const HOLD_MS = 850;

interface HoldButtonProps {
  label: string;
  onComplete: () => void;
  icon?: IconName;
  holdMs?: number;
}

/**
 * Press-and-hold confirmation button. The lime progress fill wipes across the
 * track while held; releasing early cancels. Used for destructive / final
 * actions where a stray tap would be costly (e.g. finishing a workout).
 */
export const HoldButton = ({
  label,
  onComplete,
  icon,
  holdMs = HOLD_MS,
}: HoldButtonProps) => {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const complete = () => {
    haptics.success();
    onComplete();
  };

  const start = () => {
    haptics.tap();
    scale.value = withTiming(0.98, { duration: 120 });
    progress.value = withTiming(
      1,
      { duration: holdMs, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(complete)();
      },
    );
  };

  const cancel = () => {
    scale.value = withTiming(1, { duration: 120 });
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 220 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: width * progress.value,
  }));

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPressIn={start}
        onPressOut={cancel}
        onLayout={onLayout}
        style={styles.button}
      >
        {/* Resting layer: light label on the dim track */}
        <View style={styles.content}>
          {icon ? (
            <Icon name={icon} size={20} strokeWidth={2.4} color={COLORS.lime} />
          ) : null}
          <Text style={[styles.label, styles.labelIdle]}>{label}</Text>
        </View>

        {/* Fill layer: lime wipe that reveals dark label as it advances */}
        <Animated.View style={[styles.fill, fillStyle]}>
          <View style={[styles.content, { width }]}>
            {icon ? (
              <Icon
                name={icon}
                size={20}
                strokeWidth={2.4}
                color={COLORS.limeText}
              />
            ) : null}
            <Text style={[styles.label, styles.labelActive]}>{label}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 999,
    backgroundColor: COLORS.limeDim,
    overflow: "hidden",
    justifyContent: "center",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.lime,
    overflow: "hidden",
  },
  label: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  labelIdle: {
    color: COLORS.text,
  },
  labelActive: {
    color: COLORS.limeText,
  },
});
