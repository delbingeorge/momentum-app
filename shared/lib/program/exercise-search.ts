import type { Muscle } from "@/shared/types";

import { libGroups } from "./exercises";

export interface ExerciseGroup {
  muscle: Muscle;
  names: string[];
}

// Lightweight fuzzy matcher — subsequence match with scoring, no deps. Returns
// a relevance score (higher = better) or null when `query` (already lowercased)
// is not a subsequence of `target`.
const fuzzyScore = (query: string, target: string): number | null => {
  if (!query) return 0;
  const t = target.toLowerCase();

  // Contiguous substring is the strongest signal; matching at the start (or a
  // word boundary) scores higher still.
  const idx = t.indexOf(query);
  if (idx !== -1) {
    const boundary = idx === 0 || t[idx - 1] === " " || t[idx - 1] === "-";
    return 1000 - idx * 2 + (boundary ? 100 : 0);
  }

  let score = 0;
  let from = 0;
  let prev = -2;
  for (const ch of query) {
    const found = t.indexOf(ch, from);
    if (found === -1) return null;
    if (found === prev + 1) score += 8; // consecutive chars
    if (found === 0 || t[found - 1] === " " || t[found - 1] === "-") score += 6;
    score += Math.max(0, 4 - (found - from)); // proximity to last match
    prev = found;
    from = found + 1;
  }
  return score;
};

// Search the exercise library by name or muscle category. A category match
// (e.g. "core", "delts") surfaces every exercise in that group. Groups and the
// exercises within them are ordered by descending relevance; an empty query
// returns the full library in its natural anatomical order.
export const searchExercises = (query: string): ExerciseGroup[] => {
  const q = query.trim().toLowerCase();
  const groups = libGroups();

  if (!q) return groups.map(({ muscle, names }) => ({ muscle, names }));

  const ranked: { group: ExerciseGroup; best: number }[] = [];

  for (const { muscle, names } of groups) {
    const categoryScore = fuzzyScore(q, muscle);
    const scored: { name: string; score: number }[] = [];
    let best = -Infinity;

    for (const name of names) {
      const nameScore = fuzzyScore(q, name);
      const score =
        nameScore === null
          ? categoryScore
          : categoryScore === null
            ? nameScore
            : Math.max(nameScore, categoryScore);
      if (score !== null) {
        scored.push({ name, score });
        if (score > best) best = score;
      }
    }

    if (!scored.length) continue;
    scored.sort((a, b) => b.score - a.score);
    ranked.push({ group: { muscle, names: scored.map((s) => s.name) }, best });
  }

  ranked.sort((a, b) => b.best - a.best);
  return ranked.map((r) => r.group);
};
