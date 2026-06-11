import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { isoDate } from "@/shared/lib/dates";
import { seedWeights } from "@/shared/lib/program";
import { createPersistStorage } from "@/shared/lib/storage";
import type { BodyweightEntry, Goal } from "@/shared/types";
import { bodyweightEntrySchema } from "@/shared/types/schemas";

interface BodyState {
  weights: BodyweightEntry[];
  logWeight: (kg: number) => void;
  seedIfEmpty: (goal: Goal) => void;
  resetBody: () => void;
}

const persistedSchema = z.object({
  weights: z.array(bodyweightEntrySchema),
});

export const useBodyStore = create<BodyState>()(
  persist(
    (set) => ({
      weights: [],
      logWeight: (kg) =>
        set((state) => {
          const today = isoDate();
          const without = state.weights.filter((entry) => entry.date !== today);
          return {
            weights: [...without, { date: today, kg }].sort((a, b) =>
              a.date < b.date ? -1 : 1,
            ),
          };
        }),
      seedIfEmpty: (goal) =>
        set((state) => ({
          weights: state.weights.length ? state.weights : seedWeights(goal),
        })),
      resetBody: () => set({ weights: [] }),
    }),
    {
      name: "momentum.body.v1",
      version: 1,
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
