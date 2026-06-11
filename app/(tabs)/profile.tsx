import { ProfilePanel } from "@/features/profile";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function ProfileRoute() {
  return (
    <Screen edges={["top"]}>
      <ErrorBoundary>
        <ProfilePanel />
      </ErrorBoundary>
    </Screen>
  );
}
