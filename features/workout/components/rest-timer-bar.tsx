import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import { Icon, PressableScale } from "@/shared/ui";

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestTimerBarProps {
  left: number;
  total: number;
  onSkip: () => void;
  onAdd: () => void;
}

export const RestTimerBar = ({
  left,
  total,
  onSkip,
  onAdd,
}: RestTimerBarProps) => {
  const pct = total > 0 ? left / total : 0;
  return (
    <View className="flex-row items-center gap-4 rounded-[20px] bg-lime-dim px-4 py-3.5">
      <View className="h-[58px] w-[58px] items-center justify-center">
        <Svg
          width={58}
          height={58}
          viewBox="0 0 58 58"
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={29}
            cy={29}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={4.5}
          />
          <Circle
            cx={29}
            cy={29}
            r={RADIUS}
            fill="none"
            stroke={COLORS.lime}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Icon name="timer" size={22} color={COLORS.lime} />
        </View>
      </View>
      <View className="flex-1">
        <Text className="font-mono text-[10.5px] uppercase tracking-widest text-lime">
          Resting
        </Text>
        <Text className="font-sans-bold text-[32px] leading-9 tracking-tight text-text">
          {fmtDur(left)}
        </Text>
      </View>
      <View className="gap-1.5">
        <PressableScale
          onPress={onAdd}
          className="h-8 items-center justify-center rounded-full bg-card2 px-3.5"
        >
          <Text className="font-mono text-xs text-text">+15s</Text>
        </PressableScale>
        <PressableScale
          onPress={onSkip}
          className="h-8 items-center justify-center rounded-full bg-lime px-3.5"
        >
          <Text className="font-sans-bold text-[12.5px] text-lime-text">
            Skip
          </Text>
        </PressableScale>
      </View>
    </View>
  );
};
