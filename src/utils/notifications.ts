/**
 * Notification utility — Firebase Cloud Messaging (FCM) integration.
 *
 * Firebase Messaging requires a CUSTOM DEV BUILD (npx expo run:android).
 * It is NOT available in Expo Go.
 *
 * This module degrades gracefully — if the native module is absent, all
 * Firebase calls become no-ops and the rest of the app continues to work.
 */

import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Safe Firebase Messaging loader ──────────────────────────────────────────
// A static top-level import crashes in Expo Go because the native module
// (RNFBAppModule) is not bundled there. This lazy getter caches the module
// on first successful load and returns null when it is unavailable.
let _mod:
  | (typeof import("@react-native-firebase/messaging"))["default"]
  | null
  | undefined = undefined;

export const getFirebaseMessaging = () => {
  if (_mod !== undefined) return _mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _mod = require("@react-native-firebase/messaging").default;
  } catch {
    _mod = null; // Expo Go or native module not linked
  }
  return _mod;
};

// ─── Foreground notification handler ─────────────────────────────────────────
// When the app is open, Firebase delivers silently. expo-notifications displays it.
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Android channel setup ────────────────────────────────────────────────────
export const notificationSetup = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await ExpoNotifications.setNotificationChannelAsync("temple_finance", {
      name: "Temple Finance",
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#5EBEA5",
      sound: "default",
    });
  }
};

// ─── Permission ───────────────────────────────────────────────────────────────
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const mod = getFirebaseMessaging();
  if (!mod) return false;
  const authStatus = await mod().requestPermission();
  return (
    authStatus === mod.AuthorizationStatus.AUTHORIZED ||
    authStatus === mod.AuthorizationStatus.PROVISIONAL
  );
};

// ─── FCM Token ────────────────────────────────────────────────────────────────
/**
 * Gets the Firebase FCM registration token.
 * This is the token the backend needs to send push notifications via Firebase Admin SDK.
 *
 * NOTE: Requires a real device/emulator with Google Play Services.
 *       Will not work in Expo Go — use npx expo run:android.
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const mod = getFirebaseMessaging();
    if (!mod) return null;
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
    const token = await mod().getToken();
    return token || null;
  } catch (error) {
    console.warn("[FCM] Failed to get token:", error);
    return null;
  }
};

// ─── Background / killed-app message handler ─────────────────────────────────
/**
 * Must be called OUTSIDE of any component — at the app root level (index.ts or App.tsx root).
 * Handles messages when the app is in the background or completely killed.
 */
export const registerBackgroundHandler = (): void => {
  const mod = getFirebaseMessaging();
  if (!mod) return; // Expo Go — no native module, skip registration
  mod().setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log("[FCM] Background message:", remoteMessage.messageId);
      // expo-notifications can show a local notification for the incoming FCM message
      if (remoteMessage.notification) {
        await ExpoNotifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title ?? "Temple Finance",
            body: remoteMessage.notification.body ?? "",
            data: remoteMessage.data ?? {},
            sound: "default",
          },
          trigger: null, // show immediately
        });
      }
    },
  );
};

// ─── Navigation target from notification data ─────────────────────────────────
export interface NotificationNavTarget {
  screen: string;
  params?: Record<string, string>;
}

export const getNavTargetFromMessage = (
  data?: Record<string, string>,
): NotificationNavTarget | null => {
  if (!data) return null;
  const screen = data.screen;
  if (!screen) return null;

  switch (screen) {
    case "LoanDetails":
      return data.loanId
        ? { screen: "LoanDetails", params: { loanId: data.loanId } }
        : null;
    case "ExpenseDetails":
      return data.expenseId
        ? { screen: "ExpenseDetails", params: { id: data.expenseId } }
        : null;
    default:
      return { screen };
  }
};
