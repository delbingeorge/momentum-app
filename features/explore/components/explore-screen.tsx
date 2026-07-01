import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { makeExercise, searchExercises } from "@/shared/lib/program";
import type { Muscle } from "@/shared/types";
import { Icon, type IconName, PressableScale, Screen } from "@/shared/ui";

// Local glyph so the browser stays self-contained (mirrors the info sheet).
const glyphFor = (muscle: Muscle): IconName => {
  if (muscle.includes("delt")) return "target";
  if (muscle === "Chest" || muscle === "Back") return "layers";
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell";
  return "activity";
};

export const ExploreScreen = () => {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => searchExercises(query), [query]);
  const total = useMemo(
    () => searchExercises("").reduce((sum, g) => sum + g.names.length, 0),
    [],
  );

  // Browse rows carry no prescription — mint a default instance so the shared
  // exercise-info sheet (muscle, how-to, cues) can open straight from here.
  const openInfo = (name: string) =>
    SheetManager.show("exercise-info", {
      payload: { exercise: makeExercise(name) },
    });

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <PressableScale
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-card2"
        >
          <Icon name="chevL" size={18} color={COLORS.text} strokeWidth={2.2} />
        </PressableScale>
        <View className="flex-1">
          <Text className="font-sans-bold text-[22px] tracking-tight text-text">
            Explore
          </Text>
          <Text className="font-mono text-[11px] text-faint">
            {total} exercises · tap any for how-to
          </Text>
        </View>
      </View>

      <View className="px-5 pb-2">
        <View className="h-11 flex-row items-center gap-2 rounded-xl border border-line bg-card px-3">
          <Icon name="search" size={16} color={COLORS.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or muscle…"
            placeholderTextColor={COLORS.faint}
            className="flex-1 p-0 font-sans text-[15px] text-text"
          />
          {query.length > 0 && (
            <PressableScale onPress={() => setQuery("")} className="p-1">
              <Icon name="x" size={15} color={COLORS.faint} />
            </PressableScale>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {!groups.length && (
          <Text className="mt-8 text-center font-sans text-[14px] text-faint">
            No exercises found
          </Text>
        )}
        {groups.map(({ muscle, names }) => (
          <View key={muscle} className="mb-3.5">
            <View className="mb-2 mt-1.5 flex-row items-center justify-between">
              <Text className="font-mono text-[10.5px] uppercase tracking-wider text-faint">
                {muscle}
              </Text>
              <Text className="font-mono text-[10.5px] text-faint">
                {names.length}
              </Text>
            </View>
            <View className="gap-1.5">
              {names.map((name) => (
                <PressableScale
                  key={name}
                  onPress={() => openInfo(name)}
                  className="flex-row items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
                >
                  <View className="h-[38px] w-[38px] items-center justify-center rounded-lg border border-line bg-card2">
                    <Icon
                      name={glyphFor(muscle)}
                      size={17}
                      color="rgba(255,255,255,0.28)"
                      strokeWidth={1.7}
                    />
                  </View>
                  <Text className="flex-1 font-sans-semibold text-[15px] text-text">
                    {name}
                  </Text>
                  <Icon name="chevR" size={17} color={COLORS.faint} />
                </PressableScale>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
};
