import * as Application from "expo-application";
import Constants from "expo-constants";

export type UpdateMode = "none" | "soft" | "force";

export interface AppVersionConfig {
  // Newest build live in the stores. Below this → a soft, dismissible prompt.
  latestVersion: string;
  // Oldest build we still support. Below this → a hard, non-dismissible gate.
  minSupportedVersion: string;
}

// The real installed native version (e.g. "1.4.0"). expo-application reads it
// from the built binary; Constants is the JS-side fallback for dev/Expo Go.
export const getInstalledVersion = (): string =>
  Application.nativeApplicationVersion ??
  Constants.expoConfig?.version ??
  "0.0.0";

// Numeric-dotted compare ("1.10.0" > "1.9.0"). Ignores pre-release/build
// suffixes — store versions don't carry them. Returns -1 | 0 | 1.
export const compareVersions = (a: string, b: string): number => {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
};

// Decide what to show for the installed build against remote config.
// force wins over soft; ties and newer-than-latest → nothing.
export const resolveUpdateMode = (
  installed: string,
  config: AppVersionConfig,
): UpdateMode => {
  if (compareVersions(installed, config.minSupportedVersion) < 0) return "force";
  if (compareVersions(installed, config.latestVersion) < 0) return "soft";
  return "none";
};
