import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { createPersistStorage } from "@/shared/lib/storage";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isPaid: boolean;
  setUser: (user: AuthUser | null) => void;
  setPaid: (isPaid: boolean) => void;
  resetAuth: () => void;
}

const persistedSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  isPaid: z.boolean(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isPaid: false,
      setUser: (user) => set({ user }),
      setPaid: (isPaid) => set({ isPaid }),
      resetAuth: () => set({ user: null, isPaid: false }),
    }),
    {
      name: "momentum.auth.v1",
      version: 1,
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
