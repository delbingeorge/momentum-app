import { Platform } from "react-native";

import { getSupabase } from "@/shared/lib/api-client";

import type { AppVersionConfig } from "../lib/version";

const getPlatform = (): string => (Platform.OS === "ios" ? "ios" : "android");

// Reads the per-platform row from the `app_config` table that holds the
// version thresholds. World-readable (see app-config.sql) so this needs no
// session. Returns null on any error/misconfig so the caller can silently
// skip the prompt.
export const fetchAppVersionConfig =
  async (): Promise<AppVersionConfig | null> => {
    const { data, error } = await getSupabase()
      .from("app_config")
      .select("latest_version, min_supported_version")
      .eq("platform", getPlatform())
      .maybeSingle();

    if (error || !data) return null;
    return {
      latestVersion: data.latest_version,
      minSupportedVersion: data.min_supported_version,
    };
  };
