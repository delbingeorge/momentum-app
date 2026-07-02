import { Text } from "react-native";

import { cn } from "@/shared/lib/cn";

// Small uppercase mono heading that separates card groups on the Progress and
// Profile tabs. `className` overrides the default spacing (twMerge) for the
// first label in a scroll view, which needs no top margin.
export const SectionLabel = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <Text
    className={cn(
      "mb-2.5 mt-5 font-mono text-[11px] uppercase tracking-wider text-faint",
      className,
    )}
  >
    {children}
  </Text>
);
