import { TodayPanel } from "@/features/home";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function TodayRoute() {
  return (
    <Screen edges={["top"]} className="pt-2">
      <ErrorBoundary>
        <TodayPanel />
      </ErrorBoundary>
    </Screen>
  );
}
