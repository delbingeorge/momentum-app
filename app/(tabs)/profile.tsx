import { Text } from "react-native";

import { ErrorBoundary, Screen } from "@/shared/ui";

export default function ProfileRoute() {
  return (
    <Screen edges={["top"]} className="items-center justify-center">
      <ErrorBoundary>
        <Text className="font-sans-bold text-xl text-text">Profile</Text>
        <Text className="font-sans text-base text-mut">Coming in step 9</Text>
      </ErrorBoundary>
    </Screen>
  );
}
