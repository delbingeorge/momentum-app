import { MAX_PAST_SESSIONS } from "@/shared/stores/workout-store";

import {
  datesFromSessions,
  historyFromRows,
  sessionsFromRows,
  weightsFromRows,
} from "./apply-cloud";
import type { BodyweightRow, SessionRow } from "./serializers";

const sessionRow = (
  id: string,
  ts: number,
  date = "2026-01-01",
): SessionRow => ({
  id,
  date,
  ts,
  day_key: "pushA",
  day_name: "Push",
  duration_sec: 1000,
  volume: 5000,
  total_sets: 12,
  exercises: [],
  updated_at: new Date(ts).toISOString(),
});

describe("sessionsFromRows", () => {
  it("maps rows to records, newest first", () => {
    const sessions = sessionsFromRows([
      sessionRow("a", 1),
      sessionRow("c", 3),
      sessionRow("b", 2),
    ]);
    expect(sessions.map((s) => s.id)).toEqual(["c", "b", "a"]);
    expect(sessions[0]?.dayKey).toBe("pushA");
  });

  it("caps at the local cache limit, keeping the newest", () => {
    const rows = Array.from({ length: MAX_PAST_SESSIONS + 20 }, (_, i) =>
      sessionRow(`s${i}`, i),
    );
    const sessions = sessionsFromRows(rows);
    expect(sessions).toHaveLength(MAX_PAST_SESSIONS);
    expect(sessions[0]?.ts).toBe(MAX_PAST_SESSIONS + 19);
  });
});

describe("datesFromSessions", () => {
  it("dedupes and sorts ascending", () => {
    const sessions = sessionsFromRows([
      sessionRow("a", 1, "2026-01-03"),
      sessionRow("b", 2, "2026-01-01"),
      sessionRow("c", 3, "2026-01-01"),
    ]);
    expect(datesFromSessions(sessions)).toEqual(["2026-01-01", "2026-01-03"]);
  });
});

describe("historyFromRows", () => {
  it("keys sets by exercise name, replacing wholesale", () => {
    const set = { kg: 100, reps: 5, type: "normal" as const };
    expect(
      historyFromRows([
        { exercise_name: "Bench", sets: [set], updated_at: "2026-01-01" },
      ]),
    ).toEqual({ Bench: [set] });
  });
});

describe("weightsFromRows", () => {
  it("maps and sorts ascending by date", () => {
    const row = (date: string, kg: number): BodyweightRow => ({
      date,
      kg,
      updated_at: "2026-01-01",
    });
    expect(weightsFromRows([row("2026-01-02", 80), row("2026-01-01", 79)])).toEqual([
      { date: "2026-01-01", kg: 79 },
      { date: "2026-01-02", kg: 80 },
    ]);
  });
});
