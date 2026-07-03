import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
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
  // filter by workout type (dayName); null = show all
  const [filter, setFilter] = useState<string | null>(null);
  // page lazily so opening Progress doesn't render the whole history at once
  const [shown, setShown] = useState(PAGE_SIZE);

  // distinct workout types, in order of most-recent use
  const dayNames = useMemo(() => {
    const seen: string[] = [];
    for (const s of sessions) {
      if (!seen.includes(s.dayName)) seen.push(s.dayName);
    }
    return seen;
  }, [sessions]);

  // drop a stale filter if that workout type no longer exists
  useEffect(() => {
    if (filter !== null && !dayNames.includes(filter)) setFilter(null);
  }, [dayNames, filter]);

  const filtered = useMemo(
    () => (filter ? sessions.filter((s) => s.dayName === filter) : sessions),
    [sessions, filter],
  );

  // reset paging when the source list or the filter changes
  useEffect(() => setShown(PAGE_SIZE), [sessions, filter]);

  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;

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
        <>
          {dayNames.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 mb-3"
              contentContainerClassName="flex-row gap-1.5 px-5"
            >
              {[null, ...dayNames].map((name) => {
                const active = filter === name;
                return (
                  <PressableScale
                    key={name ?? "__all"}
                    onPress={() => setFilter(name)}
                    className={cn(
                      "rounded-full border px-3 py-1.5",
                      active ? "border-lime bg-lime" : "border-line bg-card",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-[13px]",
                        active
                          ? "font-sans-bold text-lime-text"
                          : "font-sans text-mut",
                      )}
                    >
                      {name ?? "All"}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>
          ) : null}
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
            {remaining === 0 && filter === null && lockedCount > 0 ? (
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
        </>
      )}
    </View>
  );
};
