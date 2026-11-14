// ── Notification Service: Web-first with a Capacitor-ready native seam ──
//
// BROWSER MODE: uses the Web Notification API through the registered service
// worker (persistent + actionable) with a `new Notification()` fallback.
//
// NATIVE MODE (Phase 2 — Capacitor installed): the same call signature
// transparently routes to @capacitor/local-notifications, including:
//   • Android 13+ runtime `POST_NOTIFICATIONS` permission via checkPermissions()
//     / requestPermissions() before schedule()
//   • the shared high-priority Android notification channel ("gym-timer-channel",
//     created by nativeBridge.ensureNotificationChannel at app startup)
//   • scheduled future alerts (rest timer deadline, hydration batch) are handled
//     by nativeBridge; this module covers immediate notifications + permissions.
//
// All call sites (RestTimer, NotificationManager, hydration reminders) MUST go
// through this module or nativeBridge instead of using the Notification API
// directly.

import { CHANNEL_ID } from "./nativeBridge";

const NOTIFICATION_ICON = () => `${import.meta.env.BASE_URL}icon.png`;

/** True when running inside a Capacitor native shell. */
export const isNativePlatform = () =>
  typeof window !== "undefined" &&
  !!window.Capacitor?.isNativePlatform?.();

/**
 * Capacitor LocalNotifications plugin handle (native mode only).
 * Uses the runtime bridge proxy (window.Capacitor.Plugins) — the installed
 * @capacitor/local-notifications package registers itself under that key.
 */
const getCapacitorNotifications = () => {
  if (!isNativePlatform()) return null;
  return window.Capacitor?.Plugins?.LocalNotifications || null;
};

/** Ensure the Android notification channel exists (no-op on web/iOS). */
export const ensureNativeChannel = async () => {
  const LocalNotifications = getCapacitorNotifications();
  if (!LocalNotifications?.createChannel) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Rest & Hydration Timer",
      importance: 5, // IMPORTANCE_HIGH → heads-up + lock screen
      visibility: 1, // PUBLIC
      vibration: true,
      sound: "notify.wav",
    });
  } catch {
    /* channel may already exist */
  }
};

/**
 * Request notification permission across platforms.
 * Returns "granted" | "denied" | "default".
 */
export const requestNotificationPermission = async () => {
  const LocalNotifications = getCapacitorNotifications();
  if (LocalNotifications) {
    try {
      const current = await LocalNotifications.checkPermissions();
      if (current.display !== "granted") {
        const requested = await LocalNotifications.requestPermissions();
        return requested.display === "granted" ? "granted" : "denied";
      }
      return "granted";
    } catch (error) {
      // Surface the failure (callers distinguish "denied" from "failed").
      throw error;
    }
  }
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications unsupported in this environment.");
  }
  const result = await Notification.requestPermission();
  return result;
};

/** Current permission state ("granted" | "denied" | "default"). */
export const getNotificationPermission = async () => {
  const LocalNotifications = getCapacitorNotifications();
  if (LocalNotifications) {
    try {
      const current = await LocalNotifications.checkPermissions();
      return current.display === "granted" ? "granted" : current.display;
    } catch {
      return "default";
    }
  }
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
};

/**
 * Show a local notification right now.
 * @param {{ title: string, body: string, tag?: string, id?: number, vibrate?: number[] }} options
 */
export const showLocalNotification = async ({
  title,
  body,
  tag = "gym-alert",
  id = Math.floor(Math.random() * 2_000_000_000),
  vibrate = [200, 100, 200],
}) => {
  const LocalNotifications = getCapacitorNotifications();
  if (LocalNotifications) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId: CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 1) },
            extra: { tag },
          },
        ],
      });
      return;
    } catch {
      /* fall through to web implementation */
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    // Prefer the service-worker registration so notifications persist while
    // the (PWA/WebView) page is backgrounded.
    const registration = await navigator.serviceWorker?.getRegistration?.();
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body,
        icon: NOTIFICATION_ICON(),
        badge: NOTIFICATION_ICON(),
        tag,
        renotify: true,
        vibrate,
      });
    } else {
      new Notification(title, { body, icon: NOTIFICATION_ICON(), tag });
    }
  } catch {
    // Non-fatal: in-app toast + vibration already fire at the call sites.
  }
};
