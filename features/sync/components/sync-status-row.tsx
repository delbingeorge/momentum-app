import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { useAuthStore, useSyncStore } from "@/shared/stores";
import { Icon, PressableScale } from "@/shared/ui";

import { syncNow } from "../lib/engine";

const ago = (ts: number): string => {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export const SyncStatusRow = () => {
  const user = useAuthStore((state) => state.user);
  const isPaid = useAuthStore((state) => state.isPaid);
  const status = useSyncStore((state) => state.status);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);

  if (!isPaid || !user) return null;

  return (
    <View className="mt-2 flex-row items-center gap-2.5 rounded-[18px] border border-line bg-card px-4 py-3">
      <Icon
        name={status === "error" ? "x" : status === "syncing" ? "rotate" : "check"}
        size={16}
        color={
          status === "error"
            ? COLORS.drop
            : status === "syncing"
              ? COLORS.mut
              : COLORS.green
        }
        strokeWidth={2.4}
      />
      <Text className="flex-1 font-sans text-[13.5px] text-mut">
        {status === "syncing"
          ? "Syncing…"
          : status === "error"
            ? "Sync failed — changes are saved locally"
            : lastSyncedAt
              ? `Synced ${ago(lastSyncedAt)}`
              : "Waiting for first sync"}
      </Text>
      <PressableScale onPress={() => void syncNow()} disabled={status === "syncing"}>
        <Text className="font-sans-semibold text-[13px] text-lime">
          {status === "error" ? "Retry" : "Sync now"}
        </Text>
      </PressableScale>
    </View>
  );
};
