import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { useIsPaid } from "@/shared/lib/entitlements";
import { posterUrl, useExerciseVideo } from "@/shared/lib/exercise-media";
import { slugOf } from "@/shared/lib/program/exercises";
import type { ExerciseInstance } from "@/shared/types";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

const glyphFor = (muscle: string) => {
  if (muscle.includes("delt")) return "target" as const;
  if (muscle === "Chest" || muscle === "Back") return "layers" as const;
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell" as const;
  if (muscle === "Quads" || muscle === "Hamstrings" || muscle === "Calves")
    return "activity" as const;
  return "dumbbell" as const;
};

const FormVideoPlayer = ({ uri }: { uri: string }) => {
  const viewRef = useRef<VideoView>(null);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <>
      <VideoView
        ref={viewRef}
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: true, orientation: "default" }}
      />
      <PressableScale
        onPress={() => void viewRef.current?.enterFullscreen()}
        className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-black/55"
      >
        <Icon name="expand" size={15} color={COLORS.text} strokeWidth={2} />
      </PressableScale>
    </>
  );
};

const FormVideo = ({
  exercise,
  isPaid,
  onLockedPress,
}: {
  exercise: ExerciseInstance;
  isPaid: boolean;
  onLockedPress: () => void;
}) => {
  const slug = slugOf(exercise.name);
  const { url, loading } = useExerciseVideo(slug);
  const poster = posterUrl(slug);
  const [posterFailed, setPosterFailed] = useState(false);

  const tile = (
    <View className="pt-2 aspect-video w-full items-center justify-center self-center overflow-hidden rounded-[18px] border border-line bg-card2">
      {poster && !posterFailed ? (
        <Image
          source={{ uri: poster }}
          onError={() => setPosterFailed(true)}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center opacity-10">
          <Icon
            name={glyphFor(exercise.muscle)}
            size={140}
            color={COLORS.text}
            strokeWidth={1}
          />
        </View>
      )}

      {!isPaid ? (
        <>
          <View className="absolute inset-0 bg-black/30" />
          <View className="h-11 w-11 items-center justify-center rounded-full bg-black/55">
            <Icon name="play" size={18} color={COLORS.lime} strokeWidth={2} />
          </View>
          <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full bg-lime px-2 py-0.5">
            <Icon
              name="lock"
              size={9}
              color={COLORS.limeText}
              strokeWidth={2.2}
            />
            <Text className="font-mono text-[9.5px] uppercase tracking-wide text-lime-text">
              Premium
            </Text>
          </View>
        </>
      ) : url ? (
        <FormVideoPlayer uri={url} />
      ) : loading ? (
        <View className="flex-row items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1.5">
          <ActivityIndicator size="small" color={COLORS.lime} />
          <Text className="font-mono text-[10px] tracking-wider text-text">
            WARMING UP
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (isPaid) return tile;
  return (
    <PressableScale onPress={onLockedPress} className="w-full">
      {tile}
    </PressableScale>
  );
};

export const ExerciseInfoSheet = ({
  sheetId,
  payload,
}: SheetProps<"exercise-info">) => {
  const isPaid = useIsPaid();
  const exercise = payload?.exercise;
  if (!exercise) return null;

  const openPaywall = () => {
    void SheetManager.hide(sheetId);
    router.push("/paywall");
  };

  return (
    <BaseSheet height="45%" sheetId={sheetId} title={exercise.name} fullHeight>
      <SheetScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <FormVideo
          exercise={exercise}
          isPaid={isPaid}
          onLockedPress={openPaywall}
        />

        {!isPaid ? (
          <Text className="mt-2 px-0.5 font-mono text-[10.5px] text-faint">
            Unlock to watch how each rep should look
          </Text>
        ) : null}

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
      </SheetScrollView>
    </BaseSheet>
  );
};
