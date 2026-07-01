import { ExploreScreen } from "@/features/explore";
import { ErrorBoundary } from "@/shared/ui";

export default function ExploreRoute() {
  return (
    <ErrorBoundary>
      <ExploreScreen />
    </ErrorBoundary>
  );
}
