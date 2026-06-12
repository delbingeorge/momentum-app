import { COLORS } from "@/shared/lib/colors";
import { CtaButton, Icon, PressableScale } from "@/shared/ui";
import { View } from "react-native";

interface StartBarProps {
  hasActive: boolean;
  onStart: () => void;
  onResume: () => void;
  onDiscard: () => void;
}

export const StartBar = ({
  hasActive,
  onStart,
  onResume,
  onDiscard,
}: StartBarProps) => {
  if (!hasActive) {
    return (
      <View className="px-5 pb-3.5 pt-2">
        <CtaButton label="Start workout" icon="play" onPress={onStart} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2.5 px-5 pb-3.5 pt-2">
      <View className="flex-1">
        <CtaButton label="Resume" icon="play" onPress={onResume} />
      </View>
      <PressableScale
        onPress={onDiscard}
        className="h-[58px] w-[58px] items-center justify-center rounded-full border border-line2"
      >
        <Icon name="trash" size={19} color={COLORS.mut} />
      </PressableScale>
    </View>
  );
};
