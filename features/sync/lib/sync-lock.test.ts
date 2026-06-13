import { isSyncing, runExclusive } from "./sync-lock";

const defer = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("runExclusive", () => {
  it("serializes overlapping runs instead of running them concurrently", async () => {
    const order: string[] = [];
    const first = defer();

    const a = runExclusive(async () => {
      order.push("a:start");
      await first.promise;
      order.push("a:end");
    });
    // b starts while a is in flight; it must coalesce, not run its body
    const b = runExclusive(async () => {
      order.push("b:body");
    });

    expect(isSyncing()).toBe(true);
    first.resolve();
    await Promise.all([a, b]);

    // b's body never ran (coalesced onto a); only a executed
    expect(order).toEqual(["a:start", "a:end"]);
  });

  it("runs sequentially scheduled tasks one after another", async () => {
    const order: string[] = [];
    await runExclusive(async () => {
      order.push("one");
    });
    await runExclusive(async () => {
      order.push("two");
    });
    expect(order).toEqual(["one", "two"]);
    expect(isSyncing()).toBe(false);
  });

  it("releases the lock after a failing run so the next run proceeds", async () => {
    await expect(
      runExclusive(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(isSyncing()).toBe(false);
    let ran = false;
    await runExclusive(async () => {
      ran = true;
    });
    expect(ran).toBe(true);
  });
});
