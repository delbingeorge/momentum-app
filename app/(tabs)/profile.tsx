import { AccountCard } from "@/features/auth";
import { ProfilePanel } from "@/features/profile";
import { SyncStatusRow } from "@/features/sync";
import { ErrorBoundary, Screen } from "@/shared/ui";

export default function ProfileRoute() {
  return (
    <Screen edges={["top"]}>
      <ErrorBoundary>
        <ProfilePanel
          accountSlot={
            <>
              <AccountCard />
              <SyncStatusRow />
            </>
          }
        />
      </ErrorBoundary>
    </Screen>
  );
}
