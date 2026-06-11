export const fmt12 = (time: string): string => {
  const [hRaw, mRaw] = time.split(":");
  const h = Number(hRaw ?? 0);
  const m = Number(mRaw ?? 0);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const reminderSummary = (days: number[]): string => {
  if (days.length === 7) return "Every day";
  if ([1, 2, 3, 4, 5].every((d) => days.includes(d)) && days.length === 5)
    return "Weekdays";
  return days.map((d) => DAY_NAMES[d]).join(" · ");
};
