import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { GENDERS } from "@/shared/lib/program";
import { usePlanStore, useSettingsStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale } from "@/shared/ui";

import { OnboardingShell } from "./onboarding-shell";

const KG_PER_LB = 2.2046;

export const AboutScreen = () => {
  const gender = usePlanStore((state) => state.gender);
  const setGender = usePlanStore((state) => state.setGender);
  const weightKg = usePlanStore((state) => state.weightKg);
  const setWeightKg = usePlanStore((state) => state.setWeightKg);
  const unit = useSettingsStore((state) => state.unit);

  const isLb = unit === "lb";
  const shown = isLb ? Math.round(weightKg * KG_PER_LB) : Math.round(weightKg);
  const min = isLb ? 66 : 30;
  const max = isLb ? 440 : 200;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commitShown = (value: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    setWeightKg(isLb ? clamped / KG_PER_LB : clamped);
  };

  const commitDraft = () => {
    setEditing(false);
    const value = parseInt(draft, 10);
    if (draft.trim() !== "" && !Number.isNaN(value) && value > 0) {
      commitShown(value);
    }
  };

  return (
    <OnboardingShell
      step={2}
      title="A bit about you"
      sub="Used to personalise your starting loads."
      onBack={() => router.back()}
      footer={
        <CtaButton
          label="Continue"
          icon="chevR"
          disabled={!gender}
          onPress={() => router.push("/onboarding/days")}
        />
      }
    >
      <View className="mt-1 gap-6">
        <View>
          <Text className="mb-2.5 font-sans-semibold text-sm text-mut">Gender</Text>
          <View className="flex-row gap-2.5">
            {GENDERS.map((option) => {
              const selected = gender === option.id;
              return (
                <PressableScale
                  key={option.id}
                  onPress={() => setGender(option.id)}
                  className={cn(
                    "h-14 flex-1 items-center justify-center rounded-2xl",
                    selected ? "bg-lime" : "bg-card",
                  )}
                >
                  <Text
                    className={cn(
                      "font-sans-semibold text-base",
                      selected ? "text-lime-text" : "text-text",
                    )}
                  >
                    {option.name}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-2.5 font-sans-semibold text-sm text-mut">
            Bodyweight
          </Text>
          <View className="flex-row items-center justify-between rounded-[20px] bg-card p-4">
            <PressableScale
              onPress={() => commitShown(shown - 1)}
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
            >
              <Icon name="minus" size={20} strokeWidth={2.4} />
            </PressableScale>
            <View className="flex-row items-baseline gap-1.5">
              {editing ? (
                <TextInput
                  autoFocus
                  value={draft}
                  keyboardType="number-pad"
                  onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, ""))}
                  onBlur={commitDraft}
                  onSubmitEditing={commitDraft}
                  className="w-24 p-0 text-center font-sans-bold text-4xl text-text"
                />
              ) : (
                <Text
                  onPress={() => {
                    setDraft(String(shown));
                    setEditing(true);
                  }}
                  className="font-sans-bold text-4xl tracking-tight text-text"
                >
                  {shown}
                </Text>
              )}
              <Text className="font-mono text-sm text-mut">{unit}</Text>
            </View>
            <PressableScale
              onPress={() => commitShown(shown + 1)}
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-card2"
            >
              <Icon name="plus" size={20} color={COLORS.lime} strokeWidth={2.4} />
            </PressableScale>
          </View>
        </View>
      </View>
    </OnboardingShell>
  );
};
