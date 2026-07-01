import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { useIsPaid } from "@/shared/lib/entitlements";
import { weekStreak } from "@/shared/lib/streaks";
import { useWorkoutStore } from "@/shared/stores";
import { Icon } from "@/shared/ui";
import { PressableScale } from "@/shared/ui/pressable-scale";

// `explore` adds a browse-catalog shortcut next to the streak chip. It lives in
// the header (not the tab bar) so the bottom bar stays free for future sections.
export const BrandBar = ({ explore = false }: { explore?: boolean }) => {
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const streak = weekStreak(sessionDates);
  const isPaid = useIsPaid();

  return (
    <View className="flex-row items-center justify-between px-5 pb-3.5 pt-1">
      <Pressable
        onLongPress={() => router.push("/about")}
        className="flex-row items-center justify-center gap-1"
      >
        <View className="h-8 w-8 items-center justify-center">
          <Icon name="logo" size={23} color={COLORS.lime} strokeWidth={2.2} />
        </View>
        <Text className="font-sans-extrabold text-xl tracking-tight text-text">
          Momentum
        </Text>
        {isPaid ? (
          <Icon name="crown" size={12} color={COLORS.lime} strokeWidth={2.2} />
        ) : null}
      </Pressable>
      <View className="flex-row items-center gap-2">
        {explore ? (
          <PressableScale
            onPress={() => router.push("/explore")}
            className="h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <Icon name="search" size={17} color={COLORS.text} strokeWidth={2} />
          </PressableScale>
        ) : null}
        <PressableScale
          onPress={() => SheetManager.show("streak-journey")}
          className="flex-row items-center gap-1.5 rounded-full bg-card py-1.5 pl-2.5 pr-3"
        >
          <Icon name="fire" size={15} color={COLORS.lime} />
          <Text className="font-mono text-[12.5px] text-text">{streak}</Text>
        </PressableScale>
      </View>
    </View>
  );
};
