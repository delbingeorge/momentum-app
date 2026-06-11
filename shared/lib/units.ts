import type { Unit } from "@/shared/types/program";

const KG_PER_LB = 2.2046;

export const round5 = (n: number): number => Math.round(n * 2) / 2;

export const kgToDisp = (kg: number, unit: Unit): number =>
  unit === "kg" ? round5(kg) : round5(kg * KG_PER_LB);

export const dispToKg = (value: number, unit: Unit): number =>
  unit === "kg" ? value : value / KG_PER_LB;

// kg-equivalent of one stepper tick: 2.5kg or ~5lb
export const stepKg = (unit: Unit): number => (unit === "kg" ? 2.5 : 2.268);
