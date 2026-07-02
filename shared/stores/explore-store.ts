import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createPersistStorage } from "@/shared/lib/storage";

const MAX_RECENT_SEARCHES = 8;

// Explore-screen state worth keeping across launches: the user's recent
// catalog searches, shown as chips under the search bar.
interface ExploreState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addRecentSearch: (query) => {
        const q = query.trim();
        if (!q) return;
        const rest = get().recentSearches.filter(
          (s) => s.toLowerCase() !== q.toLowerCase(),
        );
        set({ recentSearches: [q, ...rest].slice(0, MAX_RECENT_SEARCHES) });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "momentum.explore.v1",
      version: 1,
      storage: createPersistStorage(),
    },
  ),
);
