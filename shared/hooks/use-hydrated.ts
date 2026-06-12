import { useEffect, useState } from "react";

import {
  useAuthStore,
  useBodyStore,
  usePlanStore,
  useSettingsStore,
  useWorkoutStore,
} from "@/shared/stores";

const persistedStores = [
  useAuthStore,
  usePlanStore,
  useWorkoutStore,
  useBodyStore,
  useSettingsStore,
];

const allHydrated = () =>
  persistedStores.every((store) => store.persist.hasHydrated());

// Gate rendering until every persisted store finished rehydrating, so route
// guards never run against default (empty) state.
export const useHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) return;
    const unsubscribers = persistedStores.map((store) =>
      store.persist.onFinishHydration(() => {
        if (allHydrated()) setHydrated(true);
      }),
    );
    if (allHydrated()) setHydrated(true);
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);

  return hydrated;
};
