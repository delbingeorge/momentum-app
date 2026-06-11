import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon } from "@/shared/ui/icon";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  // data-driven fill (e.g. warmup/drop set colors); defaults to lime
  checkedColor?: string;
  iconColor?: string;
  iconSize?: number;
}

export const Checkbox = ({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  checkedColor,
  iconColor = COLORS.limeText,
  iconSize = 15,
}: CheckboxProps) => (
  <CheckboxPrimitive.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
  >
    <View
      className={cn(
        "h-6 w-6 items-center justify-center rounded-[7px] border-[1.5px]",
        checked ? "border-lime bg-lime" : "border-line2 bg-transparent",
        disabled && "opacity-40",
        className,
      )}
      style={
        checked && checkedColor
          ? { backgroundColor: checkedColor, borderColor: checkedColor }
          : undefined
      }
    >
      {checked ? (
        <Icon name="check" size={iconSize} color={iconColor} strokeWidth={3} />
      ) : null}
    </View>
  </CheckboxPrimitive.Root>
);
