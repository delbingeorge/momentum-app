import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { createPersistStorage } from "@/shared/lib/storage";
import type { Unit } from "@/shared/types";
import { unitSchema } from "@/shared/types/schemas";

export interface ReminderConfig {
  enabled: boolean;
  time: string;
  days: number[];
}

interface SettingsState {
  unit: Unit;
  restSec: number;
  reminder: ReminderConfig;
  hapticsEnabled: boolean;
  reviewPromptDone: boolean;
  reviewPromptNextTs: number;
  setUnit: (unit: Unit) => void;
  setRestSec: (restSec: number) => void;
  setReminder: (reminder: ReminderConfig) => void;
  setHapticsEnabled: (hapticsEnabled: boolean) => void;
  completeReviewPrompt: () => void;
  snoozeReviewPrompt: (nextTs: number) => void;
  resetSettings: () => void;
}

const DEFAULT_REMINDER: ReminderConfig = {
  enabled: false,
  time: "18:00",
  days: [0, 1, 2, 3, 4, 5, 6],
};

const initialState = {
  unit: "kg" as Unit,
  restSec: 90,
  reminder: DEFAULT_REMINDER,
  hapticsEnabled: true,
  reviewPromptDone: false,
  reviewPromptNextTs: 0,
};

const persistedSchema = z.object({
  unit: unitSchema,
  restSec: z.number(),
  reminder: z.object({
    enabled: z.boolean(),
    time: z.string(),
    days: z.array(z.number()),
  }),
  hapticsEnabled: z.boolean().catch(true),
  reviewPromptDone: z.boolean().catch(false),
  reviewPromptNextTs: z.number().catch(0),
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setUnit: (unit) => set({ unit }),
      setRestSec: (restSec) => set({ restSec }),
      setReminder: (reminder) => set({ reminder }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      completeReviewPrompt: () => set({ reviewPromptDone: true }),
      snoozeReviewPrompt: (nextTs) => set({ reviewPromptNextTs: nextTs }),
      resetSettings: () => set(initialState),
    }),
    {
      name: "momentum.settings.v1",
      version: 1,
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
