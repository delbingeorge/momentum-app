import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import {
  useAuthStore,
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";

import { type SyncEntity, toast, useSyncStore } from "@/shared/stores";

import { canSync, pushDirty, syncNow } from "../lib/engine";

const PUSH_DEBOUNCE_MS = 3000;

// Mounted once in the root layout. Free or signed-out users: every path no-ops.
export const useSyncEngine = (): void => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const isPaid = useAuthStore((state) => state.isPaid);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // full sync whenever a paid user lands (sign-in or app start)
  useEffect(() => {
    if (userId && isPaid) void syncNow();
  }, [userId, isPaid]);

  useEffect(() => {
    const schedulePush = () => {
      if (!canSync()) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void pushDirty()
          .then(() => {
            useSyncStore.getState().clearDirty();
            useSyncStore.getState().setLastSyncedAt(Date.now());
            useSyncStore.getState().setStatus("idle");
          })
          .catch((error) => {
            console.error("push failed:", error);
            useSyncStore.getState().setStatus("error");
            toast.error("Sync failed — changes saved on device.");
          });
      }, PUSH_DEBOUNCE_MS);
    };

    const markAndPush = (entity: SyncEntity) => {
      useSyncStore.getState().markDirty(entity);
      schedulePush();
    };

    const subscriptions = [
      useWorkoutStore.subscribe((state, prev) => {
        if (state.pastSessions !== prev.pastSessions) markAndPush("sessions");
        if (state.history !== prev.history) markAndPush("history");
        if (state.sinceDeload !== prev.sinceDeload) markAndPush("profile");
      }),
      useBodyStore.subscribe((state, prev) => {
        if (state.weights !== prev.weights) markAndPush("bodyweight");
      }),
      usePlanStore.subscribe((state, prev) => {
        if (state !== prev) markAndPush("profile");
      }),
      useSettingsStore.subscribe((state, prev) => {
        if (state.unit !== prev.unit || state.restSec !== prev.restSec) {
          markAndPush("profile");
        }
      }),
    ];

    // retry queued changes when the app returns to the foreground
    const appState = AppState.addEventListener("change", (status) => {
      if (status !== "active" || !canSync()) return;
      const { dirty, status: syncStatus } = useSyncStore.getState();
      if (syncStatus === "error" || Object.values(dirty).some(Boolean)) {
        schedulePush();
      }
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      appState.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
};
