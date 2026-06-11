import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { buildSchedule, splitsFor } from "@/shared/lib/program";
import { createPersistStorage } from "@/shared/lib/storage";
import type { Gender, Goal, Level, ScheduledDay } from "@/shared/types";
import {
  genderSchema,
  goalSchema,
  levelSchema,
  scheduledDaySchema,
} from "@/shared/types/schemas";

interface PlanState {
  goal: Goal | null;
  level: Level | null;
  gender: Gender | null;
  weightKg: number;
  days: number;
  splitId: string | null;
  schedule: ScheduledDay[] | null;
  todayIndex: number;
  setGoal: (goal: Goal) => void;
  setLevel: (level: Level) => void;
  setGender: (gender: Gender) => void;
  setWeightKg: (weightKg: number) => void;
  setDays: (days: number) => void;
  setSplitId: (splitId: string) => void;
  setTodayIndex: (todayIndex: number) => void;
  setSchedule: (schedule: ScheduledDay[]) => void;
  confirmSplit: () => ScheduledDay[];
  resetPlan: () => void;
}

const initialState = {
  goal: null,
  level: null,
  gender: null,
  weightKg: 70,
  days: 4,
  splitId: null,
  schedule: null,
  todayIndex: 0,
};

const persistedSchema = z.object({
  goal: goalSchema.nullable(),
  level: levelSchema.nullable(),
  gender: genderSchema.nullable(),
  weightKg: z.number(),
  days: z.number(),
  splitId: z.string().nullable(),
  schedule: z.array(scheduledDaySchema).nullable(),
  todayIndex: z.number(),
});

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setGoal: (goal) => set({ goal }),
      setLevel: (level) => set({ level }),
      setGender: (gender) => set({ gender }),
      setWeightKg: (weightKg) => set({ weightKg }),
      // Changing days invalidates the chosen split (options differ per count)
      setDays: (days) => set({ days, splitId: null }),
      setSplitId: (splitId) => set({ splitId }),
      setTodayIndex: (todayIndex) => set({ todayIndex }),
      setSchedule: (schedule) => set({ schedule }),
      confirmSplit: () => {
        const { days, splitId } = get();
        const split =
          splitsFor(days).find((candidate) => candidate.id === splitId) ??
          splitsFor(days)[0];
        if (!split) return [];
        const schedule = buildSchedule(split, days);
        set({ splitId: split.id, schedule, todayIndex: 0 });
        return schedule;
      },
      resetPlan: () => set(initialState),
    }),
    {
      name: "momentum.plan.v1",
      version: 1,
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
