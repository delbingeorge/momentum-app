import type { Unit } from "@/shared/types/program";

// Single source of truth for weight conversion. Everything is stored in kg;
// these helpers are the only place kg ↔ display-unit math should live.
export const KG_PER_LB = 2.20462;

// Round to the nearest 0.5 (barbell plate granularity).
export const round5 = (n: number): number => Math.round(n * 2) / 2;

// A lift weight shown in the active unit: nearest 0.5 kg, or nearest whole lb.
// Whole-lb keeps displayed loads clean (130/135/140) instead of 132.5/137.5 and
// makes every screen agree on the same number.
export const kgToDisp = (kg: number, unit: Unit): number =>
  unit === "kg" ? round5(kg) : Math.round(kg * KG_PER_LB);

// A display-unit value back to kg for storage, snapped so it round-trips to the
// same clean display number (no float drift from repeated edits).
export const dispToKg = (value: number, unit: Unit): number =>
  unit === "kg" ? round5(value) : Math.round(value) / KG_PER_LB;

// One stepper tick, expressed in display units: 2.5 kg or 5 lb.
export const dispStep = (unit: Unit): number => (unit === "kg" ? 2.5 : 5);

// Step a stored kg weight by one tick (dir = +1 / -1), snapping to clean display
// units so stepping in lb never leaves a drifting kg value behind.
export const stepKgBy = (kg: number, unit: Unit, dir: 1 | -1): number =>
  Math.max(0, dispToKg(kgToDisp(kg, unit) + dir * dispStep(unit), unit));

// Total session volume shown in the active unit (whole number — it's large).
export const volumeToDisp = (volumeKg: number, unit: Unit): number =>
  Math.round(unit === "kg" ? volumeKg : volumeKg * KG_PER_LB);
