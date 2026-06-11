import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import type { ScheduledDay } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

import { fullDay, shortDayName } from "../lib/format";

interface DaySwitcherProps {
  schedule: ScheduledDay[];
  todayIndex: number;
  onSelect: (index: number) => void;
}

export const DaySwitcher = ({
  schedule,
  todayIndex,
  onSelect,
}: DaySwitcherProps) => {
  const [open, setOpen] = useState(false);
  const day = schedule[todayIndex];
  if (!day) return null;

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-1.5 rounded-full bg-card2 py-1.5 pl-3 pr-2"
      >
        <Text className="font-sans-bold text-[14.5px] text-text">
          {fullDay(day.label)}
        </Text>
        <View className="h-5 w-5 items-center justify-center rounded-full bg-bg">
          <Icon name="chevD" size={13} color={COLORS.mut} strokeWidth={2.4} />
        </View>
      </PressableScale>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setOpen(false)}
        >
          <View className="absolute left-5 top-28 min-w-[190px] rounded-2xl border border-line bg-card2 p-1.5">
            {schedule.map((entry, index) => (
              <PressableScale
                key={`${entry.key}-${index}`}
                onPress={() => {
                  onSelect(index);
                  setOpen(false);
                }}
                className={cn(
                  "flex-row items-center justify-between rounded-xl px-3 py-2.5",
                  index === todayIndex && "bg-bg",
                )}
              >
                <Text className="font-sans-semibold text-[14.5px] text-text">
                  {fullDay(entry.label)}
                </Text>
                <Text className="font-mono text-[11px] text-mut">
                  {shortDayName(entry.name)}
                </Text>
              </PressableScale>
            ))}
            <View className="mx-2 my-1 h-px bg-line" />
            <PressableScale
              onPress={() => {
                setOpen(false);
                router.push("/onboarding/goal");
              }}
              className="flex-row items-center gap-2 rounded-xl px-3 py-2.5"
            >
              <Icon name="sliders" size={15} color={COLORS.mut} />
              <Text className="font-sans-semibold text-sm text-mut">
                Edit plan
              </Text>
            </PressableScale>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
