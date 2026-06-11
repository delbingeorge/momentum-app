import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { createPersistStorage } from "@/shared/lib/storage";

export type SyncEntity = "profile" | "sessions" | "history" | "bodyweight";
export type SyncStatus = "idle" | "syncing" | "error";

interface SyncState {
  dirty: Record<SyncEntity, boolean>;
  lastSyncedAt: number | null;
  status: SyncStatus;
  markDirty: (entity: SyncEntity) => void;
  clearDirty: () => void;
  setStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (ts: number) => void;
  resetSync: () => void;
}

const CLEAN: Record<SyncEntity, boolean> = {
  profile: false,
  sessions: false,
  history: false,
  bodyweight: false,
};

const persistedSchema = z.object({
  dirty: z.object({
    profile: z.boolean(),
    sessions: z.boolean(),
    history: z.boolean(),
    bodyweight: z.boolean(),
  }),
  lastSyncedAt: z.number().nullable(),
});

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      dirty: CLEAN,
      lastSyncedAt: null,
      status: "idle",
      markDirty: (entity) =>
        set((state) => ({ dirty: { ...state.dirty, [entity]: true } })),
      clearDirty: () => set({ dirty: CLEAN }),
      setStatus: (status) => set({ status }),
      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
      resetSync: () => set({ dirty: CLEAN, lastSyncedAt: null, status: "idle" }),
    }),
    {
      name: "momentum.sync.v1",
      version: 1,
      storage: createPersistStorage(),
      partialize: (state) => ({
        dirty: state.dirty,
        lastSyncedAt: state.lastSyncedAt,
      }),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
