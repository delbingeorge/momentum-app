import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { kgToDisp } from "@/shared/lib/units";
import type { Unit } from "@/shared/types";
import { Icon } from "@/shared/ui";

import type { PersonalRecord } from "../lib/training-stats";

interface PrListProps {
  prs: PersonalRecord[];
  unit: Unit;
}

export const PrList = ({ prs, unit }: PrListProps) => (
  <View>
    <Text className="mb-3 font-mono text-[11px] uppercase tracking-wider text-faint">
      Recent personal records
    </Text>
    {prs.length === 0 ? (
      <View className="items-center rounded-2xl border border-dashed border-line2 bg-card px-4 py-4">
        <Text className="font-sans text-sm text-mut">
          Beat a previous best to bank your first PR.
        </Text>
      </View>
    ) : (
      <View className="gap-2">
        {prs.map((pr) => (
          <View
            key={`${pr.name}-${pr.ts}`}
            className="flex-row items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5"
          >
            <View className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-lime-dim">
              <Icon
                name="medal"
                size={18}
                color={COLORS.lime}
                strokeWidth={1.8}
              />
            </View>
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-sans-semibold text-[15px] text-text"
              >
                {pr.name}
              </Text>
              <Text className="mt-0.5 font-mono text-[10px] text-faint">
                {new Date(pr.ts).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Icon
                name="arrowUp"
                size={13}
                color={COLORS.green}
                strokeWidth={2.6}
              />
              <Text className="font-sans-bold text-sm text-green">
                {pr.kg !== undefined
                  ? `${kgToDisp(pr.kg, unit)} ${unit}`
                  : `${pr.reps} reps`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    )}
  </View>
);
