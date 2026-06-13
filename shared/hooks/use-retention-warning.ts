import { useMemo } from "react";

import { useIsPaid } from "@/shared/lib/entitlements";
import { daysUntilWipe, RETENTION_WARN_DAYS } from "@/shared/lib/retention";
import { useWorkoutStore } from "@/shared/stores";

interface RetentionWarning {
  show: boolean;
  daysLeft: number | null;
  count: number;
}

// Drives the free-tier "your workout history is about to be wiped" surfaces.
// Fires on the final day of the 8-week cycle. Paid users never see it.
export const useRetentionWarning = (): RetentionWarning => {
  const isPaid = useIsPaid();
  const sessions = useWorkoutStore((state) => state.pastSessions);

  return useMemo(() => {
    if (isPaid) return { show: false, daysLeft: null, count: 0 };
    const daysLeft = daysUntilWipe(sessions, Date.now());
    const show =
      daysLeft !== null && daysLeft <= RETENTION_WARN_DAYS && sessions.length > 0;
    return { show, daysLeft, count: sessions.length };
  }, [isPaid, sessions]);
};
