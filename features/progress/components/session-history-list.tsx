import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { fmtHM } from "@/shared/lib/dates";
import { volumeToDisp } from "@/shared/lib/units";
import type { SessionRecord, Unit } from "@/shared/types";
import { Icon, PressableScale } from "@/shared/ui";

const PAGE_SIZE = 10;

interface SessionHistoryListProps {
  sessions: SessionRecord[];
  lockedCount?: number;
  unit: Unit;
  onSelect: (session: SessionRecord) => void;
}

export const SessionHistoryList = ({
  sessions,
  lockedCount = 0,
  unit,
  onSelect,
}: SessionHistoryListProps) => {
  // page lazily so opening Progress doesn't render the whole history at once
  const [shown, setShown] = useState(PAGE_SIZE);
  useEffect(() => setShown(PAGE_SIZE), [sessions]);

  const visible = sessions.slice(0, shown);
  const remaining = sessions.length - visible.length;

  return (
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
          {visible.map((session) => {
            const vol = volumeToDisp(session.volume, unit);
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
                    · {session.totalSets} sets · {fmtHM(session.durationSec)}
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
          {remaining > 0 ? (
            <PressableScale
              onPress={() => setShown((n) => n + PAGE_SIZE)}
              className="items-center rounded-2xl border border-line bg-card px-3.5 py-3"
            >
              <Text className="font-sans-semibold text-[13px] text-lime">
                Show {Math.min(PAGE_SIZE, remaining)} more
              </Text>
            </PressableScale>
          ) : null}
          {remaining === 0 && lockedCount > 0 ? (
            <PressableScale
              onPress={() => router.push("/paywall")}
              className="flex-row items-center gap-3 rounded-2xl border border-dashed border-line2 bg-card px-3.5 py-3"
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-lime-dim">
                <Icon
                  name="medal"
                  size={18}
                  color={COLORS.lime}
                  strokeWidth={1.8}
                />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px] text-text">
                  {lockedCount} older workout{lockedCount === 1 ? "" : "s"}
                </Text>
                <Text className="mt-0.5 font-mono text-[10.5px] text-faint">
                  Unlock to see your full history
                </Text>
              </View>
              <Text className="rounded-full bg-lime px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-lime-text">
                Premium
              </Text>
            </PressableScale>
          ) : null}
        </View>
      )}
    </View>
  );
};
