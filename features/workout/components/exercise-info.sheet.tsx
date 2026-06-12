import { router } from "expo-router";
import { Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { useIsPaid } from "@/shared/lib/entitlements";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

import { CUES } from "../lib/cues";
import { STEPS } from "../lib/steps";

const glyphFor = (muscle: string) => {
  if (muscle.includes("delt")) return "target" as const;
  if (muscle === "Chest" || muscle === "Back") return "layers" as const;
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell" as const;
  if (muscle === "Quads" || muscle === "Hamstrings" || muscle === "Calves")
    return "activity" as const;
  return "dumbbell" as const;
};

export const ExerciseInfoSheet = ({
  sheetId,
  payload,
}: SheetProps<"exercise-info">) => {
  const isPaid = useIsPaid();
  const exercise = payload?.exercise;
  if (!exercise) return null;
  const cues = CUES[exercise.name];
  const steps = STEPS[exercise.name];

  const openPaywall = () => {
    void SheetManager.hide(sheetId);
    router.push("/paywall");
  };

  return (
    <BaseSheet height="65%" sheetId={sheetId} title={exercise.name} fullHeight>
      <Text className="-mt-2 px-5 pb-2 font-mono text-[11.5px] text-mut">
        {exercise.muscle} · {exercise.sets}×{exercise.target}
      </Text>
      <SheetScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {isPaid ? (
          <View className="aspect-video w-full items-center justify-center self-center overflow-hidden rounded-[18px] border border-line bg-card2">
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
        ) : (
          <PressableScale
            onPress={openPaywall}
            className="flex-row items-center gap-3 rounded-2xl border border-dashed border-line2 bg-card px-3.5 py-3"
          >
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
              <Icon
                name="videoCam"
                size={18}
                color={COLORS.lime}
                strokeWidth={1.8}
              />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-[15px] text-text">
                Form demo video
              </Text>
              <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
                Unlock to watch how each rep should look
              </Text>
            </View>
            <Text className="rounded-full bg-lime px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-lime-text">
              Premium
            </Text>
          </PressableScale>
        )}

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

        {steps ? (
          <View className="mt-5">
            <Text className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-faint">
              How to do it
            </Text>
            <View className="gap-2">
              {steps.map((step, index) => (
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
          </View>
        ) : null}

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
      </SheetScrollView>
    </BaseSheet>
  );
};
