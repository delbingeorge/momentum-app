import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import {
  BUNDLED_CATALOG_VERSION,
  BUNDLED_EXERCISES,
  type ExerciseDef,
  exerciseDefSchema,
} from "@/shared/lib/program/exercise-catalog";
import { createPersistStorage } from "@/shared/lib/storage";

// Exercise catalog source of truth on device: seeded from the bundled
// snapshot, replaced by the cloud copy when the launch refresh succeeds
// (features/catalog). Reference data, not user data — reset flows leave it.
interface CatalogState {
  exercises: ExerciseDef[];
  bundledVersion: number;
  setExercises: (exercises: ExerciseDef[]) => void;
}

const persistedSchema = z.object({
  exercises: z.array(exerciseDefSchema).min(1),
  bundledVersion: z.number(),
});

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      exercises: BUNDLED_EXERCISES,
      bundledVersion: BUNDLED_CATALOG_VERSION,
      setExercises: (exercises) => {
        // never let a bad fetch wipe the library; skip no-op refreshes so an
        // unchanged catalog doesn't re-render or re-persist every launch
        if (!exercises.length) return;
        if (JSON.stringify(exercises) === JSON.stringify(get().exercises)) {
          return;
        }
        set({ exercises });
      },
    }),
    {
      name: "momentum.catalog.v1",
      version: 1,
      storage: createPersistStorage(),
      // An app update can ship a newer bundled snapshot than what a previous
      // install persisted. When the bundled version differs, prefer the fresh
      // bundle (drop the persisted copy) — the launch refresh re-applies the
      // cloud rows on top.
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        if (!parsed.success) return current;
        if (parsed.data.bundledVersion !== BUNDLED_CATALOG_VERSION) {
          return current;
        }
        return { ...current, ...parsed.data };
      },
    },
  ),
);
