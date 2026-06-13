import { create } from "zustand";

// Ephemeral, never persisted: a fresh cold launch resets the JS bundle and
// with it this store, so the welcome-back screen shows once per app launch
// rather than on every in-app navigation back through the index gate.
interface LaunchState {
  welcomeBackSeen: boolean;
  markWelcomeBackSeen: () => void;
  resetWelcomeBack: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
  welcomeBackSeen: false,
  markWelcomeBackSeen: () => set({ welcomeBackSeen: true }),
  resetWelcomeBack: () => set({ welcomeBackSeen: false }),
}));
