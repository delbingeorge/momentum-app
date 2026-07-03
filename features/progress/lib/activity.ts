import { isoDate } from "@/shared/lib/dates";

interface ActivityDay {
  future: boolean;
  key?: string;
  lvl: number;
  date?: Date;
}

type ActivityWeek = ActivityDay[];

// GitHub-style grid: `cols` weeks × 7 days ending this week. Levels 1-4 are
// the day's sets relative to the best day, so shades read like commit counts.
export const buildActivity = (
  setsByDate: Record<string, number>,
  cols = 18,
): ActivityWeek[] => {
  const max = Math.max(0, ...Object.values(setsByDate));
  const levelFor = (key: string): number => {
    const sets = setsByDate[key];
    if (sets === undefined) return 0;
    if (sets <= 0 || max <= 0) return 1;
    return Math.max(1, Math.ceil((sets / max) * 4));
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weeks: ActivityWeek[] = [];
  for (let c = 0; c < cols; c++) {
    const ws = new Date(weekStart);
    ws.setDate(weekStart.getDate() - (cols - 1 - c) * 7);
    const days: ActivityDay[] = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(ws);
      d.setDate(ws.getDate() + r);
      if (d > today) {
        days.push({ future: true, lvl: 0 });
        continue;
      }
      const key = isoDate(d);
      days.push({ future: false, key, lvl: levelFor(key), date: d });
    }
    weeks.push(days);
  }
  return weeks;
};

export const monthLabels = (
  weeks: ActivityWeek[],
): { col: number; label: string }[] => {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const labels: { col: number; label: string }[] = [];
  weeks.forEach((week, col) => {
    const first = week.find((d) => !d.future);
    if (!first?.date) return;
    const month = first.date.getMonth();
    const prevWeek =
      col > 0 ? weeks[col - 1]?.find((d) => !d.future) : undefined;
    if (col === 0 || (prevWeek?.date && prevWeek.date.getMonth() !== month)) {
      const label = MONTHS[month];
      if (label) labels.push({ col, label });
    }
  });
  return labels;
};
