import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { LIB } from "@/shared/lib/program";
import { BaseSheet, Icon, PressableScale, SheetScrollView } from "@/shared/ui";

export const ExercisePickerSheet = ({
  sheetId,
  payload,
}: SheetProps<"exercise-picker">) => {
  const [query, setQuery] = useState("");
  const lowered = query.trim().toLowerCase();

  const pick = (name: string) =>
    SheetManager.hide(sheetId, { payload: name });

  return (
    <BaseSheet sheetId={sheetId} title={payload?.title ?? "Pick exercise"} fullHeight>
      <View className="px-5 pb-2">
        <View className="h-11 flex-row items-center gap-2 rounded-xl border border-line bg-card px-3">
          <Icon name="search" size={16} color={COLORS.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises…"
            placeholderTextColor={COLORS.faint}
            className="flex-1 p-0 font-sans text-[15px] text-text"
          />
        </View>
      </View>
      <SheetScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {Object.entries(LIB).map(([muscle, names]) => {
          const filtered = names.filter(
            (name) => !lowered || name.toLowerCase().includes(lowered),
          );
          if (!filtered.length) return null;
          return (
            <View key={muscle} className="mb-3.5">
              <Text className="mb-2 mt-1.5 font-mono text-[10.5px] uppercase tracking-wider text-faint">
                {muscle}
              </Text>
              <View className="gap-1.5">
                {filtered.map((name) => (
                  <PressableScale
                    key={name}
                    onPress={() => pick(name)}
                    className="flex-row items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
                  >
                    <Icon name="dumbbell" size={18} color={COLORS.mut} strokeWidth={1.8} />
                    <Text className="flex-1 font-sans-semibold text-[15px] text-text">
                      {name}
                    </Text>
                    <Icon name="plus" size={17} color={COLORS.lime} strokeWidth={2.6} />
                  </PressableScale>
                ))}
              </View>
            </View>
          );
        })}
      </SheetScrollView>
    </BaseSheet>
  );
};
