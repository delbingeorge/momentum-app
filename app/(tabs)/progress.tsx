import { ProgressPanel } from "@/features/progress";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function ProgressRoute() {
  return (
    <Screen edges={["top"]}>
      <ErrorBoundary>
        <ProgressPanel />
      </ErrorBoundary>
    </Screen>
  );
}
