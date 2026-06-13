import type { SessionRecord } from "@/shared/types";

import {
  FREE_HISTORY_WEEKS,
  filterDatesToFreeWindow,
  filterSessionsToFreeWindow,
} from "./entitlements";

const NOW = Date.parse("2026-06-13T00:00:00.000Z");
const DAY = 86_400_000;
const windowMs = FREE_HISTORY_WEEKS * 7 * DAY;

const session = (ts: number): SessionRecord => ({
  id: `s${ts}`,
  date: new Date(ts).toISOString().slice(0, 10),
  ts,
  dayKey: "pushA",
  dayName: "Push",
  durationSec: 0,
  volume: 0,
  totalSets: 0,
  exercises: [],
});

beforeAll(() => {
  jest.spyOn(Date, "now").mockReturnValue(NOW);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("filterSessionsToFreeWindow", () => {
  it("keeps sessions inside the free window and drops older ones", () => {
    const inside = session(NOW - windowMs + DAY);
    const outside = session(NOW - windowMs - DAY);
    const kept = filterSessionsToFreeWindow([inside, outside]);
    expect(kept.map((s) => s.id)).toEqual([inside.id]);
  });
});

describe("filterDatesToFreeWindow", () => {
  it("keeps dates on or after the cutoff date", () => {
    const insideDate = new Date(NOW - windowMs + DAY).toISOString().slice(0, 10);
    const outsideDate = new Date(NOW - windowMs - DAY)
      .toISOString()
      .slice(0, 10);
    const kept = filterDatesToFreeWindow([insideDate, outsideDate]);
    expect(kept).toEqual([insideDate]);
  });
});
