import { Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PressableScale } from "@/shared/ui/pressable-scale";

interface OptionCardProps {
  selected: boolean;
  onPress: () => void;
  title: string;
  blurb?: string;
  icon?: IconName;
}

export const OptionCard = ({
  selected,
  onPress,
  title,
  blurb,
  icon,
}: OptionCardProps) => (
  <PressableScale
    onPress={onPress}
    className={cn(
      "flex-row items-center gap-3.5 rounded-3xl p-4",
      selected ? "bg-lime-dim" : "bg-card",
    )}
  >
    {icon ? (
      <View
        className={cn(
          "h-[52px] w-[52px] items-center justify-center rounded-2xl",
          selected ? "bg-lime" : "bg-card2",
        )}
      >
        <Icon
          name={icon}
          size={26}
          color={selected ? COLORS.limeText : COLORS.text}
        />
      </View>
    ) : null}
    <View className="flex-1">
      <Text className="font-sans-bold text-xl tracking-tight text-text">
        {title}
      </Text>
      {blurb ? (
        <Text className="mt-0.5 font-sans text-sm text-mut">{blurb}</Text>
      ) : null}
    </View>
    <View
      className={cn(
        "h-6 w-6 items-center justify-center rounded-full border-2",
        selected ? "border-lime bg-lime" : "border-line2 bg-transparent",
      )}
    >
      {selected ? (
        <Icon name="check" size={14} color={COLORS.limeText} strokeWidth={3} />
      ) : null}
    </View>
  </PressableScale>
);
