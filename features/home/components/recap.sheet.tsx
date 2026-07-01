import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { ExerciseSetTable } from "@/features/workout";
import { COLORS } from "@/shared/lib/colors";
import { fmtHM } from "@/shared/lib/dates";
import { volumeToDisp } from "@/shared/lib/units";
import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

import { relDate } from "../lib/recap";

export const RecapSheet = ({
  sheetId,
  payload,
}: SheetProps<"session-recap">) => {
  const unit = useSettingsStore((state) => state.unit);
  const session = payload?.session;
  if (!session) return null;

  const vol = volumeToDisp(session.volume, unit).toLocaleString();

  const stats: { k: string; v: string; u: string }[] = [
    { k: "Volume", v: vol, u: unit },
    { k: "Sets", v: String(session.totalSets), u: "working" },
    { k: "Time", v: fmtHM(session.durationSec), u: "" },
  ];

  return (
    <BaseSheet sheetId={sheetId} fullHeight>
      <View className="flex-row items-start justify-between gap-3 px-5 pb-4 pt-2">
        <View className="flex-1">
          <Text className="font-mono text-[11px] uppercase tracking-widest text-lime">
            Recap · {relDate(session.ts)}
          </Text>
          <Text className="mt-1 font-sans-bold text-[27px] tracking-tight text-text">
            {session.dayName}
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
                  <Text className="font-sans text-[11px] text-mut">
                    {stat.u}
                  </Text>
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
        <ExerciseSetTable exercises={session.exercises} />
      </SheetScrollView>
    </BaseSheet>
  );
};
