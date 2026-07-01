import "react-native-reanimated";
import React, { useEffect, useCallback, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { paperTheme } from "./src/theme";
import {
  notificationSetup,
  registerBackgroundHandler,
  getNavTargetFromMessage,
  getFirebaseMessaging,
} from "./src/utils/notifications";

SplashScreen.preventAutoHideAsync();

// Register background/killed handler BEFORE React renders
registerBackgroundHandler();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    notificationSetup();
  }, []);

  useEffect(() => {
    const firebaseMsg = getFirebaseMessaging();
    if (!firebaseMsg) return; // Expo Go — Firebase not available

    // App was opened by tapping a notification (killed → opened)
    firebaseMsg()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (!remoteMessage?.data) return;
        const target = getNavTargetFromMessage(
          remoteMessage.data as Record<string, string>,
        );
        if (target) {
          // Slight delay to let navigation mount
          setTimeout(() => {
            navigationRef.current?.navigate(target.screen, target.params);
          }, 500);
        }
      });

    // App was in background and brought to foreground by tapping notification
    const unsubscribeTap = firebaseMsg().onNotificationOpenedApp(
      (remoteMessage) => {
        if (!remoteMessage?.data) return;
        const target = getNavTargetFromMessage(
          remoteMessage.data as Record<string, string>,
        );
        if (target) {
          navigationRef.current?.navigate(target.screen, target.params);
        }
      },
    );

    // Foreground messages — show via expo-notifications
    const unsubscribeForeground = firebaseMsg().onMessage(async (remoteMessage) => {
      const { default: ExpoNotifications } = await import("expo-notifications");
      if (remoteMessage.notification) {
        await ExpoNotifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title ?? "Temple Finance",
            body: remoteMessage.notification.body ?? "",
            data: remoteMessage.data ?? {},
            sound: "default",
          },
          trigger: null,
        });
      }
    });

    return () => {
      unsubscribeTap();
      unsubscribeForeground();
    };
  }, []);

  const onReady = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={paperTheme}>
              <NavigationContainer ref={navigationRef} onReady={onReady}>
                <StatusBar style="auto" />
                <AppNavigator />
              </NavigationContainer>
            </PaperProvider>
          </QueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
