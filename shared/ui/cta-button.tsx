import { Text } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PressableScale } from "@/shared/ui/pressable-scale";

interface CtaButtonProps {
  label: string;
  onPress: () => void;
  variant?: "lime" | "white";
  icon?: IconName;
  disabled?: boolean;
  className?: string;
}

export const CtaButton = ({
  label,
  onPress,
  variant = "lime",
  icon,
  disabled = false,
  className,
}: CtaButtonProps) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    className={cn(
      "h-[58px] flex-row items-center justify-center gap-2.5 rounded-full",
      disabled ? "bg-card2" : variant === "lime" ? "bg-lime" : "bg-white",
      className,
    )}
  >
    {icon ? (
      <Icon
        name={icon}
        size={20}
        strokeWidth={2.4}
        color={disabled ? COLORS.faint : COLORS.limeText}
      />
    ) : null}
    <Text
      className={cn(
        "font-sans-bold text-lg tracking-tight",
        disabled ? "text-faint" : "text-lime-text",
      )}
    >
      {label}
    </Text>
  </PressableScale>
);
