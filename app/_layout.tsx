import "../global.css";

import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { getCurrentUser } from "@/features/auth";
import {
  configurePurchases,
  logInPurchases,
  logOutPurchases,
} from "@/features/paywall";
import { useSyncEngine } from "@/features/sync";
import { scheduleReminder } from "@/features/profile";
import { queryClient } from "@/shared/lib/query-client";
import { COLORS } from "@/shared/lib/colors";
import { useAuthStore, useSettingsStore } from "@/shared/stores";
import { AppSheets } from "@/providers/sheets";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSyncEngine();
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // RevenueCat: configure + refresh entitlement (no-op without native module)
  useEffect(() => {
    void configurePurchases();
  }, []);

  // keep the RevenueCat customer bound to the signed-in user so purchases
  // follow the account; back to anonymous on sign-out (local isPaid persists)
  useEffect(() => {
    return useAuthStore.subscribe((state, prev) => {
      if (state.user && state.user !== prev.user) {
        void logInPurchases(state.user.id);
      } else if (!state.user && prev.user) {
        void logOutPurchases();
      }
    });
  }, []);

  // restore the Supabase session into the auth store on launch
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) useAuthStore.getState().setUser(user);
      })
      .catch(() => undefined);
  }, []);

  // re-arm the daily reminder silently on every launch (OS may drop schedules)
  useEffect(() => {
    const unsubscribe = useSettingsStore.persist.onFinishHydration((state) => {
      if (state.reminder.enabled) {
        void scheduleReminder(state.reminder.time, state.reminder.days, false);
      }
    });
    const { reminder } = useSettingsStore.getState();
    if (useSettingsStore.persist.hasHydrated() && reminder.enabled) {
      void scheduleReminder(reminder.time, reminder.days, false);
    }
    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppSheets />
        <SheetProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: COLORS.bg },
            }}
          >
            <Stack.Screen
              name="workout"
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="workout-done"
              options={{ gestureEnabled: false }}
            />
          </Stack>
        </SheetProvider>
      </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
