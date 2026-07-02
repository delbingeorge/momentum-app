import { useEffect } from "react";

import { isCloudConfigured } from "@/shared/lib/env";
import { useCatalogStore } from "@/shared/stores";

import { fetchExerciseCatalog } from "../api/catalog-api";

// Mounted once in the root layout. The bundled/persisted catalog renders
// immediately; this swaps in the cloud copy in the background so new exercises
// arrive without an app update. Needs no session — the exercises table is
// world-readable — and stays best-effort: offline or failed fetches just keep
// the current catalog.
export const useCatalogRefresh = (): void => {
  useEffect(() => {
    if (!isCloudConfigured) return;
    fetchExerciseCatalog()
      .then((exercises) => {
        useCatalogStore.getState().setExercises(exercises);
      })
      .catch((error: unknown) => {
        console.warn("catalog: refresh failed", error);
      });
  }, []);
};
