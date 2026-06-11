import { ScrollView, Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import type { ExerciseInstance } from "@/shared/types";
import { Icon, Sheet } from "@/shared/ui";

import { CUES } from "../lib/cues";

const glyphFor = (muscle: string) => {
  if (muscle.includes("delt")) return "target" as const;
  if (muscle === "Chest" || muscle === "Back") return "layers" as const;
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell" as const;
  if (muscle === "Quads" || muscle === "Hamstrings" || muscle === "Calves")
    return "activity" as const;
  return "dumbbell" as const;
};

interface ExerciseInfoSheetProps {
  exercise: ExerciseInstance | null;
  onClose: () => void;
}

export const ExerciseInfoSheet = ({
  exercise,
  onClose,
}: ExerciseInfoSheetProps) => {
  if (!exercise) return null;
  const cues = CUES[exercise.name];

  return (
    <Sheet visible onClose={onClose} title={exercise.name} className="h-[88%]">
      <Text className="-mt-2 px-5 pb-2 font-mono text-[11.5px] text-mut">
        {exercise.muscle} · {exercise.sets}×{exercise.target}
      </Text>
      <ScrollView className="px-5" contentContainerClassName="pb-8">
        <View className="aspect-[9/16] max-h-[340px] w-full items-center justify-center self-center overflow-hidden rounded-[18px] border border-line bg-card2">
          <View className="absolute inset-0 items-center justify-center opacity-10">
            <Icon
              name={glyphFor(exercise.muscle)}
              size={140}
              color={COLORS.text}
              strokeWidth={1}
            />
          </View>
          <View className="flex-row items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1.5">
            <Icon name="videoCam" size={13} color={COLORS.lime} />
            <Text className="font-mono text-[10px] tracking-wider text-text">
              FORM DEMO
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          {(
            [
              ["Muscle", exercise.muscle],
              ["Target", `${exercise.target} reps`],
              ["Sets", `${exercise.sets}×`],
            ] as const
          ).map(([label, value]) => (
            <View
              key={label}
              className="flex-1 rounded-2xl bg-card px-3.5 py-3"
            >
              <Text className="font-mono text-[10px] uppercase tracking-wide text-faint">
                {label}
              </Text>
              <Text className="mt-1 font-sans-semibold text-[15px] text-text">
                {value}
              </Text>
            </View>
          ))}
        </View>

        {cues ? (
          <View className="mt-5">
            <Text className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-faint">
              Form cues
            </Text>
            <View className="gap-2">
              {cues.map((cue, index) => (
                <View
                  key={cue}
                  className="flex-row items-start gap-2.5 rounded-2xl bg-card px-3.5 py-3"
                >
                  <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-lime-dim">
                    <Text className="font-mono-bold text-[11px] text-lime">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 font-sans text-sm leading-5 text-text">
                    {cue}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Sheet>
  );
};
