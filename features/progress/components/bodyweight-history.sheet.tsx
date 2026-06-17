import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";
import Svg, { Circle, Path } from "react-native-svg";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { freeHistoryCutoffTs, useIsPaid } from "@/shared/lib/entitlements";
import { haptics } from "@/shared/lib/haptics";
import { bodyToDisp } from "@/shared/lib/units";
import { useBodyStore, usePlanStore, useSettingsStore } from "@/shared/stores";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

import {
  analyzeTrend,
  directionOf,
  sentimentColor,
  sentimentFor,
} from "../lib/bodyweight-trend";

const CHART_H = 132;
const PAD = 14;

const DEFAULT_RANGE = { id: "30d", label: "30D", days: 30 };
const RANGES: { id: string; label: string; days: number }[] = [
  DEFAULT_RANGE,
  { id: "90d", label: "90D", days: 90 },
  { id: "all", label: "All", days: Infinity },
];

const dayDiff = (fromIso: string, toIso: string): number =>
  Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000,
  );

// Parse a YYYY-MM-DD entry as local midnight so the weekday/day never slips a
// day in negative-offset timezones.
const fmtDay = (iso: string): string =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const Chart = ({ pts, width }: { pts: number[]; width: number }) => {
  if (width <= 0 || pts.length === 0) return null;
  const min = Math.min(...pts);
  const range = Math.max(...pts) - min || 1;
  const x = (i: number) =>
    pts.length === 1 ? width / 2 : (i / (pts.length - 1)) * width;
  const y = (v: number) => PAD + (1 - (v - min) / range) * (CHART_H - 2 * PAD);
  const coords = pts.map((v, i) => [x(i), y(v)] as const);

  const line = coords
    .map(
      (c, i) => `${i === 0 ? "M" : "L"}${c[0].toFixed(1)} ${c[1].toFixed(1)}`,
    )
    .join(" ");
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area =
    first && last
      ? `${line} L${last[0].toFixed(1)} ${CHART_H} L${first[0].toFixed(1)} ${CHART_H} Z`
      : "";

  return (
    <Svg width={width} height={CHART_H}>
      {area ? <Path d={area} fill="rgba(203,251,69,0.10)" /> : null}
      <Path
        d={line}
        fill="none"
        stroke={COLORS.lime}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last ? (
        <Circle cx={last[0]} cy={last[1]} r={3.5} fill={COLORS.lime} />
      ) : null}
    </Svg>
  );
};

