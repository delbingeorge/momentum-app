import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";

import { CtaButton } from "@/shared/ui/cta-button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

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
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-bg px-8">
          <Text className="font-sans-bold text-xl text-text">
            Something went wrong
          </Text>
          <Text className="text-center font-sans text-base text-mut">
            An unexpected error occurred. Try again.
          </Text>
          <CtaButton
            label="Retry"
            onPress={this.handleRetry}
            className="self-stretch"
          />
        </View>
      );
    }
    return this.props.children;
  }
}
