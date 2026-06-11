import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { GOALS, splitsFor } from "@/shared/lib/program";
import { weekStreak } from "@/shared/lib/streaks";
import {
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";
import { BrandBar, CtaButton, Icon, type IconName, PressableScale } from "@/shared/ui";

import { PreferencesCard } from "./preferences-card";

const SectionLabel = ({ children }: { children: string }) => (
  <Text className="mb-2.5 mt-5 font-mono text-[11px] uppercase tracking-wider text-faint">
    {children}
  </Text>
);

const PlanRow = ({
  icon,
  label,
  value,
  last,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View
    className={`flex-row items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-line"}`}
  >
    <Icon name={icon} size={19} color={COLORS.mut} />
    <Text className="flex-1 font-sans text-[15px] text-text">{label}</Text>
    <Text className="font-sans-medium text-[14.5px] text-mut">{value}</Text>
  </View>
);

export const ProfilePanel = () => {
  const goal = usePlanStore((state) => state.goal);
  const days = usePlanStore((state) => state.days);
  const splitId = usePlanStore((state) => state.splitId);
  const sessionDates = useWorkoutStore((state) => state.sessionDates);
  const [resetArmed, setResetArmed] = useState(false);

  const goalName = GOALS.find((g) => g.id === goal)?.name ?? "Custom";
  const splitName =
    splitsFor(days).find((s) => s.id === splitId)?.name ?? "—";
  const streak = weekStreak(sessionDates);

  const resetAll = () => {
    usePlanStore.getState().resetPlan();
    useWorkoutStore.getState().resetWorkouts();
    useBodyStore.getState().resetBody();
    useSettingsStore.getState().resetSettings();
    router.replace("/welcome");
  };

  return (
    <View className="flex-1">
      <BrandBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Text className="pb-3 font-sans-bold text-[27px] tracking-tight text-text">
          Profile
        </Text>

        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full border border-line bg-card2">
            <Icon name="user" size={30} color={COLORS.mut} />
          </View>
          <View>
            <Text className="font-sans-bold text-[21px] tracking-tight text-text">
              Athlete
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5 self-start rounded-lg bg-lime-dim px-2.5 py-1">
              <Icon name="fire" size={12} color={COLORS.lime} />
              <Text className="font-mono text-[11.5px] text-lime">
                {streak}-week streak
              </Text>
            </View>
          </View>
        </View>

        <SectionLabel>Your plan</SectionLabel>
        <View className="overflow-hidden rounded-[18px] bg-card">
          <PlanRow icon="target" label="Goal" value={goalName} />
          <PlanRow icon="dumbbell" label="Split" value={splitName} />
          <PlanRow icon="home" label="Days / week" value={String(days)} last />
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <PreferencesCard />

        <SectionLabel>Export data</SectionLabel>
        <PressableScale
          onPress={() => SheetManager.show("export-data")}
          className="flex-row items-center gap-3 rounded-[18px] bg-card px-4 py-3.5"
        >
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
            <Icon name="download" size={18} color={COLORS.lime} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-[15px] text-text">
              Export your data
            </Text>
            <Text className="mt-0.5 font-sans text-xs text-mut">
              Workouts, bodyweight, history or a full backup.
            </Text>
          </View>
          <Icon name="chevR" size={16} color={COLORS.faint} />
        </PressableScale>

        <View className="mt-6 gap-3">
          <CtaButton
            label="Edit plan"
            icon="sliders"
            variant="white"
            onPress={() => router.push("/onboarding/goal")}
          />
          <PressableScale
            onPress={() => {
              if (resetArmed) resetAll();
              else setResetArmed(true);
            }}
            className={`h-[50px] flex-row items-center justify-center gap-2 rounded-full border ${resetArmed ? "border-danger/60" : "border-line2"}`}
          >
            <Icon
              name="rotate"
              size={17}
              color={resetArmed ? COLORS.danger : COLORS.mut}
              strokeWidth={2.2}
            />
            <Text
              className={`font-sans-semibold text-[15px] ${resetArmed ? "text-danger" : "text-mut"}`}
            >
              {resetArmed ? "Tap again to erase everything" : "Reset & start over"}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
};
