import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useWorkoutStore } from "@/shared/stores";

import { buildActivity, monthLabels } from "../lib/activity";

const GAP = 3;
const MAX_CELL = 11;
const DAY_GUTTER = 26;
// GitHub's dark-mode ramp, mapped onto the app's lime accent
const LEVEL_COLORS = [
  "rgba(255,255,255,0.05)",
  "rgba(203,251,69,0.25)",
  "rgba(203,251,69,0.5)",
  "rgba(203,251,69,0.75)",
  "#CBFB45",
];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

interface ActivityHeatmapProps {
  weeks?: number;
  onSelectDay?: (dateKey: string) => void;
}

export const ActivityHeatmap = ({
  weeks: weekCount = 18,
  onSelectDay,
}: ActivityHeatmapProps) => {
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const pastSessions = useWorkoutStore((state) => state.pastSessions);
  const [gridWidth, setGridWidth] = useState(0);

  const { weeks, months } = useMemo(() => {
    // dates older than the kept session records still render, at the base level
    const setsByDate: Record<string, number> = {};
    sessionDates.forEach((date) => {
      setsByDate[date] = 0;
    });
    pastSessions.forEach((session) => {
      setsByDate[session.date] =
        (setsByDate[session.date] ?? 0) + session.totalSets;
    });
    const grid = buildActivity(setsByDate, weekCount);
    return { weeks: grid, months: monthLabels(grid) };
  }, [sessionDates, pastSessions, weekCount]);

  // GitHub-sized squares; shrink only when the grid wouldn't fit the card
  const cell =
    gridWidth > 0
      ? Math.min(
          MAX_CELL,
          Math.floor(
            (gridWidth - DAY_GUTTER - (weekCount - 1) * GAP) / weekCount,
          ),
        )
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
            <View className="mb-1 h-3.5" style={{ marginLeft: DAY_GUTTER }}>
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
            <View className="flex-row">
              <View style={{ width: DAY_GUTTER }}>
                {Object.entries(DAY_LABELS).map(([row, label]) => (
                  <Text
                    key={label}
                    className="absolute font-mono text-[9.5px] text-faint"
                    style={{ top: Number(row) * (cell + GAP) }}
                  >
                    {label}
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
                            borderRadius: 2,
                            backgroundColor: day.future
                              ? "transparent"
                              : LEVEL_COLORS[day.lvl],
                          }}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};
