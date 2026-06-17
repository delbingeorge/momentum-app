import { useMemo } from "react";
import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import Svg, { Circle, Path } from "react-native-svg";

import { COLORS } from "@/shared/lib/colors";
import { freeHistoryCutoffTs, useIsPaid } from "@/shared/lib/entitlements";
import { bodyToDisp } from "@/shared/lib/units";
import { useBodyStore, usePlanStore, useSettingsStore } from "@/shared/stores";
import { Icon, PressableScale } from "@/shared/ui";

import { analyzeTrend } from "../lib/bodyweight-trend";

const W = 72;
const H = 34;

const Sparkline = ({ pts }: { pts: number[] }) => {
  if (pts.length < 2) return <View style={{ width: W, height: H }} />;
  const min = Math.min(...pts);
  const range = Math.max(...pts) - min || 1;
  const coords = pts.map((v, i) => [
    (i / (pts.length - 1)) * W,
    H - ((v - min) / range) * (H - 8) - 4,
  ]);
  const d = coords
    .map(
      (c, i) => `${i === 0 ? "M" : "L"}${c[0]?.toFixed(1)} ${c[1]?.toFixed(1)}`,
    )
    .join(" ");
  const last = coords[coords.length - 1];
  return (
    <Svg width={W} height={H}>
      <Path
        d={d}
        fill="none"
        stroke={COLORS.lime}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last ? (
        <Circle cx={last[0]} cy={last[1]} r={2.6} fill={COLORS.lime} />
      ) : null}
    </Svg>
  );
};

export const BodyweightCard = () => {
  const allWeights = useBodyStore((state) => state.weights);
  const unit = useSettingsStore((state) => state.unit);
  const isPaid = useIsPaid();
  const weights = useMemo(() => {
    if (isPaid) return allWeights;
    const cutoff = new Date(freeHistoryCutoffTs()).getTime();
    return allWeights.filter(
      (entry) => new Date(entry.date).getTime() >= cutoff,
    );
  }, [isPaid, allWeights]);
  const sparkPts = useMemo(() => weights.slice(-8).map((w) => w.kg), [weights]);

  const goal = usePlanStore((state) => state.goal);
  const trend = useMemo(() => analyzeTrend(weights, goal), [weights, goal]);
  const lastKg = weights[weights.length - 1]?.kg ?? 70;

  const sentimentColor =
    trend?.sentiment === "good"
      ? COLORS.green
      : trend?.sentiment === "bad"
        ? COLORS.warmup
        : COLORS.mut;
  const dirIcon =
    trend?.direction === "up"
      ? "arrowUp"
      : trend?.direction === "down"
        ? "chevD"
        : "minus";
  const rate = trend ? bodyToDisp(trend.ratePerWeek, unit) : 0;

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-wider text-faint">
          Bodyweight trend
        </Text>
        <PressableScale onPress={() => SheetManager.show("log-bodyweight")}>
          <Text className="font-sans-bold text-[12.5px] text-lime">
            Log weight
          </Text>
        </PressableScale>
      </View>
      <View className="flex-row items-center gap-3.5 rounded-[18px] bg-card px-4 py-4">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-lime-dim">
          <Icon name="scale" size={22} color={COLORS.lime} strokeWidth={1.9} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="font-sans-bold text-2xl tracking-tight text-text">
              {bodyToDisp(lastKg, unit)}
            </Text>
            <Text className="font-sans text-[13px] text-mut">{unit}</Text>
          </View>
          {trend ? (
            <View className="mt-1 flex-row items-center gap-1.5">
              <Icon
                name={dirIcon}
                size={13}
                color={sentimentColor}
                strokeWidth={2.6}
              />
              <Text
                className="font-sans-semibold text-[12.5px]"
                style={{ color: sentimentColor }}
              >
                {trend.direction === "flat"
                  ? trend.label
                  : `${rate > 0 ? "+" : ""}${rate} ${unit}/wk`}
              </Text>
              {trend.direction !== "flat" ? (
                <Text
                  numberOfLines={1}
                  className="flex-1 font-mono text-[10.5px] text-faint"
                >
                  · {trend.label}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text className="mt-1 font-mono text-[10.5px] text-faint">
              Log a few weigh-ins to see your trend
            </Text>
          )}
        </View>
        <Sparkline pts={sparkPts} />
      </View>
    </View>
  );
};
