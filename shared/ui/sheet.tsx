import type { ReactNode } from "react";
import { type DimensionValue, Text, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { Icon } from "@/shared/ui/icon";
import { PressableScale } from "@/shared/ui/pressable-scale";

export { ScrollView as SheetScrollView } from "react-native-actions-sheet";

interface BaseSheetProps {
  sheetId: string;
  title?: string;
  height?: DimensionValue;
  fullHeight?: boolean;
  children: ReactNode;
}

// Styled shell every registered *.sheet.tsx renders as its root
export const BaseSheet = ({
  sheetId,
  title,
  height,
  fullHeight = false,
  children,
}: BaseSheetProps) => {
  const fixedHeight = height ?? (fullHeight ? "88%" : undefined);
  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled
      containerStyle={{
        backgroundColor: COLORS.sheet,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingBottom: 24,
        ...(fixedHeight !== undefined ? { height: fixedHeight } : null),
      }}
      indicatorStyle={{
        backgroundColor: "rgba(255,255,255,0.2)",
        width: 42,
        marginTop: 10,
      }}
    >
      <View className={fixedHeight !== undefined ? "h-full" : undefined}>
        {title ? (
          <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
            <Text className="flex-1 font-sans-bold text-xl tracking-tight text-text">
              {title}
            </Text>
            <PressableScale
              onPress={() => SheetManager.hide(sheetId)}
              className="h-9 w-9 items-center justify-center rounded-full bg-card2"
            >
              <Icon name="x" size={18} color={COLORS.text} strokeWidth={2.2} />
            </PressableScale>
          </View>
        ) : null}
        {children}
      </View>
    </ActionSheet>
  );
};
