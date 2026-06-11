import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon } from "@/shared/ui/icon";
import { PressableScale } from "@/shared/ui/pressable-scale";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Sheet = ({
  visible,
  onClose,
  title,
  children,
  className,
}: SheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/60">
      <Pressable className="flex-1" onPress={onClose} />
      <View
        className={cn("max-h-[88%] rounded-t-[26px] bg-sheet pb-6", className)}
      >
        <View className="items-center pt-2.5">
          <View className="h-[5px] w-[42px] rounded-full bg-white/20" />
        </View>
        {title ? (
          <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
            <Text className="font-sans-bold text-xl tracking-tight text-text">
              {title}
            </Text>
            <PressableScale
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-card2"
            >
              <Icon name="x" size={18} color={COLORS.text} strokeWidth={2.2} />
            </PressableScale>
          </View>
        ) : null}
        {children}
      </View>
    </View>
  </Modal>
);
