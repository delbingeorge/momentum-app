import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { round5 } from "@/shared/lib/units";
import { useSettingsStore, useWorkoutStore } from "@/shared/stores";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

import { analyzeRecap, recapDur, relDate } from "../lib/recap";

const KG_PER_LB = 2.2046;

export const RecapSheet = ({ sheetId }: SheetProps<"session-recap">) => {
  const pastSessions = useWorkoutStore((state) => state.pastSessions);
  const unit = useSettingsStore((state) => state.unit);
  const recap = analyzeRecap(pastSessions);
  if (!recap) return null;

  const toUnit = (kg: number) =>
    unit === "kg" ? round5(kg) : round5(kg * KG_PER_LB);
  const vol = Math.round(
    unit === "kg" ? recap.last.volume : recap.last.volume * KG_PER_LB,
  ).toLocaleString();

  const stats: { k: string; v: string; u: string }[] = [
    { k: "Volume", v: vol, u: unit },
    { k: "Sets", v: String(recap.last.totalSets), u: "working" },
    { k: "Time", v: recapDur(recap.last.durationSec), u: "" },
  ];

  return (
    <BaseSheet sheetId={sheetId} fullHeight>
      <View className="flex-row items-start justify-between gap-3 px-5 pb-4 pt-2">
        <View className="flex-1">
          <Text className="font-mono text-[11px] uppercase tracking-widest text-lime">
            Recap · {relDate(recap.last.ts)}
          </Text>
          <Text className="mt-1 font-sans-bold text-[27px] tracking-tight text-text">
            {recap.last.dayName}
          </Text>
        </View>
        <PressableScale
          onPress={() => SheetManager.hide(sheetId)}
          className="h-9 w-9 items-center justify-center rounded-full bg-card2"
        >
          <Icon name="x" size={18} color={COLORS.text} strokeWidth={2.2} />
        </PressableScale>
      </View>

      <SheetScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mb-6 flex-row gap-2">
          {stats.map((stat) => (
            <View
              key={stat.k}
              className="flex-1 rounded-2xl border border-line bg-card px-3 py-3"
            >
              <View className="flex-row flex-wrap items-baseline gap-1">
                <Text className="font-sans-bold text-lg tracking-tight text-text">
                  {stat.v}
                </Text>
                {stat.u ? (
                  <Text className="font-sans text-[11px] text-mut">{stat.u}</Text>
                ) : null}
              </View>
              <Text className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-faint">
                {stat.k}
              </Text>
            </View>
          ))}
        </View>

        <Text className="mb-3 font-mono text-[11px] uppercase tracking-wider text-faint">
          Exercises
        </Text>
        <View className="gap-2">
          {recap.exercises.map((exercise, index) => {
            const sets = exercise.work.length ? exercise.work : exercise.allSets;
            const reps = sets.map((s) => s.reps);
            const repLo = Math.min(...reps);
            const repHi = Math.max(...reps);
            const kgs = sets.map((s) => toUnit(s.kg));
            const kgLo = Math.min(...kgs);
            const kgHi = Math.max(...kgs);
            return (
              <View
                key={`${exercise.name}-${index}`}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3"
              >
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="font-sans-semibold text-[15px] text-text"
                  >
                    {exercise.name}
                  </Text>
                  <Text className="mt-0.5 font-mono text-[11px] text-faint">
                    {sets.length} sets · {repLo === repHi ? repLo : `${repLo}–${repHi}`} reps
                  </Text>
                </View>
                <Text className="font-mono text-[13px] text-lime">
                  {kgLo === kgHi ? kgLo : `${kgLo}–${kgHi}`} {unit}
                </Text>
              </View>
            );
          })}
        </View>
      </SheetScrollView>
    </BaseSheet>
  );
};
