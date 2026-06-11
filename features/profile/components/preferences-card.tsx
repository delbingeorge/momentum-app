import { useState } from "react";
import { Text, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { haptics } from "@/shared/lib/haptics";
import { requestNotificationPermission } from "@/shared/lib/notifications";
import { useSettingsStore } from "@/shared/stores";
import type { Unit } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

import { fmt12, reminderSummary } from "../lib/reminder-format";
import { cancelReminder, scheduleReminder } from "../lib/reminder-scheduler";

const UNITS: Unit[] = ["kg", "lb"];

const fmtRest = (sec: number): string =>
  sec >= 60 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}` : `${sec}s`;

export const PreferencesCard = () => {
  const unit = useSettingsStore((state) => state.unit);
  const setUnit = useSettingsStore((state) => state.setUnit);
  const restSec = useSettingsStore((state) => state.restSec);
  const setRestSec = useSettingsStore((state) => state.setRestSec);
  const reminder = useSettingsStore((state) => state.reminder);
  const setReminder = useSettingsStore((state) => state.setReminder);
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((state) => state.setHapticsEnabled);

  const stepRest = (delta: number) =>
    setRestSec(Math.max(30, Math.min(300, restSec + delta)));

  const [denied, setDenied] = useState(false);

  // flip the switch immediately; request permission in the background and
  // revert only if denied (same UX as the MVP)
  const toggleReminder = async () => {
    const next = !reminder.enabled;
    setReminder({ ...reminder, enabled: next });
    setDenied(false);
    if (!next) {
      void cancelReminder();
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === "denied") {
      setReminder({ ...reminder, enabled: false });
      setDenied(true);
      return;
    }
    void scheduleReminder(reminder.time, reminder.days);
  };

  return (
    <View className="overflow-hidden rounded-[18px] bg-card">
      <View className="flex-row items-center gap-3 border-b border-line px-4 py-3">
        <Icon name="sliders" size={19} color={COLORS.mut} />
        <Text className="flex-1 font-sans text-[15px] text-text">Units</Text>
        <View className="flex-row rounded-full bg-bg p-[3px]">
          {UNITS.map((option) => (
            <PressableScale
              key={option}
              onPress={() => setUnit(option)}
              className={cn(
                "rounded-full px-3 py-1",
                unit === option && "bg-lime",
              )}
            >
              <Text
                className={cn(
                  "font-mono text-[11.5px]",
                  unit === option ? "text-lime-text" : "text-mut",
                )}
              >
                {option}
              </Text>
            </PressableScale>
          ))}
        </View>
      </View>

      <View className="flex-row items-center gap-3 border-b border-line px-4 py-3">
        <Icon name="timer" size={19} color={COLORS.mut} />
        <Text className="flex-1 font-sans text-[15px] text-text">Rest timer</Text>
        <View className="flex-row items-center gap-0.5 rounded-full bg-bg p-[3px]">
          <PressableScale
            onPress={() => stepRest(-15)}
            className="h-[30px] w-[30px] items-center justify-center rounded-full"
          >
            <Icon name="minus" size={15} color={COLORS.mut} strokeWidth={2.4} />
          </PressableScale>
          <Text className="w-[46px] text-center font-mono text-[13.5px] text-text">
            {fmtRest(restSec)}
          </Text>
          <PressableScale
            onPress={() => stepRest(15)}
            className="h-[30px] w-[30px] items-center justify-center rounded-full"
          >
            <Icon name="plus" size={15} color={COLORS.lime} strokeWidth={2.4} />
          </PressableScale>
        </View>
      </View>

      <View className="flex-row items-center gap-3 border-b border-line px-4 py-3">
        <Icon name="zap" size={19} color={COLORS.mut} />
        <Text className="flex-1 font-sans text-[15px] text-text">Haptics</Text>
        <PressableScale
          haptic={false}
          onPress={() => {
            setHapticsEnabled(!hapticsEnabled);
            // confirm the new state by feel: buzz only when turning on
            if (!hapticsEnabled) haptics.success();
          }}
          className={cn(
            "h-7 w-[46px] justify-center rounded-full p-[3px]",
            hapticsEnabled ? "items-end bg-lime" : "items-start bg-card2",
          )}
        >
          <View className="h-[22px] w-[22px] rounded-full bg-white" />
        </PressableScale>
      </View>

      <View className="flex-row items-center gap-3 px-4 py-3">
        <Icon name="bell" size={19} color={COLORS.mut} />
        <View className="flex-1">
          <Text className="font-sans text-[15px] text-text">
            Workout reminder
          </Text>
          {denied ? (
            <Text className="mt-0.5 font-mono text-[10px] text-drop">
              Enable notifications in settings
            </Text>
          ) : null}
        </View>
        <PressableScale
          onPress={toggleReminder}
          className={cn(
            "h-7 w-[46px] justify-center rounded-full p-[3px]",
            reminder.enabled ? "items-end bg-lime" : "items-start bg-card2",
          )}
        >
          <View className="h-[22px] w-[22px] rounded-full bg-white" />
        </PressableScale>
      </View>

      {reminder.enabled ? (
        <PressableScale
          onPress={() => SheetManager.show("reminder-config")}
          className="mx-4 mb-3.5 flex-row items-center gap-2.5 rounded-xl bg-bg px-3.5 py-3"
        >
          <Icon name="clock" size={16} color={COLORS.lime} />
          <View className="flex-1">
            <Text className="font-sans-semibold text-[14.5px] text-text">
              {fmt12(reminder.time)}
            </Text>
            <Text className="mt-px font-mono text-[10.5px] text-faint">
              {reminderSummary(reminder.days)}
            </Text>
          </View>
          <Text className="font-sans-semibold text-[13px] text-lime">Edit</Text>
          <Icon name="chevR" size={16} color={COLORS.faint} />
        </PressableScale>
      ) : null}
    </View>
  );
};
