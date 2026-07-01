import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { fmtHM } from "@/shared/lib/dates";
import { volumeToDisp } from "@/shared/lib/units";
import { useSettingsStore, useWorkoutStore } from "@/shared/stores";
import type { DayKey } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

import { analyzeRecap, relDate } from "../lib/recap";

export const RecapCard = ({ dayKey }: { dayKey: DayKey }) => {
  const pastSessions = useWorkoutStore((state) => state.pastSessions);
  const unit = useSettingsStore((state) => state.unit);
  const recap = analyzeRecap(pastSessions, dayKey);
  if (!recap) return null;

  const vol = volumeToDisp(recap.last.volume, unit).toLocaleString();

  const stats: [string, string][] = [
    [`${vol} ${unit}`, "volume"],
    [String(recap.last.totalSets), "sets"],
    [fmtHM(recap.last.durationSec), "time"],
  ];

  return (
    <PressableScale
      onPress={() =>
        SheetManager.show("session-recap", {
          payload: { session: recap.last },
        })
      }
      className="mx-4 mb-0.5 mt-1 rounded-[20px] border border-line bg-card p-4"
    >
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="font-mono text-[10.5px] uppercase tracking-widest text-lime">
          Last time
        </Text>
        <Text className="font-mono text-[10.5px] text-faint">
          {relDate(recap.last.ts)} · {recap.last.dayName}
        </Text>
        <View className="ml-auto flex-row items-center gap-1">
          <Text className="font-sans-bold text-[12.5px] text-lime">Recap</Text>
          <Icon name="chevR" size={15} color={COLORS.lime} strokeWidth={2.4} />
        </View>
      </View>
      <View className="flex-row gap-2">
        {stats.map(([value, label]) => (
          <View key={label} className="flex-1 rounded-[13px] bg-black/20 px-3 py-2.5">
            <Text
              numberOfLines={1}
              className="font-sans-bold text-base tracking-tight text-text"
            >
              {value}
            </Text>
            <Text className="mt-0.5 font-mono text-[9.5px] uppercase tracking-wide text-faint">
              {label}
            </Text>
          </View>
        ))}
      </View>
    </PressableScale>
  );
};
