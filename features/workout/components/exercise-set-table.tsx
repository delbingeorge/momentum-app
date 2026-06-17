import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { kgToDisp } from "@/shared/lib/units";
import { useSettingsStore } from "@/shared/stores";
import type { SessionExercise } from "@/shared/types";

const TYPE_LABEL = { warmup: "W", drop: "D" } as const;
const TYPE_COLOR = { warmup: COLORS.warmup, drop: COLORS.drop } as const;

const HeaderCell = ({ label, flex }: { label: string; flex?: boolean }) => (
  <Text
    className={cn(
      "font-mono text-[9.5px] uppercase tracking-wide text-faint",
      flex ? "flex-1" : "w-12",
    )}
  >
    {label}
  </Text>
);

// One card per exercise: name + muscle tag, then a SET / WEIGHT / REPS table.
// Shared by the session detail and recap sheets.
export const ExerciseSetTable = ({
  exercises,
}: {
  exercises: SessionExercise[];
}) => {
  const unit = useSettingsStore((state) => state.unit);

  return (
    <>
      {exercises.map((exercise, exIndex) => (
        <View
          key={`${exercise.name}-${exIndex}`}
          className="mb-3 rounded-2xl bg-card px-4 pb-1.5 pt-3.5"
        >
          <View className="mb-3 flex-row items-center justify-between gap-2">
            <Text className="shrink font-sans-bold text-[15.5px] text-text">
              {exercise.name}
            </Text>
            <Text className="rounded-md bg-lime-dim px-1.5 py-0.5 font-mono text-[10px] uppercase text-lime">
              {exercise.muscle}
            </Text>
          </View>

          <View className="flex-row pb-2">
            <HeaderCell label="Set" />
            <HeaderCell label="Weight" flex />
            <HeaderCell label="Reps" />
          </View>

          {exercise.sets.map((set, setIndex) => (
            <View
              key={setIndex}
              className="flex-row items-center border-t border-line py-2.5"
            >
              <Text
                className="w-12 font-mono-medium text-xs"
                style={{
                  color:
                    set.type !== "normal" ? TYPE_COLOR[set.type] : COLORS.faint,
                }}
              >
                {set.type !== "normal" ? TYPE_LABEL[set.type] : setIndex + 1}
              </Text>
              <Text className="flex-1 font-sans-semibold text-sm text-text">
                {kgToDisp(set.kg, unit)} {unit}
              </Text>
              <Text className="w-12 font-sans-semibold text-sm text-text">
                {set.reps}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
};
