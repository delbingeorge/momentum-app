import { router } from "expo-router";
import { useCallback, useState } from "react";
import { SheetManager } from "react-native-actions-sheet";
import { ScrollView, Text, View } from "react-native";

import { haptics } from "@/shared/lib/haptics";
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
import { Icon, PressableScale, Screen } from "@/shared/ui";

import { useRestTimer } from "../hooks/use-rest-timer";
import { useSessionTimer } from "../hooks/use-session-timer";
import { ExerciseMenu } from "./exercise-menu";
import { ExerciseSwitcher } from "./exercise-switcher";
import { SessionBanner } from "./session-banner";
import { SetList } from "./set-list";
import { WorkoutFooter } from "./workout-footer";
import { WorkoutHeader } from "./workout-header";

export const WorkoutScreen = () => {
  const goal = usePlanStore((state) => state.goal) ?? "muscle";
  const level = usePlanStore((state) => state.level) ?? "intermediate";
  const schedule = usePlanStore((state) => state.schedule);
  const setTodayIndex = usePlanStore((state) => state.setTodayIndex);
  const unit = useSettingsStore((state) => state.unit);
  const restSec = useSettingsStore((state) => state.restSec);
  const active = useWorkoutStore((state) => state.active);
  const log = useWorkoutStore((state) => state.log);
  const history = useWorkoutStore((state) => state.history);
  const { setExList, setExerciseSets, discardWorkout, finishWorkout } =
    useWorkoutStore.getState();

  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const elapsed = useSessionTimer(active?.startedAt ?? null);
  const rest = useRestTimer();
  const onRest = useCallback(() => rest.start(restSec), [rest.start, restSec]);

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
    level,
    active.deload,
    exercise.target,
  );

  const initOne = (added: ExerciseInstance) => {
    const sug = progressionFor(
      added.name,
      history[added.name],
      goal,
      level,
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

  const addExercise = async () => {
    const name = await SheetManager.show("exercise-picker", {
      payload: { title: "Add exercise" },
    });
    if (!name) return;
    const added = makeExercise(name, 3);
    setExList([...exList, added]);
    initOne(added);
    setCurrent(exList.length);
  };

  const swapExercise = async () => {
    const name = await SheetManager.show("exercise-picker", {
      payload: { title: "Swap exercise" },
    });
    if (!name) return;
    const swapped = makeExercise(name, exercise.sets);
    setExList(exList.map((x, i) => (i === current ? swapped : x)));
    initOne(swapped);
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
    haptics.warning();
    rest.skip();
    discardWorkout();
    router.back();
  };

  const handleFinish = () => {
    rest.skip();
    finishWorkout(buildSession(exList, log, elapsed, day), active.deload);
    // Advance the rotation to the next training day so home is ready to go
    setTodayIndex((active.dayIndex + 1) % schedule.length);
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
          onAdd={addExercise}
        />
        <SessionBanner
          deload={active.deload}
          suggestion={suggestion}
          unit={unit}
        />
        <View className="flex-row items-center justify-between gap-2.5">
          <Text className="flex-1 font-sans-bold text-[22px] leading-7 tracking-tight text-text">
            {exercise.name}
          </Text>
          <PressableScale
            onPress={() =>
              SheetManager.show("exercise-info", { payload: { exercise } })
            }
            className="h-[38px] w-[38px] items-center justify-center rounded-full bg-card"
          >
            <Icon name="videoCam" size={18} />
          </PressableScale>
          <PressableScale
            onPress={() => setMenuOpen(true)}
            className="h-[38px] w-[38px] items-center justify-center rounded-full bg-card"
          >
            <Icon name="dots" size={20} />
          </PressableScale>
        </View>
        <SetList
          exercise={exercise}
          sets={sets}
          history={history}
          unit={unit}
          onRest={onRest}
        />
      </ScrollView>

      <WorkoutFooter
        rest={rest}
        canGoBack={current > 0}
        isLast={isLast}
        allDone={allDone}
        totalDone={totalDone}
        totalSets={totalSets}
        onBack={() => setCurrent(current - 1)}
        onNext={() => {
          setCurrent(current + 1);
          rest.skip();
        }}
        onFinish={handleFinish}
      />

      <ExerciseMenu
        visible={menuOpen}
        canMoveLeft={current > 0}
        canMoveRight={current < exList.length - 1}
        canRemove={exList.length > 1}
        onSwap={swapExercise}
        onMove={moveExercise}
        onRemove={removeExercise}
        onDiscard={handleDiscard}
        onClose={() => setMenuOpen(false)}
      />
    </Screen>
  );
};
