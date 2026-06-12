import { useState } from "react";
import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { useSettingsStore } from "@/shared/stores";
import { BaseSheet, CtaButton, Icon, PressableScale } from "@/shared/ui";

import { fmt12 } from "../lib/reminder-format";
import { scheduleReminder } from "../lib/reminder-scheduler";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const PRESETS: [string, number[]][] = [
  ["Every day", [0, 1, 2, 3, 4, 5, 6]],
  ["Weekdays", [1, 2, 3, 4, 5]],
];

const TimeStepper = ({
  value,
  onChange,
  min,
  max,
  step,
  pad,
}: {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  pad?: boolean;
}) => {
  const wrap = (n: number) => (n > max ? min : n < min ? max : n);
  return (
    <View className="items-center gap-1">
      <PressableScale
        onPress={() => onChange(wrap(value + step))}
        className="h-9 w-12 items-center justify-center rounded-xl bg-card2"
      >
        <Icon name="arrowUp" size={16} color={COLORS.mut} strokeWidth={2.4} />
      </PressableScale>
      <Text className="w-12 text-center font-sans-bold text-[28px] text-text">
        {pad ? String(value).padStart(2, "0") : value}
      </Text>
      <PressableScale
        onPress={() => onChange(wrap(value - step))}
        className="h-9 w-12 items-center justify-center rounded-xl bg-card2"
      >
        <Icon name="chevD" size={16} color={COLORS.mut} strokeWidth={2.4} />
      </PressableScale>
    </View>
  );
};

export const ReminderSheet = ({ sheetId }: SheetProps<"reminder-config">) => {
  const reminder = useSettingsStore((state) => state.reminder);
  const setReminder = useSettingsStore((state) => state.setReminder);

  const [h0 = 18, m0 = 0] = reminder.time.split(":").map(Number);
  const [hour, setHour] = useState(h0 % 12 === 0 ? 12 : h0 % 12);
  const [minute, setMinute] = useState(m0);
  const [isPm, setIsPm] = useState(h0 >= 12);
  const [days, setDays] = useState(
    reminder.days.length ? reminder.days : [0, 1, 2, 3, 4, 5, 6],
  );

  const toggleDay = (day: number) =>
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b),
    );

  const hour24 = (hour % 12) + (isPm ? 12 : 0);
  const time = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const save = () => {
    setReminder({ ...reminder, time, days });
    if (reminder.enabled) void scheduleReminder(time, days);
    SheetManager.hide(sheetId);
  };

  return (
    <BaseSheet sheetId={sheetId} title="Workout reminder">
      <View className="flex-row items-center justify-center gap-3 py-3">
        <TimeStepper value={hour} onChange={setHour} min={1} max={12} step={1} />
        <Text className="font-sans-bold text-2xl text-text">:</Text>
        <TimeStepper value={minute} onChange={setMinute} min={0} max={55} step={5} pad />
        <View className="ml-2 gap-1.5">
          {(["AM", "PM"] as const).map((label) => {
            const on = label === "PM" ? isPm : !isPm;
            return (
              <PressableScale
                key={label}
                onPress={() => setIsPm(label === "PM")}
                className={cn(
                  "h-9 w-14 items-center justify-center rounded-xl",
                  on ? "bg-lime" : "bg-card2",
                )}
              >
                <Text
                  className={cn(
                    "font-sans-bold text-sm",
                    on ? "text-lime-text" : "text-mut",
                  )}
                >
                  {label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View className="px-5 pt-2">
        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="font-mono text-[11px] uppercase tracking-wider text-faint">
            Repeat
          </Text>
          <View className="flex-row gap-1.5">
            {PRESETS.map(([label, preset]) => (
              <PressableScale
                key={label}
                onPress={() => setDays(preset)}
                className="rounded-full bg-card2 px-3 py-1.5"
              >
                <Text className="font-sans-semibold text-xs text-mut">{label}</Text>
              </PressableScale>
            ))}
          </View>
        </View>
        <View className="flex-row gap-1.5">
          {DAY_LETTERS.map((label, day) => {
            const on = days.includes(day);
            return (
              <PressableScale
                key={day}
                onPress={() => toggleDay(day)}
                className={cn(
                  "h-11 flex-1 items-center justify-center rounded-xl border",
                  on ? "border-lime bg-lime" : "border-line bg-bg",
                )}
              >
                <Text
                  className={cn(
                    "font-sans-bold text-[15px]",
                    on ? "text-lime-text" : "text-mut",
                  )}
                >
                  {label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View className="px-5 pb-1 pt-4">
        <CtaButton
          label={`Save · ${fmt12(time)}`}
          icon="check"
          disabled={!days.length}
          onPress={save}
        />
      </View>
    </BaseSheet>
  );
};
