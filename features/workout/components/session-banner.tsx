import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { kgToDisp } from "@/shared/lib/units";
import type { ProgressionSuggestion, Unit } from "@/shared/types";
import { Icon } from "@/shared/ui";

interface SessionBannerProps {
  deload: boolean;
  suggestion: ProgressionSuggestion | null;
  unit: Unit;
}

export const SessionBanner = ({
  deload,
  suggestion,
  unit,
}: SessionBannerProps) => {
  if (deload) {
    return (
      <View className="mb-3 flex-row items-center gap-2.5 rounded-2xl bg-warmup-dim px-3.5 py-3">
        <Icon name="rotate" size={17} color={COLORS.warmup} />
        <Text className="flex-1 font-sans text-[13px] leading-[17px] text-text">
          <Text className="font-sans-bold">Deload week.</Text> Lighter loads and
          fewer sets so your body can recover and come back stronger.
        </Text>
      </View>
    );
  }
  if (suggestion?.note === "overload") {
    return (
      <View className="mb-3 flex-row items-center gap-2.5 rounded-2xl bg-lime-dim px-3.5 py-3">
        <Icon name="trendingUp" size={17} color={COLORS.lime} />
        <Text className="flex-1 font-sans text-[13px] leading-[17px] text-text">
          <Text className="font-sans-bold">Progressive overload.</Text> You
          cleared the top of your range, so the weight goes up to{" "}
          {kgToDisp(suggestion.kg, unit)} {unit}.
        </Text>
      </View>
    );
  }
  return null;
};
