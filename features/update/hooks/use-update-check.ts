import { useEffect } from "react";
import { SheetManager } from "react-native-actions-sheet";

import { isCloudConfigured } from "@/shared/lib/env";
import { useSettingsStore } from "@/shared/stores";

import { fetchAppVersionConfig } from "../api/update-api";
import { getInstalledVersion, resolveUpdateMode } from "../lib/version";

// Mounted once in the root layout. Best-effort, non-blocking: fetches the
// version thresholds from Supabase and, if the installed build is behind,
// shows the app-update sheet. force → non-dismissible gate; soft → dismissible
// and only shown once per latest_version (respecting a previous "Later").
export const useUpdateCheck = (): void => {
  useEffect(() => {
    if (!isCloudConfigured) return;

    fetchAppVersionConfig()
      .then((config) => {
        if (!config) return;
        const mode = resolveUpdateMode(getInstalledVersion(), config);

        if (mode === "none") return;

        if (mode === "soft") {
          const dismissed =
            useSettingsStore.getState().updatePromptDismissedVersion;
          if (dismissed === config.latestVersion) return;
        }

        void SheetManager.show("app-update", {
          payload: { mode, latestVersion: config.latestVersion },
        });
      })
      .catch((error: unknown) => {
        console.warn("update: version check failed", error);
      });
  }, []);
};
