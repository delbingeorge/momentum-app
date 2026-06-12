import { ProgressPanel } from "@/features/progress";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function ProgressRoute() {
  return (
    <Screen edges={["top"]} className="pt-2">
      <ErrorBoundary>
        <ProgressPanel />
      </ErrorBoundary>
    </Screen>
  );
}
