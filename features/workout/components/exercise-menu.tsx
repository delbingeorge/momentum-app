import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { Icon, type IconName, PressableScale } from "@/shared/ui";

interface ExerciseMenuProps {
  visible: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canRemove: boolean;
  onSwap: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export const ExerciseMenu = ({
  visible,
  canMoveLeft,
  canMoveRight,
  canRemove,
  onSwap,
  onMove,
  onRemove,
  onDiscard,
  onClose,
}: ExerciseMenuProps) => {
  // two-tap guard on Discard
  const [discardArmed, setDiscardArmed] = useState(false);

  const close = () => {
    setDiscardArmed(false);
    onClose();
  };

  const items: {
    icon: IconName;
    label: string;
    enabled: boolean;
    onPress: () => void;
    danger?: boolean;
  }[] = [
    { icon: "replace", label: "Swap exercise", enabled: true, onPress: onSwap },
    {
      icon: "chevL",
      label: "Move left",
      enabled: canMoveLeft,
      onPress: () => onMove(-1),
    },
    {
      icon: "chevR",
      label: "Move right",
      enabled: canMoveRight,
      onPress: () => onMove(1),
    },
    {
      icon: "trash",
      label: "Remove exercise",
      enabled: canRemove,
      onPress: onRemove,
      danger: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable className="flex-1 bg-black/40" onPress={close}>
        <View className="absolute right-4 top-44 min-w-[200px] rounded-2xl border border-line bg-card2 p-1.5">
          {items.map((item) => (
            <PressableScale
              key={item.label}
              disabled={!item.enabled}
              onPress={() => {
                item.onPress();
                close();
              }}
              className="flex-row items-center gap-2.5 rounded-xl px-3 py-2.5"
            >
              <Icon
                name={item.icon}
                size={16}
                color={item.danger ? COLORS.drop : COLORS.mut}
              />
              <Text
                className={cn(
                  "font-sans-semibold text-sm",
                  item.danger ? "text-drop" : "text-text",
                )}
              >
                {item.label}
              </Text>
            </PressableScale>
          ))}
          <View className="mx-2 my-1 h-px bg-line" />
          <PressableScale
            onPress={() => {
              if (discardArmed) {
                close();
                onDiscard();
              } else {
                setDiscardArmed(true);
              }
            }}
            className={cn(
              "flex-row items-center gap-2.5 rounded-xl px-3 py-2.5",
              discardArmed && "bg-danger/10",
            )}
          >
            <Icon name="x" size={16} color={COLORS.danger} strokeWidth={2.4} />
            <Text className="font-sans-semibold text-sm text-danger">
              {discardArmed ? "Tap again to discard" : "Discard workout"}
            </Text>
          </PressableScale>
        </View>
      </Pressable>
    </Modal>
  );
};
