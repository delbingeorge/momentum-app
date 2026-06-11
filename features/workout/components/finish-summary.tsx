import { router } from "expo-router";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import { useSettingsStore, useWorkoutStore } from "@/shared/stores";
import { CtaButton, Icon, Screen } from "@/shared/ui";

const KG_PER_LB = 2.2046;

export const FinishSummary = () => {
  const session = useWorkoutStore((state) => state.pastSessions[0]);
  const unit = useSettingsStore((state) => state.unit);

  if (!session) return null;
  const volume = Math.round(
    unit === "kg" ? session.volume : session.volume * KG_PER_LB,
  );

  const stats: [string, string][] = [
    ["Sets", String(session.totalSets)],
    ["Volume", `${volume.toLocaleString()} ${unit}`],
    ["Time", fmtDur(session.durationSec)],
  ];

  return (
    <Screen className="px-6 pb-4 pt-10">
      <View className="flex-1 justify-center gap-7">
        <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-lime">
          <Icon
            name="check"
            size={44}
            color={COLORS.limeText}
            strokeWidth={2.6}
          />
        </View>
        <View>
          <Text className="font-mono text-xs uppercase tracking-widest text-lime">
            {session.dayName} complete
          </Text>
          <Text className="mt-2 font-sans-bold text-[38px] leading-10 tracking-tight text-text">
            Nice work.{"\n"}Logged & done.
          </Text>
        </View>
        <View className="flex-row gap-3">
          {stats.map(([label, value]) => (
            <View
              key={label}
              className="flex-1 rounded-[18px] bg-card px-3.5 py-4"
            >
              <Text className="font-sans-bold text-[22px] tracking-tight text-text">
                {value}
              </Text>
              <Text className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-faint">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <CtaButton
        label="Back to home"
        onPress={() => router.dismissTo("/(tabs)")}
      />
    </Screen>
  );
};
