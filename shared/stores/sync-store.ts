import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { createPersistStorage } from "@/shared/lib/storage";

export type SyncEntity = "profile" | "sessions" | "history" | "bodyweight";
type SyncStatus = "idle" | "syncing" | "error";

interface SyncState {
  dirty: Record<SyncEntity, boolean>;
  lastSyncedAt: number | null;
  // hash of the last profile payload pushed; lets the engine skip bumping the
  // cloud profile's updated_at when nothing in the profile actually changed,
  // which otherwise makes every device's pull clobber the others' plan
  lastProfileHash: string | null;
  status: SyncStatus;
  markDirty: (entity: SyncEntity) => void;
  // atomically read the dirty flags and clear them; a mutation arriving during
  // an in-flight push re-sets its own flag untouched, so a late write is never
  // lost (restoreDirty handles the push-failure path)
  claimDirty: () => Record<SyncEntity, boolean>;
  // OR a claimed snapshot back in after a failed push so nothing is dropped
  restoreDirty: (claimed: Record<SyncEntity, boolean>) => void;
  clearDirty: () => void;
  setStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (ts: number) => void;
  setProfileHash: (hash: string) => void;
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
  lastProfileHash: z.string().nullable().optional(),
});

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      dirty: CLEAN,
      lastSyncedAt: null,
      lastProfileHash: null,
      status: "idle",
      markDirty: (entity) =>
        set((state) => ({ dirty: { ...state.dirty, [entity]: true } })),
      claimDirty: () => {
        const claimed = get().dirty;
        set({ dirty: CLEAN });
        return claimed;
      },
      restoreDirty: (claimed) =>
        set((state) => ({
          dirty: {
            profile: state.dirty.profile || claimed.profile,
            sessions: state.dirty.sessions || claimed.sessions,
            history: state.dirty.history || claimed.history,
            bodyweight: state.dirty.bodyweight || claimed.bodyweight,
          },
        })),
      clearDirty: () => set({ dirty: CLEAN }),
      setStatus: (status) => set({ status }),
      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
      setProfileHash: (lastProfileHash) => set({ lastProfileHash }),
      resetSync: () =>
        set({
          dirty: CLEAN,
          lastSyncedAt: null,
          lastProfileHash: null,
          status: "idle",
        }),
    }),
    {
      name: "momentum.sync.v1",
      version: 1,
      storage: createPersistStorage(),
      partialize: (state) => ({
        dirty: state.dirty,
        lastSyncedAt: state.lastSyncedAt,
        lastProfileHash: state.lastProfileHash,
      }),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
