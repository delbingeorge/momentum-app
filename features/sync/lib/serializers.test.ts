import type { SessionRecord } from "@/shared/types";

import {
  bodyweightRowSchema,
  historyToRows,
  rowToSession,
  sessionRowSchema,
  sessionToRow,
  weightsToRows,
} from "./serializers";

const session: SessionRecord = {
  id: "abc",
  date: "2026-06-01",
  ts: 1000,
  dayKey: "pushA",
  dayName: "Push",
  durationSec: 1800,
  volume: 5400,
  totalSets: 15,
  exercises: [
    {
      name: "Bench",
      muscle: "Chest",
      sets: [{ kg: 100, reps: 5, type: "normal" }],
    },
  ],
};

describe("session round-trip", () => {
  it("survives sessionToRow then rowToSession, ignoring sync metadata", () => {
    const row = sessionToRow(session, "user-1");
    const parsed = sessionRowSchema.parse(row);
    expect(rowToSession(parsed)).toEqual(session);
  });

  it("stamps user_id and updated_at on the row", () => {
    const row = sessionToRow(session, "user-1");
    expect(row.user_id).toBe("user-1");
    expect(typeof row.updated_at).toBe("string");
  });
});

describe("historyToRows", () => {
  it("emits one row per exercise with the user id", () => {
    const rows = historyToRows(
      { Bench: [{ kg: 100, reps: 5, type: "normal" }] },
      "user-1",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      user_id: "user-1",
      exercise_name: "Bench",
    });
  });
});

describe("weightsToRows", () => {
  it("emits one row per entry", () => {
    const rows = weightsToRows([{ date: "2026-06-01", kg: 80 }], "user-1");
    expect(rows[0]).toMatchObject({ user_id: "user-1", date: "2026-06-01", kg: 80 });
  });
});

describe("schemas reject malformed rows", () => {
  it("rejects a session row missing required fields", () => {
    expect(sessionRowSchema.safeParse({ id: "x" }).success).toBe(false);
  });

  it("rejects a bodyweight row with a non-numeric weight", () => {
    expect(
      bodyweightRowSchema.safeParse({
        date: "2026-06-01",
        kg: "heavy",
        updated_at: "2026-06-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
