import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import {
  useAuthStore,
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";

import { type SyncEntity, useSyncStore } from "@/shared/stores";

import { canSync, isApplyingCloud, pushNow, syncNow } from "../lib/engine";

const PUSH_DEBOUNCE_MS = 3000;

// Mounted once in the root layout. Signed-out users: every path no-ops. Free
// users sync too now (their backup is just capped to a window, see engine.ts).
export const useSyncEngine = (): void => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // full sync whenever a user lands (sign-in or app start), paid or free
  useEffect(() => {
    if (userId) void syncNow();
  }, [userId]);

  useEffect(() => {
    // pushNow claims the dirty flags, pushes, and restores them on failure, so
    // a write landing during the debounce or the in-flight request isn't lost
    const schedulePush = () => {
      if (!canSync()) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void pushNow(), PUSH_DEBOUNCE_MS);
    };

    const markAndPush = (entity: SyncEntity) => {
      // a pull replacing the caches is not a local edit — marking it dirty
      // would echo every pull straight back up as a push
      if (isApplyingCloud()) return;
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
