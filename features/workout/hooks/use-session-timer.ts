import { useEffect, useState } from "react";

// Elapsed seconds derived from the persisted start timestamp, so the timer
// survives minimize and app restarts.
export const useSessionTimer = (startedAt: number | null): number => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (startedAt === null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
};