export const BodyweightHistorySheet = ({
  sheetId,
}: SheetProps<"bodyweight-history">) => {
  const allWeights = useBodyStore((state) => state.weights);
  const removeWeight = useBodyStore((state) => state.removeWeight);
  const unit = useSettingsStore((state) => state.unit);
  const goal = usePlanStore((state) => state.goal);
  const isPaid = useIsPaid();
  const [rangeId, setRangeId] = useState("30d");
  const [chartW, setChartW] = useState(0);

  // Free tier only keeps a recent window — mirror the card's cutoff.
  const visible = useMemo(() => {
    if (isPaid) return allWeights;
    const cutoff = new Date(freeHistoryCutoffTs()).getTime();
    return allWeights.filter(
      (entry) => new Date(entry.date).getTime() >= cutoff,
    );
  }, [isPaid, allWeights]);
  const lockedCount = allWeights.length - visible.length;

  // Day-over-day change, keyed by date, across the full visible series.
  const deltaByDate = useMemo(() => {
    const map = new Map<string, number>();
    visible.forEach((entry, i) => {
      const prev = visible[i - 1];
      if (prev) map.set(entry.date, entry.kg - prev.kg);
    });
    return map;
  }, [visible]);

  const range = RANGES.find((r) => r.id === rangeId) ?? DEFAULT_RANGE;
  const latest = visible[visible.length - 1];
  const ranged = useMemo(() => {
    if (!latest || range.days === Infinity) return visible;
    return visible.filter(
      (entry) => dayDiff(entry.date, latest.date) <= range.days,
    );
  }, [visible, latest, range.days]);

  const trend = useMemo(() => analyzeTrend(visible, goal), [visible, goal]);
  const trendColor = sentimentColor(trend?.sentiment ?? "neutral");
  const rate = trend ? bodyToDisp(trend.ratePerWeek, unit) : 0;
  const chartPts = ranged.map((entry) => entry.kg);
  const low = chartPts.length ? Math.min(...chartPts) : 0;
  const high = chartPts.length ? Math.max(...chartPts) : 0;
  const rows = [...ranged].reverse();

  return (
    <BaseSheet sheetId={sheetId} title="Bodyweight history" fullHeight>
      {visible.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5 pb-16">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-lime-dim">
            <Icon
              name="scale"
              size={26}
              color={COLORS.lime}
              strokeWidth={1.8}
            />
          </View>
          <Text className="mt-4 font-sans-semibold text-[15px] text-text">
            No weigh-ins yet
          </Text>
          <Text className="mt-1 text-center font-sans text-sm text-mut">
            Log your weight to start tracking your trend.
          </Text>
          <PressableScale
            onPress={async () => {
              await SheetManager.hide(sheetId);
              SheetManager.show("log-bodyweight");
            }}
            className="mt-5 rounded-full bg-lime px-5 py-2.5"
          >
            <Text className="font-sans-bold text-[13px] text-lime-text">
              Log weight
            </Text>
          </PressableScale>
        </View>
      ) : (
        <SheetScrollView
          className="px-5"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="flex-row items-baseline gap-1.5">
            <Text className="font-sans-bold text-[34px] tracking-tight text-text">
              {bodyToDisp(latest?.kg ?? 0, unit)}
            </Text>
            <Text className="font-sans text-base text-mut">{unit}</Text>
            {trend ? (
              <View className="ml-auto flex-row items-center gap-1">
                <Icon
                  name={
                    trend.direction === "up"
                      ? "arrowUp"
                      : trend.direction === "down"
                        ? "chevD"
                        : "minus"
                  }
                  size={14}
                  color={trendColor}
                  strokeWidth={2.6}
                />
                <Text
                  className="font-sans-bold text-sm"
                  style={{ color: trendColor }}
                >
                  {trend.direction === "flat"
                    ? trend.label
                    : `${rate > 0 ? "+" : ""}${rate} ${unit}/wk`}
                </Text>
              </View>
            ) : null}
          </View>
          {trend && trend.direction !== "flat" ? (
            <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
              {trend.label}
            </Text>
          ) : null}

          <View className="mt-3 flex-row rounded-full bg-card p-[3px]">
            {RANGES.map((option) => (
              <PressableScale
                key={option.id}
                onPress={() => setRangeId(option.id)}
                className={cn(
                  "flex-1 items-center rounded-full py-1.5",
                  rangeId === option.id && "bg-lime",
                )}
              >
                <Text
                  className={cn(
                    "font-mono text-[11.5px]",
                    rangeId === option.id ? "text-lime-text" : "text-mut",
                  )}
                >
                  {option.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          <View
            className="mt-4 rounded-2xl bg-card p-3"
            onLayout={(e) => setChartW(e.nativeEvent.layout.width - 24)}
          >
            <Chart pts={chartPts} width={chartW} />
            {chartPts.length > 1 ? (
              <View className="mt-1.5 flex-row justify-between">
                <Text className="font-mono text-[10px] text-faint">
                  low {bodyToDisp(low, unit)} {unit}
                </Text>
                <Text className="font-mono text-[10px] text-faint">
                  high {bodyToDisp(high, unit)} {unit}
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="mb-2 mt-5 font-mono text-[11px] uppercase tracking-wider text-faint">
            {rows.length} weigh-in{rows.length === 1 ? "" : "s"}
          </Text>
          <View className="gap-2">
            {rows.map((entry) => {
              const delta = deltaByDate.get(entry.date);
              const dir = delta === undefined ? "flat" : directionOf(delta);
              const color = sentimentColor(sentimentFor(dir, goal));
              const dispDelta =
                delta === undefined ? 0 : bodyToDisp(delta, unit);
              return (
                <View
                  key={entry.date}
                  className="flex-row items-center gap-3 rounded-2xl border border-line bg-card px-3.5 py-3"
                >
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-[15px] text-text">
                      {bodyToDisp(entry.kg, unit)} {unit}
                    </Text>
                    <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
                      {fmtDay(entry.date)}
                    </Text>
                  </View>
                  {delta !== undefined && dir !== "flat" ? (
                    <Text
                      className="font-sans-semibold text-[13px]"
                      style={{ color }}
                    >
                      {dispDelta > 0 ? "+" : ""}
                      {dispDelta} {unit}
                    </Text>
                  ) : (
                    <Text className="font-mono text-[12px] text-faint">—</Text>
                  )}
                  <PressableScale
                    onPress={() => {
                      haptics.warning();
                      removeWeight(entry.date);
                    }}
                    className="h-8 w-8 items-center justify-center rounded-full bg-card2"
                  >
                    <Icon name="trash" size={15} color={COLORS.mut} />
                  </PressableScale>
                </View>
              );
            })}
          </View>

          {lockedCount > 0 ? (
            <PressableScale
              onPress={() => {
                SheetManager.hide(sheetId);
                router.push("/paywall");
              }}
              className="mt-2 flex-row items-center gap-3 rounded-2xl border border-dashed border-line2 bg-card px-3.5 py-3"
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
                <Icon
                  name="medal"
                  size={18}
                  color={COLORS.lime}
                  strokeWidth={1.8}
                />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px] text-text">
                  {lockedCount} older weigh-in{lockedCount === 1 ? "" : "s"}
                </Text>
                <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
                  Unlock your full history
                </Text>
              </View>
              <Icon name="chevR" size={17} color={COLORS.faint} />
            </PressableScale>
          ) : null}
        </SheetScrollView>
      )}
    </BaseSheet>
  );
};
