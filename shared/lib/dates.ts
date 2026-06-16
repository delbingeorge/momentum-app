export const fmtDur = (totalSec: number): string =>
  `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;

// HH:MM:SS for workout durations (always shows hours)
export const fmtHMS = (totalSec: number): string => {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return [h, m, s % 60].map((n) => String(n).padStart(2, "0")).join(":");
};

// "00h 00m" for workout durations where seconds aren't needed
export const fmtHM = (totalSec: number): string => {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
};

export const isoDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const startOfWeek = (date: Date): Date => {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};
