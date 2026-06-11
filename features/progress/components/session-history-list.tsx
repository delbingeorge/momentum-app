import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import type { SessionRecord, Unit } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

const KG_PER_LB = 2.2046;

interface SessionHistoryListProps {
  sessions: SessionRecord[];
  unit: Unit;
  onSelect: (session: SessionRecord) => void;
}

export const SessionHistoryList = ({
  sessions,
  unit,
  onSelect,
}: SessionHistoryListProps) => (
  <View>
    <Text className="mb-3 font-mono text-[11px] uppercase tracking-wider text-faint">
      Recent workouts
    </Text>
    {sessions.length === 0 ? (
      <View className="items-center rounded-2xl border border-dashed border-line2 bg-card px-4 py-5">
        <Text className="font-sans text-sm text-mut">
          No sessions yet. Finish a workout and it will show up here.
        </Text>
      </View>
    ) : (
      <View className="gap-2">
        {sessions.map((session) => {
          const vol =
            unit === "kg"
              ? session.volume
              : Math.round(session.volume * KG_PER_LB);
          return (
            <PressableScale
              key={session.id}
              onPress={() => onSelect(session)}
              className="flex-row items-center gap-3 rounded-2xl border border-line bg-card px-3.5 py-3"
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-card2">
                <Icon
                  name="dumbbell"
                  size={18}
                  color={COLORS.mut}
                  strokeWidth={1.8}
                />
              </View>
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="font-sans-bold text-[15px] text-text"
                >
                  {session.dayName}
                </Text>
                <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
                  {new Date(session.ts).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {session.totalSets} sets · {fmtDur(session.durationSec)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-sans-bold text-sm text-text">
                  {vol.toLocaleString()}
                </Text>
                <Text className="font-mono text-[9px] uppercase text-faint">
                  {unit} vol
                </Text>
              </View>
              <Icon name="chevR" size={17} color={COLORS.faint} />
            </PressableScale>
          );
        })}
      </View>
    )}
  </View>
);
