// ── Notification Service: Unified Native (Capacitor) + PWA Service Worker layer ──
//
// NATIVE MODE (Android / iOS Capacitor shell):
//   • Uses @capacitor/local-notifications with allowWhileIdle OS alarms so
//     Rest Timers, Hydration, Daily Water, Vitamin, and Workout Day reminders
//     fire reliably even when the app is completely closed or screen locked.
//
// WEB / PWA MODE:
//   • Routes notifications through the Service Worker (sw-notifications.js),
//     syncs reminder state into CacheStorage, registers Periodic Background Sync
//     when installed as a PWA, and uses Notification Triggers / SW timers for
//     delayed background delivery.

import {
  CHANNEL_ID,
  scheduleDailyBackgroundReminders,
  cancelDailyBackgroundReminders,
  scheduleNativeDelayedNotification,
} from "./nativeBridge";

const NOTIFICATION_ICON = () => `${import.meta.env.BASE_URL}icons/icon-192.png`;

/** True when running inside a Capacitor native shell. */
export const isNativePlatform = () =>
  typeof window !== "undefined" && !!window.Capacitor?.isNativePlatform?.();

/** True when running as an installed standalone PWA. */
export const isStandalonePWA = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true);

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
      name: "Workouts, Rest & Hydration",
      description: "Rest timers, daily hydration, vitamin, and workout reminders",
      importance: 5,
      visibility: 1,
      vibration: true,
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
    const current = await LocalNotifications.checkPermissions();
    if (current.display !== "granted") {
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === "granted" ? "granted" : "denied";
    }
    return "granted";
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

/** Describe the current device's background notification delivery capability. */
export const getBackgroundCapability = () => {
  if (isNativePlatform()) {
    return {
      mode: "native",
      label: "Native OS Alarms (works when app is closed)",
    };
  }
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    if (isStandalonePWA()) {
      return {
        mode: "pwa",
        label: "Installed PWA Service Worker (background sync active)",
      };
    }
    return {
      mode: "web-sw",
      label: "Browser Service Worker (install app for best background delivery)",
    };
  }
  return {
    mode: "tab-only",
    label: "Foreground browser tab only",
  };
};

async function getActiveServiceWorkerRegistration() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg =
      (await navigator.serviceWorker.getRegistration?.()) ||
      (await navigator.serviceWorker.ready);
    return reg || null;
  } catch {
    return null;
  }
}

async function postToServiceWorker(message) {
  const reg = await getActiveServiceWorkerRegistration();
  const target = reg?.active || navigator.serviceWorker?.controller;
  if (target?.postMessage) {
    target.postMessage(message);
    return true;
  }
  return false;
}

/**
 * Sync daily reminders (Water, Vitamin, Workout Days) to the OS alarm manager
 * (on Android/iOS native) AND to the PWA Service Worker + PeriodicSync (on web).
 */
export const syncBackgroundReminders = async (payload) => {
  if (isNativePlatform()) {
    if (!payload?.enabled) {
      await cancelDailyBackgroundReminders();
      return 0;
    }
    return scheduleDailyBackgroundReminders(payload);
  }

  // Web / PWA: persist reminder state inside the Service Worker cache
  await postToServiceWorker({
    type: "SYNC_REMINDERS",
    payload: {
      remindersEnabled: Boolean(payload?.enabled),
      waterIntervalMinutes: payload?.waterIntervalMinutes || 60,
      waterCount: payload?.waterCount || 0,
      waterGoal: payload?.waterGoal || 8,
      vitaminDone: Boolean(payload?.vitaminDone),
      lastWaterReminderTime: payload?.lastWaterReminderTime || 0,
      lastVitaminReminderDate: payload?.lastVitaminReminderDate || null,
      today: payload?.today || "",
    },
  });

  // Register Periodic Background Sync on supported Chromium/Android PWAs
  try {
    const reg = await getActiveServiceWorkerRegistration();
    if (reg?.periodicSync) {
      if (payload?.enabled) {
        const minInterval = Math.max(
          30 * 60_000,
          (Number(payload?.waterIntervalMinutes) || 60) * 60_000,
        );
        await reg.periodicSync.register("gym-reminders-sync", {
          minInterval,
        });
      } else {
        await reg.periodicSync.unregister("gym-reminders-sync");
      }
    }
  } catch {
    // Periodic sync requires installed PWA + engagement score on Chromium; fail silently
  }

  return 1;
};

/**
 * Schedule a delayed notification (used for Rest Timer on Web/PWA and the 5s
 * background test alert on both Native and Web/PWA).
 */
export const scheduleDelayedNotification = async ({
  title,
  body,
  delayMs = 5000,
  tag = "gym-delayed",
  url = "#/",
  nativeId,
}) => {
  if (isNativePlatform()) {
    return scheduleNativeDelayedNotification({
      title,
      body,
      delayMs,
      id: nativeId,
      url,
    });
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission !== "granted") return false;

  const posted = await postToServiceWorker({
    type: "SCHEDULE_DELAYED_NOTIFICATION",
    payload: { title, body, delayMs, tag, url },
  });
  if (posted) return true;

  // Fallback timer if SW isn't active yet
  setTimeout(() => {
    void showLocalNotification({ title, body, tag, url });
  }, Math.max(0, delayMs));
  return true;
};

/** Cancel a pending delayed notification by tag on Web/PWA. */
export const cancelDelayedNotification = async (tag) => {
  if (isNativePlatform() || !tag) return;
  await postToServiceWorker({
    type: "CANCEL_DELAYED_NOTIFICATION",
    tag,
  });
};

/**
 * Show a local notification right now.
 * @param {{ title: string, body: string, tag?: string, id?: number, vibrate?: number[], url?: string }} options
 */
export const showLocalNotification = async ({
  title,
  body,
  tag = "gym-alert",
  id = Math.floor(Math.random() * 2_000_000_000),
  vibrate = [200, 100, 200],
  url = "#/",
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
            schedule: { at: new Date(Date.now() + 250), allowWhileIdle: true },
            extra: { tag, url },
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
    const registration = await getActiveServiceWorkerRegistration();
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body,
        icon: NOTIFICATION_ICON(),
        badge: NOTIFICATION_ICON(),
        tag,
        renotify: true,
        vibrate,
        data: { url },
      });
    } else {
      new Notification(title, { body, icon: NOTIFICATION_ICON(), tag });
    }
  } catch {
    // Non-fatal: in-app toast + vibration already fire at the call sites.
  }
};
