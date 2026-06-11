import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/shared/lib/cn";

interface ScreenProps {
  children: ReactNode;
  className?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export const Screen = ({
  children,
  className,
  edges = ["top", "bottom"],
}: ScreenProps) => (
  <SafeAreaView edges={edges} className={cn("flex-1 bg-bg", className)}>
    {children}
  </SafeAreaView>
);
