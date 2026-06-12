import { Text, View } from "react-native";
import type { SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { useWorkoutStore } from "@/shared/stores";
import { BaseSheet, Icon, SheetScrollView } from "@/shared/ui";
import { StreakWeekRow } from "./streak-week-row";
import { buildStreakJourney } from "../lib/streak-journey";
import type { IconName } from "@/shared/ui";

interface StreakStatProps {
  icon: IconName;
  value: string;
  label: string;
}

const StreakStat = ({ icon, value, label }: StreakStatProps) => (
  <View className="flex-1 rounded-2xl bg-card px-3 py-3">
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={15} color={COLORS.lime} />
      <Text className="font-sans-bold text-[17px] tracking-tight text-text">
        {value}
      </Text>
    </View>
    <Text className="mt-0.5 font-mono text-[9.5px] uppercase text-faint">
      {label}
    </Text>
  </View>
);

const EmptyJourney = () => (
  <View className="flex-1 items-center justify-center px-5 pb-16">
    <View className="h-14 w-14 items-center justify-center rounded-full bg-card2">
      <Icon name="fire" size={26} color={COLORS.faint} />
    </View>
    <Text className="mt-4 font-sans-bold text-base text-text">
      No streak yet
    </Text>
    <Text className="mt-1 text-center font-sans text-[13px] text-mut">
      Finish your first workout to light the flame and start your journey.
    </Text>
  </View>
);

export const StreakJourneySheet = ({
  sheetId,
}: SheetProps<"streak-journey">) => {
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const journey = buildStreakJourney(sessionDates);
  const hasSessions = journey.totalSessions > 0;

  return (
    <BaseSheet sheetId={sheetId} title="Streak journey" fullHeight>
      {hasSessions ? (
        <>
          <View className="flex-row gap-2 px-5 pt-1 pb-3">
            <StreakStat
              icon="fire"
              value={`${journey.currentStreak} wk`}
              label="Current"
            />
            <StreakStat
              icon="medal"
              value={`${journey.bestStreak} wk`}
              label="Best"
            />
            <StreakStat
              icon="dumbbell"
              value={String(journey.totalSessions)}
              label="Sessions"
            />
          </View>
          <SheetScrollView
            className="pt-5"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {journey.weeks.map((week, index) => (
              <StreakWeekRow
                key={week.weekStart}
                week={week}
                isLast={index === journey.weeks.length - 1}
                connectsToStreak={
                  week.inCurrentStreak &&
                  (journey.weeks[index + 1]?.inCurrentStreak ?? false)
                }
              />
            ))}
            {journey.hiddenWeeks > 0 ? (
              <Text className="px-5 pt-2 font-mono text-[11px] text-faint">
                +{journey.hiddenWeeks} earlier weeks
              </Text>
            ) : null}
          </SheetScrollView>
        </>
      ) : (
        <EmptyJourney />
      )}
    </BaseSheet>
  );
};
