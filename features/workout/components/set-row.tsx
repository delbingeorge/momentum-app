import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { dispToKg, kgToDisp, stepKg } from "@/shared/lib/units";
import type { LoggedSet, SessionSet, Unit } from "@/shared/types";
import { Checkbox, Icon, PressableScale } from "@/shared/ui";

import { Stepper } from "./stepper";

const TYPE_CHROME = {
  warmup: { label: "W", color: COLORS.warmup, dim: COLORS.warmupDim },
  drop: { label: "D", color: COLORS.drop, dim: COLORS.dropDim },
} as const;

interface SetRowProps {
  set: LoggedSet;
  index: number;
  workingIndex: number;
  prev: SessionSet | null;
  unit: Unit;
  onUpdate: (patch: Partial<LoggedSet>) => void;
  onToggleDone: () => void;
  onCycleType: () => void;
}

export const SetRow = ({
  set,
  index,
  workingIndex,
  prev,
  unit,
  onUpdate,
  onToggleDone,
  onCycleType,
}: SetRowProps) => {
  const chrome = set.type !== "normal" ? TYPE_CHROME[set.type] : null;
  const improved =
    prev !== null &&
    set.type !== "warmup" &&
    (set.kg > prev.kg || (set.kg === prev.kg && set.reps > prev.reps));

  // Set-type colors come from data, not a fixed class — style is the escape hatch
  const badgeStyle = {
    backgroundColor: chrome
      ? set.done
        ? chrome.color
        : chrome.dim
      : set.done
        ? COLORS.lime
        : COLORS.card2,
  };
  const badgeTextColor = chrome
    ? set.done
      ? COLORS.bg
      : chrome.color
    : set.done
      ? COLORS.limeText
      : COLORS.mut;
  const rowStyle = set.done
    ? {
        backgroundColor: chrome ? chrome.dim : COLORS.limeDim,
        borderColor: chrome ? chrome.color : "rgba(203,251,69,0.4)",
      }
    : { backgroundColor: COLORS.card, borderColor: COLORS.line };

  return (
    <View
      className="overflow-hidden rounded-2xl border px-2 py-3.5"
      style={rowStyle}
    >
      {prev ? (
        <View className="flex-row items-center gap-1.5 px-3 pb-2.5">
          <Icon name="rotate" size={11} color={COLORS.faint} />
          <Text className="font-mono text-[10.5px] text-faint">
            Last: {kgToDisp(prev.kg, unit)} {unit} × {prev.reps}
          </Text>
          {improved ? (
            <View className="ml-auto flex-row items-center gap-0.5">
              <Icon
                name="arrowUp"
                size={11}
                color={COLORS.green}
                strokeWidth={2.8}
              />
              <Text className="font-sans-bold text-[11px] text-green">
                New best
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View className="flex-row justify-between items-center px-2">
        <View className="flex-row items-center justify-between gap-4">
          <PressableScale
            onPress={onCycleType}
            className="h-7 w-7 items-center justify-center rounded-full"
          >
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={badgeStyle}
            >
              <Text
                className="font-mono-bold text-[13px]"
                style={{ color: badgeTextColor }}
              >
                {chrome
                  ? chrome.label
                  : set.type !== "warmup"
                    ? workingIndex
                    : index + 1}
              </Text>
            </View>
          </PressableScale>
          <View className="flex-row justify-between gap-2 items-center">
            <Stepper
              big
              value={kgToDisp(set.kg, unit)}
              onDec={() => onUpdate({ kg: Math.max(0, set.kg - stepKg(unit)) })}
              onInc={() => onUpdate({ kg: set.kg + stepKg(unit) })}
              onInput={(value) =>
                onUpdate({ kg: Math.max(0, dispToKg(value, unit)) })
              }
            />
            <Stepper
              value={set.reps}
              onDec={() => onUpdate({ reps: Math.max(0, set.reps - 1) })}
              onInc={() => onUpdate({ reps: set.reps + 1 })}
              onInput={(value) =>
                onUpdate({ reps: Math.max(0, Math.round(value)) })
              }
            />
          </View>
        </View>
        <Checkbox
          checked={set.done}
          onCheckedChange={onToggleDone}
          className="rounded-lg"
          checkedColor={chrome?.color}
          iconColor={chrome ? COLORS.bg : COLORS.limeText}
          iconSize={14}
        />
      </View>
    </View>
  );
};
