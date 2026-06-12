import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useWorkoutStore } from "@/shared/stores";

import { buildActivity, monthLabels } from "../lib/activity";

const GAP = 3;
const EMPTY = "rgba(255,255,255,0.05)";
const FILLED = "#CBFB45";

interface ActivityHeatmapProps {
  weeks?: number;
  onSelectDay?: (dateKey: string) => void;
}

export const ActivityHeatmap = ({
  weeks: weekCount = 18,
  onSelectDay,
}: ActivityHeatmapProps) => {
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const [gridWidth, setGridWidth] = useState(0);
  const weeks = buildActivity(sessionDates, weekCount);
  const months = monthLabels(weeks);

  // cells flex to fill the card, so there is no dead space on wide screens
  const cell =
    gridWidth > 0
      ? Math.floor((gridWidth - (weekCount - 1) * GAP) / weekCount)
      : 0;

  return (
    <View className="rounded-[18px] bg-card px-3.5 pb-3.5 pt-3.5">
      <View className="mb-3 flex-row items-baseline justify-between">
        <Text className="font-sans-bold text-[15px] text-text">Activity</Text>
        <Text className="font-mono text-[10px] uppercase tracking-wide text-faint">
          Last {weekCount} weeks
        </Text>
      </View>
      <View onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
        {cell > 0 ? (
          <>
            <View className="mb-1 h-3.5">
              {months.map((m) => (
                <Text
                  key={m.col}
                  className="absolute font-mono text-[9.5px] text-faint"
                  style={{ left: m.col * (cell + GAP) }}
                >
                  {m.label}
                </Text>
              ))}
            </View>
            <View className="flex-row" style={{ gap: GAP }}>
              {weeks.map((week, col) => (
                <View key={col} style={{ gap: GAP }}>
                  {week.map((day, row) => {
                    const trained = !day.future && day.lvl > 0;
                    return (
                      <Pressable
                        key={row}
                        disabled={!trained || !day.key}
                        onPress={() => {
                          if (day.key) onSelectDay?.(day.key);
                        }}
                        hitSlop={2}
                        style={{
                          width: cell,
                          height: cell,
                          borderRadius: 3,
                          backgroundColor: day.future
                            ? "transparent"
                            : trained
                              ? FILLED
                              : EMPTY,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};
