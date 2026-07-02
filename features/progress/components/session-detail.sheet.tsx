import { Text, View } from "react-native";
import type { SheetProps } from "react-native-actions-sheet";

import { ExerciseSetTable } from "@/features/workout";
import { fmtHM } from "@/shared/lib/dates";
import { volumeToDisp } from "@/shared/lib/units";
import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, SheetScrollView } from "@/shared/ui";

export const SessionDetailSheet = ({
  sheetId,
  payload,
}: SheetProps<"session-detail">) => {
  const unit = useSettingsStore((state) => state.unit);
  const session = payload?.session;
  if (!session) return null;

  const vol = volumeToDisp(session.volume, unit);
  const stats: [string, string][] = [
    ["Volume", `${vol.toLocaleString()} ${unit}`],
    ["Sets", String(session.totalSets)],
    ["Time", fmtHM(session.durationSec)],
  ];

  return (
    <BaseSheet sheetId={sheetId} title={session.dayName} fullHeight>
      <Text className="-mt-2 px-5 font-mono text-[11.5px] text-faint">
        {new Date(session.ts).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </Text>
      <View className="flex-row gap-2 px-5 pt-3.5 pb-2">
        {stats.map(([label, value]) => (
          <View key={label} className="flex-1 rounded-2xl bg-card px-3 py-3">
            <Text className="font-sans-bold text-[17px] tracking-tight text-text">
              {value}
            </Text>
            <Text className="mt-0.5 font-mono text-[9.5px] uppercase text-faint">
              {label}
            </Text>
          </View>
        ))}
      </View>
      <SheetScrollView
        className="px-5 pt-3.5"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ExerciseSetTable exercises={session.exercises} />
      </SheetScrollView>
    </BaseSheet>
  );
};
