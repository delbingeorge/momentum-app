import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { Icon } from "@/shared/ui";

export const DeloadBanner = () => (
  <View className="mx-5 mb-1 mt-2 flex-row items-center gap-3 rounded-2xl bg-lime-dim px-4 py-3">
    <Icon name="rotate" size={18} color={COLORS.lime} strokeWidth={2.2} />
    <View className="flex-1">
      <Text className="font-sans-semibold text-sm text-text">
        Deload week recommended
      </Text>
      <Text className="mt-0.5 font-sans text-xs leading-4 text-mut">
        Lighter loads and one set fewer — recover, then push again.
      </Text>
    </View>
  </View>
);
