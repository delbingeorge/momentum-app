import { create } from "zustand";

// Ephemeral, never persisted: a fresh cold launch resets the JS bundle and
// with it this store. welcome-back is an intent armed by a successful paid
// sign-in and consumed once by the index gate, so a plain cold launch (which
// resets this to false) resumes straight into the app without greeting again.
interface LaunchState {
  welcomeBackPending: boolean;
  requestWelcomeBack: () => void;
  clearWelcomeBack: () => void;
  // data-retention warning sheet, shown at most once per launch
  dataWarningSeen: boolean;
  markDataWarningSeen: () => void;
  // profile retention banner, dismissable for the rest of the launch
  retentionBannerDismissed: boolean;
  dismissRetentionBanner: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
  welcomeBackPending: false,
  requestWelcomeBack: () => set({ welcomeBackPending: true }),
  clearWelcomeBack: () => set({ welcomeBackPending: false }),
  dataWarningSeen: false,
  markDataWarningSeen: () => set({ dataWarningSeen: true }),
  retentionBannerDismissed: false,
  dismissRetentionBanner: () => set({ retentionBannerDismissed: true }),
}));
