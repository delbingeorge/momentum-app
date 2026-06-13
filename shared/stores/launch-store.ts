import { create } from "zustand";

// Ephemeral, never persisted: a fresh cold launch resets the JS bundle and
// with it this store, so the welcome-back screen shows once per app launch
// rather than on every in-app navigation back through the index gate.
interface LaunchState {
  welcomeBackSeen: boolean;
  markWelcomeBackSeen: () => void;
  resetWelcomeBack: () => void;
  // data-retention warning sheet, shown at most once per launch
  dataWarningSeen: boolean;
  markDataWarningSeen: () => void;
  // profile retention banner, dismissable for the rest of the launch
  retentionBannerDismissed: boolean;
  dismissRetentionBanner: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
  welcomeBackSeen: false,
  markWelcomeBackSeen: () => set({ welcomeBackSeen: true }),
  resetWelcomeBack: () => set({ welcomeBackSeen: false }),
  dataWarningSeen: false,
  markDataWarningSeen: () => set({ dataWarningSeen: true }),
  retentionBannerDismissed: false,
  dismissRetentionBanner: () => set({ retentionBannerDismissed: true }),
}));
