import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { addDays } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui";
import type { StreakWeek } from "../lib/streak-journey";

interface StreakWeekRowProps {
  week: StreakWeek;
  isLast: boolean;
  connectsToStreak: boolean;
}

const formatWeekLabel = (week: StreakWeek): string => {
  if (week.isCurrentWeek) return "This week";
  const start = new Date(week.weekStart);
  const end = addDays(start, 6);
  const opts = { month: "short", day: "numeric" } as const;
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
};

export const StreakWeekRow = ({
  week,
  isLast,
  connectsToStreak,
}: StreakWeekRowProps) => {
  const isActive = week.sessionCount > 0;
  const label = formatWeekLabel(week);
  const sessionLabel =
    week.sessionCount === 1 ? "1 session" : `${week.sessionCount} sessions`;

  return (
    <View className="flex-row gap-3.5 px-5">
      <View className="items-center">
        <View
          className={cn(
            "h-9 w-9 items-center justify-center rounded-full",
            isActive ? "bg-lime" : "border border-line2 bg-card2",
            week.isCurrentWeek && !isActive && "border-lime",
          )}
        >
          <Icon
            name={isActive ? "fire" : "minus"}
            size={16}
            color={isActive ? COLORS.limeText : COLORS.faint}
            strokeWidth={2.2}
          />
        </View>
        {!isLast ? (
          <View
            className={cn(
              "w-0.5 flex-1",
              connectsToStreak ? "bg-lime" : "bg-line2",
            )}
          />
        ) : null}
      </View>
      <View className={cn("flex-1", !isLast && "pb-5")}>
        <Text
          className={cn(
            "font-sans-semibold text-[15px]",
            isActive ? "text-text" : "text-mut",
          )}
        >
          {label}
        </Text>
        <Text className="mt-0.5 font-mono text-[11px] text-faint">
          {isActive ? sessionLabel : "Rest week"}
        </Text>
      </View>
      {week.inCurrentStreak ? (
        <View className="h-6 items-center justify-center rounded-md bg-lime-dim px-1.5">
          <Text className="font-mono text-[10px] text-lime">STREAK</Text>
        </View>
      ) : null}
    </View>
  );
};
