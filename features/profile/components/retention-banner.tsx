import { router } from "expo-router";
import { Text, View } from "react-native";

import { PressableScale } from "@/shared/ui/pressable-scale";
import { useRetentionWarning } from "@/shared/hooks/use-retention-warning";
import { COLORS } from "@/shared/lib/colors";
import { useLaunchStore } from "@/shared/stores";
import { Icon } from "@/shared/ui";

export const RetentionBanner = () => {
  const { show, daysLeft, count } = useRetentionWarning();
  const dismissed = useLaunchStore((state) => state.retentionBannerDismissed);
  if (!show || daysLeft === null || dismissed) return null;

  const when =
    daysLeft <= 0
      ? "today"
      : daysLeft === 1
        ? "tomorrow"
        : `in ${daysLeft} days`;
  const workouts = count === 1 ? "1 workout" : `${count} workouts`;

  return (
    <View className="mt-5 gap-3 rounded-[18px] border border-drop/40 bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-sans-bold text-[15px] text-text">
          8-week cycle resets {when}
        </Text>
        <PressableScale
          className="-m-1 p-1"
          onPress={() => useLaunchStore.getState().dismissRetentionBanner()}
        >
          <Icon name="x" size={17} color={COLORS.mut} strokeWidth={2.4} />
        </PressableScale>
      </View>
      <Text className="font-sans text-[13.5px] leading-5 text-mut">
        Your past {workouts} will be wiped on the free plan. Upgrade to keep
        your full history, or start a fresh cycle. Your plan and weights stay.
      </Text>
      <PressableScale
        onPress={() => router.push("/paywall")}
        className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-lime"
      >
        <Icon name="zap" size={17} color={COLORS.limeText} strokeWidth={2.4} />
        <Text className="font-sans-bold text-[15px] text-lime-text">
          Keep my history
        </Text>
      </PressableScale>
    </View>
  );
};
