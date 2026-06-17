import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/shared/lib/colors";
import { CtaButton } from "@/shared/ui/cta-button";
import { Icon } from "@/shared/ui/icon";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <SafeAreaView className="flex-1 bg-bg">
    <View className="flex-1 justify-center px-8">
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-card">
          <Icon name="bug" size={30} color={COLORS.danger} strokeWidth={2.2} />
        </View>
        <Text className="mt-6 font-sans-bold text-2xl tracking-tight text-text">
          Something went wrong
        </Text>
        <Text className="mt-2 text-center font-sans text-base leading-6 text-mut">
          Your data is safe. Try again.
        </Text>
      </View>
    </View>
    <View className="px-8 pb-8">
      <CtaButton label="Try again" onPress={onRetry} />
    </View>
  </SafeAreaView>
);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
