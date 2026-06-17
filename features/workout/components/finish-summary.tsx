import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { fmtHM } from "@/shared/lib/dates";
import { haptics } from "@/shared/lib/haptics";
import { volumeToDisp } from "@/shared/lib/units";
import { useSettingsStore, useWorkoutStore } from "@/shared/stores";
import { CtaButton, Icon, Screen, SignInBackdrop } from "@/shared/ui";

const REVIEW_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export const FinishSummary = () => {
  const session = useWorkoutStore((state) => state.pastSessions[0]);
  const sessionCount = useWorkoutStore((state) => state.pastSessions.length);
  const unit = useSettingsStore((state) => state.unit);
  const reviewPromptDone = useSettingsStore((state) => state.reviewPromptDone);
  const reviewPromptNextTs = useSettingsStore(
    (state) => state.reviewPromptNextTs,
  );
  const snoozeReviewPrompt = useSettingsStore(
    (state) => state.snoozeReviewPrompt,
  );

  useEffect(() => {
    haptics.success();
  }, []);

  // Ask for a review after a workout, starting on the first. Showing it snoozes
  // a week ahead, so "Remind me later" (or a swipe-away) just defers ~7 days;
  // only rating marks it done. Delay lets the finish screen settle first.
  useEffect(() => {
    if (reviewPromptDone || sessionCount < 1 || Date.now() < reviewPromptNextTs)
      return;
    const timer = setTimeout(() => {
      snoozeReviewPrompt(Date.now() + REVIEW_SNOOZE_MS);
      SheetManager.show("review");
    }, 900);
    return () => clearTimeout(timer);
  }, [sessionCount, reviewPromptDone, reviewPromptNextTs, snoozeReviewPrompt]);

  if (!session) return null;
  const volume = volumeToDisp(session.volume, unit);

  const stats: [string, string][] = [
    ["Sets", String(session.totalSets)],
    ["Volume", `${volume.toLocaleString()} ${unit}`],
    ["Time", fmtHM(session.durationSec)],
  ];

  return (
    <Screen className="px-6 pb-4 pt-10">
      <SignInBackdrop />

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
          <View className="mt-2">
            <Text className="font-sans-bold text-[38px] leading-10 tracking-tight text-text">
              Nice work.
            </Text>
            <Text className="font-sans-bold text-[38px] tracking-tight text-text">
              Logged & done.
            </Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          {stats.map(([label, value]) => (
            <View key={label} className="flex-1 rounded-xl bg-card px-3.5 py-4">
              <Text className="font-sans-bold text-[20px] tracking-tight text-text">
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
