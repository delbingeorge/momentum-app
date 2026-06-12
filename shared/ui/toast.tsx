import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/shared/lib/colors";
import { haptics } from "@/shared/lib/haptics";
import { useToastStore, type ToastVariant } from "@/shared/stores/toast-store";
import { Icon, type IconName } from "@/shared/ui/icon";

const VARIANTS: Record<ToastVariant, { icon: IconName; color: string }> = {
  success: { icon: "check", color: COLORS.green },
  error: { icon: "x", color: COLORS.danger },
  info: { icon: "zap", color: COLORS.lime },
};

export const ToastHost = () => {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    if (toast.variant === "success") haptics.success();
    if (toast.variant === "error") haptics.warning();
  }, [toast]);

  if (!toast) return null;

  const { icon, color } = VARIANTS[toast.variant];

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 top-0 items-center px-5"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Animated.View
        key={toast.id}
        entering={FadeInUp.springify().damping(18).stiffness(220)}
        exiting={FadeOutUp.duration(160)}
      >
        <Pressable
          onPress={dismiss}
          className="max-w-full flex-row items-center gap-2.5 rounded-full border border-line2 bg-card2 py-3 pl-4 pr-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <Icon name={icon} size={18} strokeWidth={2.4} color={color} />
          <Text
            numberOfLines={2}
            className="shrink font-sans-semibold text-[15px] text-text"
          >
            {toast.message}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};
