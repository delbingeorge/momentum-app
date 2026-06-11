import type { IconName } from "@/shared/ui";

const FULL_DAY: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export const fullDay = (label: string): string => FULL_DAY[label] ?? label;

export const shortDayName = (name: string): string =>
  name.replace(/ (day|body)/i, "");

export const muscleGlyph = (muscle: string): IconName => {
  if (muscle.includes("delt")) return "target";
  if (muscle === "Chest" || muscle === "Back") return "layers";
  if (muscle === "Biceps" || muscle === "Triceps") return "dumbbell";
  return "activity";
};
