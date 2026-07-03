import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { posterUrl } from "@/shared/lib/exercise-media";
import { makeExercise, searchExercises } from "@/shared/lib/program";
import { slugOf } from "@/shared/lib/program/exercises";
import { useCatalogStore, useExploreStore } from "@/shared/stores";
import type { Muscle } from "@/shared/types";
import { Icon, type IconName, PressableScale, Screen } from "@/shared/ui";

// Local glyph so the browser stays self-contained (mirrors the info sheet).
const glyphFor = (muscle: Muscle): IconName => {
  if (muscle.includes("delt")) return "target";
  if (muscle === "Chest" || muscle === "Back") return "layers";
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell";
  return "activity";
};

// Row thumbnail: exercise poster when one exists, muscle glyph otherwise.
const RowThumb = ({ name, muscle }: { name: string; muscle: Muscle }) => {
  const poster = posterUrl(slugOf(name));
  return (
    <View className="h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-lg border border-line bg-card2">
      {poster ? (
        <Image
          source={{ uri: poster }}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Icon
          name={glyphFor(muscle)}
          size={17}
          color="rgba(255,255,255,0.28)"
          strokeWidth={1.7}
        />
      )}
    </View>
  );
};

interface ExerciseSection {
  muscle: Muscle;
  data: string[];
}

export const ExploreScreen = () => {
  const [query, setQuery] = useState("");
  // subscribe to the row array itself (replaced wholesale on refresh) so the
  // list stays live when the launch refresh lands mid-screen
  const exercises = useCatalogStore((state) => state.exercises);
  const total = exercises.length;
  const recents = useExploreStore((state) => state.recentSearches);
  const addRecentSearch = useExploreStore((state) => state.addRecentSearch);
  const clearRecentSearches = useExploreStore(
    (state) => state.clearRecentSearches,
  );

  const sections: ExerciseSection[] = useMemo(
    () =>
      searchExercises(query).map(({ muscle, names }) => ({
        muscle,
        data: names,
      })),
    // exercises: searchExercises reads the catalog through the store, so the
    // linter can't see the dependency — keep it to recompute on refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, exercises],
  );

  // Browse rows carry no prescription — mint a default instance so the shared
  // exercise-info sheet (muscle, form cues) can open straight from here.
  // Opening a result while a query is active is what makes a search "used",
  // so that's when it earns a recents chip (besides keyboard submit).
  const openInfo = (name: string) => {
    if (query.trim()) addRecentSearch(query);
    SheetManager.show("exercise-info", {
      payload: { exercise: makeExercise(name) },
    });
  };

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
            {total} exercises · tap any for form cues
          </Text>
        </View>
      </View>

      <View className="px-5 pb-2">
        <View className="h-11 flex-row items-center gap-2 rounded-xl border border-line bg-card px-3">
          <Icon name="search" size={16} color={COLORS.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => addRecentSearch(query)}
            returnKeyType="search"
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

      {query.length === 0 && recents.length > 0 && (
        <View className="px-5 pb-2">
          <View className="mb-1.5 mt-1 flex-row items-center justify-between">
            <Text className="font-mono text-[10.5px] uppercase tracking-wider text-faint">
              Recent
            </Text>
            <PressableScale onPress={clearRecentSearches} className="p-1">
              <Text className="font-mono text-[10.5px] uppercase tracking-wider text-faint">
                Clear
              </Text>
            </PressableScale>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {recents.map((term) => (
              <PressableScale
                key={term}
                onPress={() => setQuery(term)}
                className="rounded-full border border-line bg-card px-3 py-1.5"
              >
                <Text className="font-sans text-[13px] text-text">{term}</Text>
              </PressableScale>
            ))}
          </View>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(name) => name}
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text className="mt-8 text-center font-sans text-[14px] text-faint">
            No exercises found
          </Text>
        }
        renderSectionHeader={({ section }) => (
          <View className="mb-2 mt-1.5 flex-row items-center justify-between">
            <Text className="font-mono text-[10.5px] uppercase tracking-wider text-faint">
              {section.muscle}
            </Text>
            <Text className="font-mono text-[10.5px] text-faint">
              {section.data.length}
            </Text>
          </View>
        )}
        renderSectionFooter={() => <View className="h-3.5" />}
        ItemSeparatorComponent={() => <View className="h-1.5" />}
        renderItem={({ item: name, section }) => (
          <PressableScale
            onPress={() => openInfo(name)}
            className="flex-row items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
          >
            <RowThumb name={name} muscle={section.muscle} />
            <Text className="flex-1 font-sans-semibold text-[15px] text-text">
              {name}
            </Text>
            <Icon name="chevR" size={17} color={COLORS.faint} />
          </PressableScale>
        )}
      />
    </Screen>
  );
};
