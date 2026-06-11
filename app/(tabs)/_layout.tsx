import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

import { COLORS } from "@/shared/lib/colors";
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.bg },
        tabBarStyle: {
          backgroundColor: "rgba(10,10,11,0.96)",
          borderTopColor: COLORS.line,
          borderTopWidth: 1,
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
