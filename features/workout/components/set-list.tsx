import { useCallback } from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { haptics } from "@/shared/lib/haptics";
import { isDumbbell, isWorkingSet } from "@/shared/lib/program";
import { useWorkoutStore } from "@/shared/stores";
import type {
  ExerciseHistory,
  ExerciseInstance,
  LoggedSet,
  SetType,
  Unit,
} from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

import { SetRow } from "./set-row";

const TYPE_ORDER: SetType[] = ["normal", "warmup", "drop"];

interface SetListProps {
  exercise: ExerciseInstance;
  sets: LoggedSet[];
  history: ExerciseHistory;
  unit: Unit;
  onRest: () => void;
}

export const SetList = ({
  exercise,
  sets,
  history,
  unit,
  onRest,
}: SetListProps) => {
  const { updateSet, setExerciseSets } = useWorkoutStore.getState();

  // Read the live set from the store (not the `sets` prop) so these handlers
  // keep a stable identity across renders, letting memoized rows skip re-render.
  const handleUpdate = useCallback(
    (index: number, patch: Partial<LoggedSet>) =>
      updateSet(exercise.id, index, patch),
    [exercise.id, updateSet],
  );

  const toggleDone = useCallback(
    (index: number) => {
      const set = useWorkoutStore.getState().log[exercise.id]?.[index];
      if (!set) return;
      const willDone = !set.done;
      if (willDone) haptics.success();
      else haptics.select();
      updateSet(exercise.id, index, { done: willDone });
      // warmups don't trigger rest
      if (willDone && isWorkingSet(set)) onRest();
    },
    [exercise.id, updateSet, onRest],
  );

  const cycleType = useCallback(
    (index: number) => {
      const set = useWorkoutStore.getState().log[exercise.id]?.[index];
      if (!set) return;
      const next =
        TYPE_ORDER[(TYPE_ORDER.indexOf(set.type) + 1) % TYPE_ORDER.length];
      if (next) updateSet(exercise.id, index, { type: next });
    },
    [exercise.id, updateSet],
  );

  const addSet = () => {
    const last = sets[sets.length - 1];
    setExerciseSets(exercise.id, [
      ...sets,
      {
        kg: last?.kg ?? 20,
        reps: last?.reps ?? (parseInt(exercise.target, 10) || 10),
        done: false,
        type: "normal",
      },
    ]);
  };

  const removeLastSet = () =>
    setExerciseSets(exercise.id, sets.slice(0, sets.length - 1));

  const prevWork = (history[exercise.name] ?? []).filter(isWorkingSet);

  return (
    <View>
      <View className="flex-row items-center gap-1.5 px-1 pb-2 pt-4">
        <Text className="w-7 text-center font-mono text-[10.5px] uppercase text-faint">
          Set
        </Text>
        <Text className="flex-1 text-center font-mono text-[10.5px] uppercase text-faint">
          Weight ({unit}
          {isDumbbell(exercise.name) ? "/hand" : ""})
        </Text>
        <Text className="flex-1 text-center font-mono text-[10.5px] uppercase text-faint">
          Reps
        </Text>
        <View className="w-[27px]" />
      </View>
      <View className="gap-2">
        {sets.map((set, index) => {
          const workingIndex = sets
            .slice(0, index + 1)
            .filter(isWorkingSet).length;
          const prev = isWorkingSet(set)
            ? (prevWork[workingIndex - 1] ?? null)
            : null;
          return (
            <SetRow
              key={index}
              set={set}
              index={index}
              workingIndex={workingIndex}
              prev={prev}
              unit={unit}
              onUpdate={handleUpdate}
              onToggleDone={toggleDone}
              onCycleType={cycleType}
            />
          );
        })}
      </View>
      <View className="mt-2.5 flex-row gap-2">
        <PressableScale
          onPress={addSet}
          className="h-14 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line2"
        >
          <Icon name="plus" size={16} color={COLORS.mut} strokeWidth={2.4} />
          <Text className="font-sans-medium text-md text-mut">Add set</Text>
        </PressableScale>
        {sets.length > 1 ? (
          <PressableScale
            onPress={removeLastSet}
            className="h-14 w-[52px] items-center justify-center rounded-2xl border border-dashed border-line2"
          >
            <Icon name="minus" size={16} color={COLORS.mut} strokeWidth={2.4} />
          </PressableScale>
        ) : null}
      </View>
      <Text className="mt-2.5 text-center font-mono text-[10px] text-faint">
        Tap the set number to mark warmup (W) or drop set (D)
      </Text>
    </View>
  );
};
