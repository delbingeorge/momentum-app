// Single in-flight guard shared by every cloud write path (full sync, debounced
// push, foreground retry, cloud wipe). Without it a debounced push could run
// while a full sync is mid-pull and interleave writes to the same stores.

let inFlight: Promise<void> | null = null;

// Run fn with mutual exclusion: while one task is in flight, callers await the
// same promise instead of starting a concurrent run. Errors propagate to the
// caller that owns the run; coalesced callers just wait for it to settle.
export const runExclusive = async (fn: () => Promise<void>): Promise<void> => {
  if (inFlight) {
    await inFlight.catch(() => undefined);
    return;
  }
  const run = fn();
  inFlight = run.then(
    () => undefined,
    () => undefined,
  );
  try {
    await run;
  } finally {
    inFlight = null;
  }
};

// True when a cloud write is currently running; lets callers skip redundant work.
export const isSyncing = (): boolean => inFlight !== null;
