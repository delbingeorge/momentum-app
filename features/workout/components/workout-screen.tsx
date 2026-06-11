import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import {
  buildSession,
  makeExercise,
  progressionFor,
} from "@/shared/lib/program";
import {
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";
import type { ExerciseInstance } from "@/shared/types";
import { CtaButton, Icon, PressableScale, Screen } from "@/shared/ui";

import { useRestTimer } from "../hooks/use-rest-timer";
import { useSessionTimer } from "../hooks/use-session-timer";
import { ExerciseInfoSheet } from "./exercise-info-sheet";
import { ExerciseMenu } from "./exercise-menu";
import { ExercisePickerSheet } from "./exercise-picker-sheet";
import { ExerciseSwitcher } from "./exercise-switcher";
import { RestTimerBar } from "./rest-timer-bar";
import { SessionBanner } from "./session-banner";
import { SetList } from "./set-list";
import { WorkoutHeader } from "./workout-header";

export const WorkoutScreen = () => {
  const goal = usePlanStore((state) => state.goal) ?? "muscle";
  const schedule = usePlanStore((state) => state.schedule);
  const unit = useSettingsStore((state) => state.unit);
  const restSec = useSettingsStore((state) => state.restSec);
  const active = useWorkoutStore((state) => state.active);
  const log = useWorkoutStore((state) => state.log);
  const history = useWorkoutStore((state) => state.history);
  const { setExList, setExerciseSets, discardWorkout, finishWorkout } =
    useWorkoutStore.getState();

  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [picker, setPicker] = useState<"add" | "swap" | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const elapsed = useSessionTimer(active?.startedAt ?? null);
  const rest = useRestTimer();

  if (!active || !schedule) return null;
  const day = schedule[active.dayIndex];
  const exList = active.exList;
  const exercise = exList[Math.min(current, exList.length - 1)];
  if (!day || !exercise) return null;

  const totalSets = exList.reduce(
    (sum, x) => sum + (log[x.id]?.length ?? 0),
    0,
  );
  const totalDone = exList.reduce(
    (sum, x) => sum + (log[x.id]?.filter((set) => set.done).length ?? 0),
    0,
  );
  const sets = log[exercise.id] ?? [];
  const allDone = sets.length > 0 && sets.every((set) => set.done);
  const isLast = current >= exList.length - 1;
  const suggestion = progressionFor(
    exercise.name,
    history[exercise.name],
    goal,
    active.deload,
    exercise.target,
  );

  const initOne = (added: ExerciseInstance) => {
    const sug = progressionFor(
      added.name,
      history[added.name],
      goal,
      active.deload,
      added.target,
    );
    setExerciseSets(
      added.id,
      Array.from({ length: added.sets }).map(() => ({
        kg: sug.kg,
        reps: sug.reps,
        done: false,
        type: "normal",
      })),
    );
  };

  const addExercise = (name: string) => {
    const added = makeExercise(name, 3);
    setExList([...exList, added]);
    initOne(added);
    setPicker(null);
    setCurrent(exList.length);
  };

  const swapExercise = (name: string) => {
    const swapped = makeExercise(name, exercise.sets);
    setExList(exList.map((x, i) => (i === current ? swapped : x)));
    initOne(swapped);
    setPicker(null);
  };

  const moveExercise = (dir: -1 | 1) => {
    const target = current + dir;
    if (target < 0 || target >= exList.length) return;
    const next = [...exList];
    const a = next[current];
    const b = next[target];
    if (!a || !b) return;
    next[current] = b;
    next[target] = a;
    setExList(next);
    setCurrent(target);
  };

  const removeExercise = () => {
    if (exList.length <= 1) return;
    setExList(exList.filter((_, i) => i !== current));
    setCurrent((c) => Math.max(0, c - 1));
  };

  const handleDiscard = () => {
    rest.skip();
    discardWorkout();
    router.back();
  };

  const handleFinish = () => {
    rest.skip();
    finishWorkout(buildSession(exList, log, elapsed, day), active.deload);
    router.replace("/workout-done");
  };

  return (
    <Screen>
      <WorkoutHeader
        dayName={day.name}
        elapsed={elapsed}
        totalDone={totalDone}
        totalSets={totalSets}
        onMinimize={() => router.back()}
      />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-2">
        <ExerciseSwitcher
          exList={exList}
          log={log}
          current={current}
          onSelect={setCurrent}
          onAdd={() => setPicker("add")}
        />
        <SessionBanner
          deload={active.deload}
          suggestion={suggestion}
          unit={unit}
        />
        <View className="flex-row items-start justify-between gap-2.5">
          <Text className="flex-1 font-sans-bold text-[22px] leading-7 tracking-tight text-text">
            {exercise.name}
          </Text>
          <PressableScale
            onPress={() => setMenuOpen(true)}
            className="h-[38px] w-[38px] items-center justify-center rounded-full bg-card"
          >
            <Icon name="dots" size={20} />
          </PressableScale>
        </View>
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <PressableScale
            onPress={() => setInfoOpen(true)}
            className="flex-row items-center gap-1.5 rounded-full bg-lime py-1.5 pl-2.5 pr-3"
          >
            <Icon name="videoCam" size={15} color={COLORS.limeText} />
            <Text className="font-sans-bold text-[13px] text-lime-text">
              Watch form
            </Text>
          </PressableScale>
          <Text className="rounded-lg bg-lime-dim px-2 py-1 font-mono text-[11px] text-lime">
            {exercise.muscle}
          </Text>
          <Text className="font-sans text-[13px] text-mut">
            Target {exercise.target} reps
          </Text>
        </View>
        <SetList
          exercise={exercise}
          sets={sets}
          history={history}
          unit={unit}
          onRest={() => rest.start(restSec)}
        />
      </ScrollView>

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
          {current > 0 ? (
            <PressableScale
              onPress={() => setCurrent(current - 1)}
              className="h-[58px] w-[58px] items-center justify-center rounded-full bg-card"
            >
              <Icon name="chevL" size={22} strokeWidth={2.4} />
            </PressableScale>
          ) : null}
          <View className="flex-1">
            {isLast ? (
              <CtaButton
                label={
                  allDone
                    ? "Finish workout"
                    : `Finish · ${totalDone}/${totalSets}`
                }
                icon="check"
                variant={allDone ? "lime" : "white"}
                onPress={handleFinish}
              />
            ) : (
              <CtaButton
                label="Next exercise"
                icon="chevR"
                variant={allDone ? "lime" : "white"}
                onPress={() => {
                  setCurrent(current + 1);
                  rest.skip();
                }}
              />
            )}
          </View>
        </View>
      </View>

      <ExerciseMenu
        visible={menuOpen}
        canMoveLeft={current > 0}
        canMoveRight={current < exList.length - 1}
        canRemove={exList.length > 1}
        onSwap={() => setPicker("swap")}
        onMove={moveExercise}
        onRemove={removeExercise}
        onDiscard={handleDiscard}
        onClose={() => setMenuOpen(false)}
      />
      {picker ? (
        <ExercisePickerSheet
          visible
          title={picker === "add" ? "Add exercise" : "Swap exercise"}
          onPick={picker === "add" ? addExercise : swapExercise}
          onClose={() => setPicker(null)}
        />
      ) : null}
      {infoOpen ? (
        <ExerciseInfoSheet
          exercise={exercise}
          onClose={() => setInfoOpen(false)}
        />
      ) : null}
    </Screen>
  );
};
