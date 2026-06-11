import { Text, View } from "react-native";
import type { SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import { kgToDisp } from "@/shared/lib/units";
import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, SheetScrollView } from "@/shared/ui";

const KG_PER_LB = 2.2046;

const TYPE_LABEL = { warmup: "W", drop: "D" } as const;
const TYPE_COLOR = { warmup: COLORS.warmup, drop: COLORS.drop } as const;

export const SessionDetailSheet = ({
  sheetId,
  payload,
}: SheetProps<"session-detail">) => {
  const unit = useSettingsStore((state) => state.unit);
  const session = payload?.session;
  if (!session) return null;

  const vol =
    unit === "kg" ? session.volume : Math.round(session.volume * KG_PER_LB);
  const stats: [string, string][] = [
    ["Volume", `${vol.toLocaleString()} ${unit}`],
    ["Sets", String(session.totalSets)],
    ["Time", fmtDur(session.durationSec)],
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
      <View className="flex-row gap-2 px-5 pt-3.5">
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
        {session.exercises.map((exercise, exIndex) => (
          <View key={`${exercise.name}-${exIndex}`} className="mb-3.5">
            <View className="mb-2 flex-row items-center gap-2">
              <Text className="font-sans-bold text-[15.5px] text-text">
                {exercise.name}
              </Text>
              <Text className="rounded-md bg-lime-dim px-1.5 py-0.5 font-mono text-[10px] text-lime">
                {exercise.muscle}
              </Text>
            </View>
            <View className="gap-1.5">
              {exercise.sets.map((set, setIndex) => (
                <View
                  key={setIndex}
                  className="flex-row items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-2.5"
                >
                  <Text
                    className="w-6 font-mono-bold text-xs"
                    style={{
                      color:
                        set.type !== "normal"
                          ? TYPE_COLOR[set.type]
                          : COLORS.faint,
                    }}
                  >
                    {set.type !== "normal" ? TYPE_LABEL[set.type] : setIndex + 1}
                  </Text>
                  <Text className="flex-1 font-sans text-sm text-text">
                    {kgToDisp(set.kg, unit)} {unit} × {set.reps}
                  </Text>
                  <Text className="font-mono text-[11px] text-faint">
                    {Math.round(
                      (unit === "kg" ? set.kg : set.kg * KG_PER_LB) * set.reps,
                    )}{" "}
                    {unit}·reps
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </SheetScrollView>
    </BaseSheet>
  );
};
