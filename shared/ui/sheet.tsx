import type { ReactNode } from "react";
import { Text, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";

import { COLORS } from "@/shared/lib/colors";
import { Icon } from "@/shared/ui/icon";
import { PressableScale } from "@/shared/ui/pressable-scale";

export { ScrollView as SheetScrollView } from "react-native-actions-sheet";

interface BaseSheetProps {
  sheetId: string;
  title?: string;
  fullHeight?: boolean;
  children: ReactNode;
}

// Styled shell every registered *.sheet.tsx renders as its root
export const BaseSheet = ({
  sheetId,
  title,
  fullHeight = false,
  children,
}: BaseSheetProps) => (
  <ActionSheet
    id={sheetId}
    gestureEnabled
    containerStyle={{
      backgroundColor: COLORS.sheet,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingBottom: 24,
      ...(fullHeight ? { height: "88%" } : null),
    }}
    indicatorStyle={{
      backgroundColor: "rgba(255,255,255,0.2)",
      width: 42,
      marginTop: 10,
    }}
  >
    <View className={fullHeight ? "h-full" : undefined}>
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
