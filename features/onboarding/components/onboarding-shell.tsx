import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { Icon, PressableScale, Screen, StepBar } from "@/shared/ui";

const TOTAL_STEPS = 6;

interface OnboardingShellProps {
  step: number;
  title: string;
  sub?: string;
  onBack?: () => void;
  sticky?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const OnboardingShell = ({
  step,
  title,
  sub,
  onBack,
  sticky,
  footer,
  children,
}: OnboardingShellProps) => (
  <Screen>
    <View className="px-5 pb-3.5 pt-2">
      <View className="mb-4 flex-row items-center gap-3.5">
        <PressableScale
          onPress={onBack}
          disabled={!onBack}
          className={cn(
            "h-10 w-10 items-center justify-center rounded-full bg-card",
            !onBack && "opacity-0",
          )}
        >
          <Icon name="chevL" size={20} strokeWidth={2.4} />
        </PressableScale>
        <View className="flex-1">
          <StepBar step={step} total={TOTAL_STEPS} />
        </View>
        <Text className="w-8 text-right font-mono text-xs text-faint">
          {step + 1}/{TOTAL_STEPS}
        </Text>
      </View>
      <Text className="font-sans-bold text-3xl tracking-tight text-text">
        {title}
      </Text>
      {sub ? (
        <Text className="mt-2 font-sans text-[15px] leading-5 text-mut">
          {sub}
        </Text>
      ) : null}
    </View>
    {sticky ? <View className="px-5 pt-1">{sticky}</View> : null}
    <ScrollView
      className="flex-1 px-5 pt-1"
      contentContainerClassName="pb-2"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
    {footer ? <View className="px-5 pb-2 pt-2.5">{footer}</View> : null}
  </Screen>
);
