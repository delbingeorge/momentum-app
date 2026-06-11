import { View } from "react-native";

import { cn } from "@/shared/lib/cn";

interface StepBarProps {
  step: number;
  total: number;
}

export const StepBar = ({ step, total }: StepBarProps) => (
  <View className="flex-row items-center gap-1.5">
    {Array.from({ length: total }).map((_, index) => (
      <View
        key={index}
        className={cn(
          "h-1 flex-1 rounded-full",
          index <= step ? "bg-lime" : "bg-line2",
        )}
      />
    ))}
  </View>
);
