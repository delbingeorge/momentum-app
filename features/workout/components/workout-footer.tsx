import { View } from "react-native";

import { CtaButton, Icon, PressableScale } from "@/shared/ui";

import { RestTimerBar } from "./rest-timer-bar";

interface WorkoutFooterProps {
  rest: {
    active: boolean;
    left: number;
    total: number;
    skip: () => void;
    addSeconds: (seconds: number) => void;
  };
  canGoBack: boolean;
  isLast: boolean;
  allDone: boolean;
  totalDone: number;
  totalSets: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const WorkoutFooter = ({
  rest,
  canGoBack,
  isLast,
  allDone,
  totalDone,
  totalSets,
  onBack,
  onNext,
  onFinish,
}: WorkoutFooterProps) => (
  <View className="gap-2.5 px-4 pb-2 pt-2">
    {rest.active ? (
      <RestTimerBar
        left={rest.left}
        total={rest.total}
        onSkip={rest.skip}
        onAdd={() => rest.addSeconds(15)}
      />
    ) : null}
    <View className="flex-row gap-2.5">
      {canGoBack ? (
        <PressableScale
          onPress={onBack}
          className="h-[58px] w-[58px] items-center justify-center rounded-full bg-card"
        >
          <Icon name="chevL" size={22} strokeWidth={2.4} />
        </PressableScale>
      ) : null}
      <View className="flex-1">
        {isLast ? (
          <CtaButton
            label={
              allDone ? "Finish workout" : `Finish · ${totalDone}/${totalSets}`
            }
            icon="check"
            variant={allDone ? "lime" : "white"}
            onPress={onFinish}
          />
        ) : (
          <CtaButton
            label="Next exercise"
            icon="chevR"
            variant={allDone ? "lime" : "white"}
            onPress={onNext}
          />
        )}
      </View>
    </View>
  </View>
);
