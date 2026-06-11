import { TodayPanel } from "@/features/home";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function TodayRoute() {
  return (
    <Screen edges={["top"]}>
      <ErrorBoundary>
        <TodayPanel />
      </ErrorBoundary>
    </Screen>
  );
}
