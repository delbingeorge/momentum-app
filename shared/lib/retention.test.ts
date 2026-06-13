import type { SessionRecord } from "@/shared/types";

import { cycleWipeTs, daysUntilWipe, RETENTION_WEEKS } from "./retention";

const DAY = 86400000;
const CYCLE = RETENTION_WEEKS * 7 * DAY;
const NOW = Date.parse("2026-06-13T00:00:00.000Z");

const session = (ageDays: number): SessionRecord =>
  ({ id: `s${ageDays}`, ts: NOW - ageDays * DAY }) as SessionRecord;

describe("retention cycle math", () => {
  it("returns null when nothing is logged", () => {
    expect(cycleWipeTs([])).toBeNull();
    expect(daysUntilWipe([], NOW)).toBeNull();
  });

  it("dates the wipe from the oldest session", () => {
    const wipeAt = cycleWipeTs([session(40), session(10)]);
    expect(wipeAt).toBe(NOW - 40 * DAY + CYCLE);
  });

  it("counts down to the cycle end on the final day", () => {
    // oldest is 55 days old → wipes at 56 days → 1 day left
    expect(daysUntilWipe([session(55), session(3)], NOW)).toBe(1);
  });

  it("reports overdue cycles as zero or negative", () => {
    expect(daysUntilWipe([session(56)], NOW)).toBe(0);
    expect(daysUntilWipe([session(60)], NOW)).toBeLessThan(0);
  });
});
