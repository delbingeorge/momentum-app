import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { LIB } from "@/shared/lib/program";
import { Icon, PressableScale, Sheet } from "@/shared/ui";

interface ExercisePickerSheetProps {
  visible: boolean;
  title: string;
  onPick: (name: string) => void;
  onClose: () => void;
}

export const ExercisePickerSheet = ({
  visible,
  title,
  onPick,
  onClose,
}: ExercisePickerSheetProps) => {
  const [query, setQuery] = useState("");
  const lowered = query.trim().toLowerCase();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      className="h-[88%]"
    >
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
      <ScrollView className="px-5" contentContainerClassName="pb-6">
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
                    onPress={() => onPick(name)}
                    className="flex-row items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
                  >
                    <Icon
                      name="dumbbell"
                      size={18}
                      color={COLORS.mut}
                      strokeWidth={1.8}
                    />
                    <Text className="flex-1 font-sans-semibold text-[15px] text-text">
                      {name}
                    </Text>
                    <Icon
                      name="plus"
                      size={17}
                      color={COLORS.lime}
                      strokeWidth={2.6}
                    />
                  </PressableScale>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Sheet>
  );
};
