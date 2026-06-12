import { router } from "expo-router";
import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { DAY, splitsFor } from "@/shared/lib/program";
import { usePlanStore } from "@/shared/stores";
import { CtaButton, Icon, PressableScale } from "@/shared/ui";

import { OnboardingShell } from "./onboarding-shell";

const shortDayName = (name: string) => name.replace(/ (day|body)/i, "");

export const SplitScreen = () => {
  const days = usePlanStore((state) => state.days);
  const splitId = usePlanStore((state) => state.splitId);
  const setSplitId = usePlanStore((state) => state.setSplitId);

  const options = splitsFor(days);

  const handleNext = () => {
    usePlanStore.getState().confirmSplit();
    router.push("/onboarding/exercises");
  };

  return (
    <OnboardingShell
      step={4}
      title="Pick your split"
      sub={`Ways to organise ${days} training days.`}
      onBack={() => router.back()}
      footer={
        <CtaButton
          label="Continue"
          icon="chevR"
          disabled={!splitId}
          onPress={handleNext}
        />
      }
    >
      <View className="gap-3 pb-2">
        {options.map((split) => {
          const selected = splitId === split.id;
          return (
            <PressableScale
              key={split.id}
              onPress={() => setSplitId(split.id)}
              className={cn(
                "rounded-3xl p-4",
                selected ? "bg-lime-dim" : "bg-card",
              )}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2.5">
                  <Text className="font-sans-bold text-lg tracking-tight text-text">
                    {split.name}
                  </Text>
                  <Text className="mt-1 font-sans text-[13px] text-mut">
                    {split.sub}
                  </Text>
                </View>
                <View
                  className={cn(
                    "h-6 w-6 items-center justify-center rounded-full border-2",
                    selected ? "border-lime bg-lime" : "border-line2",
                  )}
                >
                  {selected ? (
                    <Icon
                      name="check"
                      size={14}
                      color={COLORS.limeText}
                      strokeWidth={3}
                    />
                  ) : null}
                </View>
              </View>
              <View className="mt-3.5 flex-row flex-wrap gap-1.5">
                {split.plan.map((dayKey, index) => (
                  // box styles live on a View: Android ignores borderRadius
                  // and mis-pads backgrounds set directly on Text
                  <View
                    key={`${dayKey}-${index}`}
                    className={cn(
                      "rounded-lg px-2 py-1",
                      selected ? "bg-white/10" : "bg-card2",
                    )}
                  >
                    <Text
                      className={cn(
                        "font-mono text-[11px]",
                        selected ? "text-text" : "text-mut",
                      )}
                    >
                      {shortDayName(DAY[dayKey].name)}
                    </Text>
                  </View>
                ))}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </OnboardingShell>
  );
};
