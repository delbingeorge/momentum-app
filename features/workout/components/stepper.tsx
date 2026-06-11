import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon, PressableScale } from "@/shared/ui";

interface StepperProps {
  value: number;
  onDec: () => void;
  onInc: () => void;
  onInput?: (value: number) => void;
  suffix?: string;
  big?: boolean;
}

export const Stepper = ({
  value,
  onDec,
  onInc,
  onInput,
  suffix,
  big,
}: StepperProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (draft.trim() !== "" && !Number.isNaN(parsed) && parsed >= 0) {
      onInput?.(parsed);
    }
  };

  return (
    <View className="flex-row items-center gap-1 rounded-full bg-bg p-[3px]">
      <PressableScale
        onPress={onDec}
        className="h-[26px] w-[26px] items-center justify-center rounded-full"
      >
        <Icon name="minus" size={14} color={COLORS.mut} strokeWidth={2.6} />
      </PressableScale>
      {editing ? (
        <TextInput
          autoFocus
          value={draft}
          keyboardType="decimal-pad"
          onChangeText={(text) => setDraft(text.replace(/[^0-9.]/g, ""))}
          onBlur={commit}
          onSubmitEditing={commit}
          className={cn(
            "p-0 text-center font-mono-bold text-text",
            big ? "w-[50px] text-xl" : "w-[40px] text-lg",
          )}
        />
      ) : (
        <Text
          onPress={
            onInput
              ? () => {
                  setDraft(String(value));
                  setEditing(true);
                }
              : undefined
          }
          className={cn("text-center", big ? "min-w-[50px]" : "min-w-[40px]")}
        >
          <Text
            className={cn(
              "font-mono-bold text-text",
              big ? "text-xl" : "text-lg",
            )}
          >
            {value}
          </Text>
          {suffix ? (
            <Text className="font-mono text-[10px] text-faint"> {suffix}</Text>
          ) : null}
        </Text>
      )}
      <PressableScale
        onPress={onInc}
        className="h-[26px] w-[26px] items-center justify-center rounded-full"
      >
        <Icon name="plus" size={14} color={COLORS.lime} strokeWidth={2.6} />
      </PressableScale>
    </View>
  );
};
