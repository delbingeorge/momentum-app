import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/shared/lib/colors";
import { haptics } from "@/shared/lib/haptics";
import { Icon, type IconName } from "@/shared/ui";

const tabIcon =
  (name: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon
      name={name}
      size={23}
      color={String(color)}
      strokeWidth={focused ? 2.3 : 2}
    />
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Edge-to-edge on Android can report a 0 inset (3-button nav hidden /
  // older devices), leaving the bar flush against the screen edge.
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 12 : 0,
  );

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptics.select() }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.bg },
        tabBarStyle: {
          backgroundColor: "rgba(10,10,11,0.96)",
          borderTopColor: COLORS.line,
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarActiveTintColor: COLORS.lime,
        tabBarInactiveTintColor: COLORS.mut,
        tabBarLabelStyle: {
          fontFamily: "HankenGrotesk_600SemiBold",
          fontSize: 10.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarIcon: tabIcon("medal") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: tabIcon("user") }}
      />
    </Tabs>
  );
}
