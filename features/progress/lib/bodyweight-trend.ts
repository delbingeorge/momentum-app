import { COLORS } from "@/shared/lib/colors";
import type { BodyweightEntry, Goal } from "@/shared/types";

// How recent a window to judge the trend on. A cut/bulk is read over weeks,
// not the whole logged history (which may also be free-tier truncated).
const WINDOW_DAYS = 30;
// Below this the weight is "steady" — keeps daily water-weight noise from
// flipping the sentiment up and down.
const FLAT_KG = 0.3;

export type TrendDirection = "up" | "down" | "flat";
export type TrendSentiment = "good" | "bad" | "neutral";

export interface BodyTrend {
  current: number; // latest weight, kg
  deltaKg: number; // change across the window, kg
  ratePerWeek: number; // kg per week, kg
  direction: TrendDirection;
  sentiment: TrendSentiment;
  label: string;
  weighIns: number; // points used for the trend
}

const dayDiff = (fromIso: string, toIso: string): number =>
  Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000,
  );

// Signed weight change → direction, with a dead zone so daily noise reads flat.
export const directionOf = (
  deltaKg: number,
  flatKg = FLAT_KG,
): TrendDirection =>
  Math.abs(deltaKg) < flatKg ? "flat" : deltaKg > 0 ? "up" : "down";

export const sentimentFor = (
  direction: TrendDirection,
  goal: Goal | null,
): TrendSentiment => {
  if (direction === "flat") return "neutral";
  // Strength (and an unset goal) don't treat scale weight as the KPI.
  if (goal === "muscle") return direction === "up" ? "good" : "bad";
  if (goal === "fatloss") return direction === "down" ? "good" : "bad";
  return "neutral";
};

// Shared mapping so the card and history sheet color sentiment identically.
export const sentimentColor = (sentiment: TrendSentiment): string =>
  sentiment === "good"
    ? COLORS.green
    : sentiment === "bad"
      ? COLORS.warmup
      : COLORS.mut;

const labelFor = (
  direction: TrendDirection,
  sentiment: TrendSentiment,
): string => {
  if (direction === "flat") return "Weight steady";
  if (sentiment === "good")
    return direction === "down" ? "On track — losing fat" : "On track — gaining";
  if (sentiment === "bad") return "Trending off your goal";
  return direction === "up" ? "Trending up" : "Trending down";
};

// Goal-aware read of recent bodyweight movement. Returns null until there are
// at least two weigh-ins to compare.
export const analyzeTrend = (
  weights: BodyweightEntry[],
  goal: Goal | null,
): BodyTrend | null => {
  // weights arrive sorted ascending by date from the body store.
  const start = weights[0];
  const latest = weights[weights.length - 1];
  if (!start || !latest || weights.length < 2) return null;

  const cutoff = dayDiff(start.date, latest.date) - WINDOW_DAYS;
  // Entries inside the window; fall back to the full history if the window
  // holds fewer than two points (sparse loggers).
  const windowed = weights.filter(
    (entry) => dayDiff(start.date, entry.date) >= cutoff,
  );
  const series = windowed.length >= 2 ? windowed : weights;
  const first = series[0] ?? start;

  const deltaKg = latest.kg - first.kg;
  const spanDays = Math.max(1, dayDiff(first.date, latest.date));
  const ratePerWeek = (deltaKg / spanDays) * 7;

  const direction = directionOf(deltaKg);
  const sentiment = sentimentFor(direction, goal);

  return {
    current: latest.kg,
    deltaKg,
    ratePerWeek,
    direction,
    sentiment,
    label: labelFor(direction, sentiment),
    weighIns: series.length,
  };
};
