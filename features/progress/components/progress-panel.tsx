import { ScrollView, Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import {
  filterDatesToFreeWindow,
  filterSessionsToFreeWindow,
  FREE_HISTORY_WEEKS,
  freePrCutoffTs,
  PAID_HISTORY_WEEKS,
  useIsPaid,
} from "@/shared/lib/entitlements";
import { weekStreak } from "@/shared/lib/streaks";
import { useSettingsStore, useWorkoutStore } from "@/shared/stores";
import { BrandBar } from "@/shared/ui";

import { recentPRs, trainingStats } from "../lib/training-stats";
import { ActivityHeatmap } from "./activity-heatmap";
import { BodyweightCard } from "./bodyweight-card";
import { PrList } from "./pr-list";
import { SessionHistoryList } from "./session-history-list";

export const ProgressPanel = () => {
  const pastSessions = useWorkoutStore((state) => state.pastSessions);
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const unit = useSettingsStore((state) => state.unit);
  const isPaid = useIsPaid();

  // free tier sees a limited window; data itself is never touched
  const visibleSessions = isPaid
    ? pastSessions
    : filterSessionsToFreeWindow(pastSessions);
  const visibleDates = isPaid
    ? sessionDates
    : filterDatesToFreeWindow(sessionDates);
  const lockedCount = pastSessions.length - visibleSessions.length;

  const stats = trainingStats(visibleSessions);
  const allPrs = recentPRs(visibleSessions, 4);
  const prs = isPaid
    ? allPrs
    : allPrs.filter((pr) => pr.ts >= freePrCutoffTs());
  const streak = weekStreak(visibleDates);

  const statCards: [string, string, boolean][] = [
    [String(stats.total), "workouts", true],
    [String(stats.thisWeek), "this week", false],
    [`${streak} wk${streak === 1 ? "" : "s"}`, "streak", false],
  ];

  return (
    <View className="flex-1">
      <BrandBar />
      <Text className="px-5 pb-2 font-sans-bold text-[27px] tracking-tight text-text">
        Progress
      </Text>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-4 pb-6"
      >
        <View className="flex-row gap-2.5 pt-3">
          {statCards.map(([value, label, highlight]) => (
            <View
              key={label}
              className="flex-1 rounded-[18px] bg-card px-3.5 py-3.5"
            >
              <Text
                className={`font-sans-bold text-2xl tracking-tight ${highlight ? "text-lime" : "text-text"}`}
              >
                {value}
              </Text>
              <Text className="mt-1 font-mono text-[10px] uppercase tracking-wide text-faint">
                {label}
              </Text>
            </View>
          ))}
        </View>
        <ActivityHeatmap
          weeks={isPaid ? PAID_HISTORY_WEEKS : FREE_HISTORY_WEEKS}
          onSelectDay={(dateKey) => {
            const session = visibleSessions.find((s) => s.date === dateKey);
            if (session)
              SheetManager.show("session-detail", { payload: { session } });
          }}
        />
        <BodyweightCard />
        <PrList prs={prs} unit={unit} />
        <SessionHistoryList
          sessions={visibleSessions}
          lockedCount={lockedCount}
          unit={unit}
          onSelect={(session) =>
            SheetManager.show("session-detail", { payload: { session } })
          }
        />
      </ScrollView>
    </View>
  );
};
