import { create } from "zustand";

// Ephemeral, never persisted: a fresh cold launch resets the JS bundle and
// with it this store. welcome-back is an intent armed by a successful sign-in
// and consumed once by the index gate, so a plain cold launch (which resets
// this to false) resumes straight into the app without greeting again.
interface LaunchState {
  welcomeBackPending: boolean;
  requestWelcomeBack: () => void;
  clearWelcomeBack: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
  welcomeBackPending: false,
  requestWelcomeBack: () => set({ welcomeBackPending: true }),
  clearWelcomeBack: () => set({ welcomeBackPending: false }),
}));
