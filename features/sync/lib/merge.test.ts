import type { SessionRecord } from "@/shared/types";

import {
  mergeHistory,
  mergeSessionDates,
  mergeSessions,
  mergeWeights,
} from "./merge";
import type { BodyweightRow, SessionRow } from "./serializers";

const session = (
  id: string,
  ts: number,
  date = "2026-01-01",
): SessionRecord => ({
  id,
  date,
  ts,
  dayKey: "pushA",
  dayName: "Push",
  durationSec: 1000,
  volume: 5000,
  totalSets: 12,
  exercises: [],
});

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

const iso = (ts: number): string => new Date(ts).toISOString();

describe("mergeSessions", () => {
  it("unions local and remote by id", () => {
    const merged = mergeSessions([session("a", 2)], [sessionRow("b", 1)]);
    expect(merged.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });

  it("local wins over remote for the same id", () => {
    const merged = mergeSessions(
      [session("a", 2, "local-date")],
      [sessionRow("a", 2, "remote-date")],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.date).toBe("local-date");
  });

  it("sorts newest first by ts", () => {
    const merged = mergeSessions(
      [session("a", 1), session("c", 3)],
      [sessionRow("b", 2)],
    );
    expect(merged.map((s) => s.id)).toEqual(["c", "b", "a"]);
  });

  it("caps the result at 60 sessions, keeping the newest", () => {
    const local = Array.from({ length: 80 }, (_, i) => session(`s${i}`, i));
    const merged = mergeSessions(local, []);
    expect(merged).toHaveLength(60);
    expect(merged[0]?.ts).toBe(79);
    expect(merged.at(-1)?.ts).toBe(20);
  });
});

describe("mergeSessionDates", () => {
  it("dedupes and sorts dates from locals and sessions", () => {
    const merged = mergeSessionDates(
      ["2026-01-03", "2026-01-01"],
      [session("a", 1, "2026-01-02"), session("b", 2, "2026-01-01")],
    );
    expect(merged).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });
});

describe("mergeHistory", () => {
  const set = { kg: 100, reps: 5, type: "normal" as const };

  it("adds remote exercises the local copy has never seen", () => {
    const merged = mergeHistory(
      {},
      [{ exercise_name: "Bench", sets: [set], updated_at: iso(50) }],
      100,
    );
    expect(merged.Bench).toEqual([set]);
  });

  it("keeps local when the remote row is older than the last sync", () => {
    const localSet = { ...set, kg: 999 };
    const merged = mergeHistory(
      { Bench: [localSet] },
      [{ exercise_name: "Bench", sets: [set], updated_at: iso(50) }],
      100,
    );
    expect(merged.Bench).toEqual([localSet]);
  });

  it("takes remote when it is newer than the last sync", () => {
    const merged = mergeHistory(
      { Bench: [{ ...set, kg: 1 }] },
      [{ exercise_name: "Bench", sets: [set], updated_at: iso(200) }],
      100,
    );
    expect(merged.Bench).toEqual([set]);
  });
});

describe("mergeWeights", () => {
  const row = (date: string, kg: number, ts: number): BodyweightRow => ({
    date,
    kg,
    updated_at: iso(ts),
  });

  it("merges per date and sorts ascending", () => {
    const merged = mergeWeights(
      [{ date: "2026-01-02", kg: 80 }],
      [row("2026-01-01", 79, 50)],
      100,
    );
    expect(merged).toEqual([
      { date: "2026-01-01", kg: 79 },
      { date: "2026-01-02", kg: 80 },
    ]);
  });

  it("keeps local for a date when the remote row predates the last sync", () => {
    const merged = mergeWeights(
      [{ date: "2026-01-01", kg: 80 }],
      [row("2026-01-01", 79, 50)],
      100,
    );
    expect(merged[0]?.kg).toBe(80);
  });

  it("takes remote for a date when the remote row is newer", () => {
    const merged = mergeWeights(
      [{ date: "2026-01-01", kg: 80 }],
      [row("2026-01-01", 79, 200)],
      100,
    );
    expect(merged[0]?.kg).toBe(79);
  });
});
