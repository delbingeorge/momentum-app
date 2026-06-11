import { useEffect, useState } from "react";

import { haptics } from "@/shared/lib/haptics";

import {
  clearRestNotification,
  startRestNotification,
} from "../lib/rest-notification";

interface RestState {
  total: number;
  endAt: number;
}

interface RestTimer {
  active: boolean;
  total: number;
  left: number;
  start: (totalSec: number) => void;
  addSeconds: (sec: number) => void;
  skip: () => void;
}

// Absolute end-time based countdown so backgrounding can't desync it; the
// native rest-over notification fires even if the app is killed.
export const useRestTimer = (): RestTimer => {
  const [rest, setRest] = useState<RestState | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!rest) return;
    const id = setInterval(() => {
      if (Date.now() >= rest.endAt) {
        // natural expiry only; skip() clears without buzzing. Backgrounded
        // case is covered by the scheduled rest-over notification.
        haptics.timerDone();
        setRest(null);
      } else setTick((t) => t + 1);
    }, 250);
    return () => clearInterval(id);
  }, [rest]);

  useEffect(() => () => void clearRestNotification(), []);

  return {
    active: rest !== null,
    total: rest?.total ?? 0,
    left: rest ? Math.max(0, Math.ceil((rest.endAt - Date.now()) / 1000)) : 0,
    start: (totalSec) => {
      setRest({ total: totalSec, endAt: Date.now() + totalSec * 1000 });
      void startRestNotification(totalSec);
    },
    addSeconds: (sec) =>
      setRest((prev) => {
        if (!prev) return prev;
        const endAt = prev.endAt + sec * 1000;
        void startRestNotification(Math.ceil((endAt - Date.now()) / 1000));
        return { total: prev.total + sec, endAt };
      }),
    skip: () => {
      setRest(null);
      void clearRestNotification();
    },
  };
};
