import { Text, View } from "react-native";
import type { SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { BaseSheet, Icon, type IconName, SheetScrollView } from "@/shared/ui";

const STEPS = [
  "Weigh in first thing in the morning, right after using the bathroom.",
  "Step on before eating or drinking anything. Your body is at its most stable after a night of sleep.",
  "Wear minimal or no clothing, and use the same scale every time.",
  "Keep the scale on a hard, flat floor. Carpet throws off the reading.",
];

const FACTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "rotate",
    title: "Daily swings are normal",
    body: "Your weight can move 1 to 2 kg from one day to the next. That's water, salt, carbs and digestion, not fat gained or lost overnight.",
  },
  {
    icon: "chart",
    title: "Weekends run heavy",
    body: "Most people weigh the most on Sunday and Monday, and the least on Friday. A Monday spike after a normal weekend is nothing to worry about.",
  },
  {
    icon: "droplet",
    title: "Cycles affect the scale",
    body: "Your period, a salty dinner or a hard workout can hold extra water for days. Give it time before reading anything into it.",
  },
  {
    icon: "trendingUp",
    title: "Trust the trend",
    body: "Look at your weekly average over a few weeks, not a single reading. One number on its own tells you very little.",
  },
];

export const WeighInGuideSheet = ({
  sheetId,
}: SheetProps<"weigh-in-guide">) => (
  <BaseSheet sheetId={sheetId} title="Weigh-in guide" fullHeight>
    <Text className="-mt-2 px-5 pb-2 font-mono text-[11.5px] text-mut">
      Same time, same conditions, honest trend
    </Text>
    <SheetScrollView
      className="px-5"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text className="mb-2.5 mt-2 font-mono text-[11px] uppercase tracking-wider text-faint">
        How to weigh
      </Text>
      <View className="gap-2">
        {STEPS.map((step, index) => (
          <View
            key={step}
            className="flex-row items-start gap-2.5 rounded-2xl bg-card px-3.5 py-3"
          >
            <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-lime-dim">
              <Text className="font-mono-bold text-[11px] text-lime">
                {index + 1}
              </Text>
            </View>
            <Text className="flex-1 font-sans text-sm leading-5 text-text">
              {step}
            </Text>
          </View>
        ))}
      </View>

      <Text className="mb-2.5 mt-5 font-mono text-[11px] uppercase tracking-wider text-faint">
        How often
      </Text>
      <View className="rounded-2xl bg-card px-3.5 py-3">
        <Text className="font-sans text-sm leading-5 text-text">
          Daily is the sweet spot. People who weigh in every day tend to lose
          more weight and stick to their habits better, and it doesn't mess
          with your head like you'd think. If daily feels like too much, pick
          one morning a week and stick to it.
        </Text>
      </View>

      <Text className="mb-2.5 mt-5 font-mono text-[11px] uppercase tracking-wider text-faint">
        Reading the number
      </Text>
      <View className="gap-2">
        {FACTS.map((fact) => (
          <View
            key={fact.title}
            className="flex-row items-start gap-2.5 rounded-2xl bg-card px-3.5 py-3"
          >
            <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-lime-dim">
              <Icon
                name={fact.icon}
                size={16}
                color={COLORS.lime}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-sm text-text">
                {fact.title}
              </Text>
              <Text className="mt-0.5 font-sans text-[13px] leading-[18px] text-mut">
                {fact.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text className="mt-5 text-center font-mono text-[10px] text-faint">
        Based on published research on self-weighing
      </Text>
    </SheetScrollView>
  </BaseSheet>
);
