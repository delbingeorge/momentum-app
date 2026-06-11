import { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { COLORS } from "@/shared/lib/colors";
import { useBodyStore, useSettingsStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale, Sheet } from "@/shared/ui";

const KG_PER_LB = 2.2046;
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
  const weights = useBodyStore((state) => state.weights);
  const logWeight = useBodyStore((state) => state.logWeight);
  const unit = useSettingsStore((state) => state.unit);

  const lastKg = weights[weights.length - 1]?.kg ?? 70;
  const deltaKg = weights.length > 1 ? lastKg - (weights[0]?.kg ?? lastKg) : 0;
  const disp = (kg: number) =>
    unit === "kg"
      ? Math.round(kg * 10) / 10
      : Math.round(kg * KG_PER_LB * 10) / 10;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftKg, setDraftKg] = useState(lastKg);
  const step = unit === "kg" ? 0.5 : 1 / KG_PER_LB;

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-wider text-faint">
          Bodyweight trend
        </Text>
        <PressableScale
          onPress={() => {
            setDraftKg(lastKg);
            setSheetOpen(true);
          }}
        >
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
              {disp(lastKg)}
            </Text>
            <Text className="font-sans text-[13px] text-mut">{unit}</Text>
            {weights.length > 1 ? (
              <View className="flex-row items-center gap-0.5">
                <Icon
                  name={deltaKg >= 0 ? "arrowUp" : "chevD"}
                  size={12}
                  color={deltaKg >= 0 ? COLORS.green : COLORS.warmup}
                  strokeWidth={2.4}
                />
                <Text
                  className="font-sans-semibold text-[12.5px]"
                  style={{ color: deltaKg >= 0 ? COLORS.green : COLORS.warmup }}
                >
                  {Math.abs(disp(deltaKg))} {unit}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
            over {weights.length} weigh-ins
          </Text>
        </View>
        <Sparkline pts={weights.slice(-8).map((w) => w.kg)} />
      </View>

      <Sheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Log bodyweight"
      >
        <View className="gap-5 px-5 pt-2">
          <View className="flex-row items-center justify-between rounded-[20px] bg-card p-4">
            <PressableScale
              onPress={() => setDraftKg((kg) => Math.max(20, kg - step))}
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
            >
              <Icon name="minus" size={20} strokeWidth={2.4} />
            </PressableScale>
            <View className="flex-row items-baseline gap-1.5">
              <Text className="font-sans-bold text-4xl tracking-tight text-text">
                {disp(draftKg)}
              </Text>
              <Text className="font-mono text-sm text-mut">{unit}</Text>
            </View>
            <PressableScale
              onPress={() => setDraftKg((kg) => Math.min(300, kg + step))}
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
            >
              <Icon
                name="plus"
                size={20}
                color={COLORS.lime}
                strokeWidth={2.4}
              />
            </PressableScale>
          </View>
          <CtaButton
            label="Save"
            icon="check"
            onPress={() => {
              logWeight(Math.round(draftKg * 10) / 10);
              setSheetOpen(false);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
};
