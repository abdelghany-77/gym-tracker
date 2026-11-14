// ── Native Bridge: platform-aware Capacitor upgrades with web fallbacks ──
//
// Automatically detects the Capacitor native shell via Capacitor.isNativePlatform()
// and upgrades to native hardware plugins (StatusBar, LocalNotifications, KeepAwake, Haptics).
// On web/PWA builds, every call degrades gracefully to browser equivalents or no-ops.

import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { LocalNotifications } from "@capacitor/local-notifications";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** True when running inside the Capacitor native shell. */
export const isNative = () => Capacitor.isNativePlatform();

/* ══════════════════ Status Bar ══════════════════ */

/** Dark status bar matching the app theme (native only). */
export const initStatusBar = async () => {
  if (!isNative()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0B0F17" });
  } catch (err) {
    console.warn("StatusBar setup warning:", err);
  }
};

/* ══════════════════ Notification channel ══════════════════ */

/** Single high-priority Android channel for all timer alerts. */
export const CHANNEL_ID = "gym-timer-channel";

/** Ensure the Android notification channel exists (no-op on web/iOS). */
export const ensureNotificationChannel = async () => {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Rest & Hydration Timer",
      importance: 5, // IMPORTANCE_HIGH → heads-up + lock screen
      visibility: 1, // PUBLIC
      vibration: true,
      sound: "notify.wav",
    });
  } catch (err) {
    console.warn("Notification channel check:", err);
  }
};

/** Request native notification permission on launch / workout start. */
export const requestNativeNotificationPermission = async () => {
  if (!isNative()) return false;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch {
    return false;
  }
};

/* ══════════════════ Rest Timer scheduling ══════════════════ */

// Fixed id so re-scheduling replaces the pending notification and cancel()
// can target it precisely.
export const REST_NOTIFICATION_ID = 7001;

/**
 * Schedule the "Rest complete" notification to fire at the exact deadline —
 * even if the OS puts the app in idle/doze (allowWhileIdle) — so the alert
 * survives a killed or backgrounded WebView.
 */
export const scheduleRestNotification = async (endTimestampMs) => {
  if (!isNative()) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_NOTIFICATION_ID,
          channelId: CHANNEL_ID,
          title: "Rest complete 💪",
          body: "Time for your next set!",
          schedule: {
            at: new Date(endTimestampMs),
            allowWhileIdle: true,
          },
        },
      ],
    });
    return true;
  } catch (err) {
    console.warn("Schedule rest notification error:", err);
    return false;
  }
};

/** Cancel the pending rest notification (skip / reset / pause / early stop). */
export const cancelRestNotification = async () => {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: REST_NOTIFICATION_ID }],
    });
  } catch {
    /* nothing pending — ignore */
  }
};

/* ══════════════════ Hydration scheduling ══════════════════ */

const HYDRATION_BASE_ID = 8000;
const HYDRATION_BATCH = 12;

export const scheduleHydrationNotifications = async (
  intervalMinutes,
  startAt = Date.now(),
) => {
  if (!isNative() || !intervalMinutes || intervalMinutes <= 0) {
    return 0;
  }
  const intervalMs = intervalMinutes * 60_000;
  try {
    await cancelHydrationNotifications();
    await LocalNotifications.schedule({
      notifications: Array.from({ length: HYDRATION_BATCH }, (_, i) => ({
        id: HYDRATION_BASE_ID + i,
        channelId: CHANNEL_ID,
        title: "Hydration check 💧",
        body: "Time to drink some water.",
        schedule: {
          at: new Date(startAt + intervalMs * (i + 1)),
          allowWhileIdle: true,
        },
      })),
    });
    return HYDRATION_BATCH;
  } catch (err) {
    console.warn("Schedule hydration notification error:", err);
    return 0;
  }
};

export const cancelHydrationNotifications = async () => {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({
      notifications: Array.from({ length: HYDRATION_BATCH }, (_, i) => ({
        id: HYDRATION_BASE_ID + i,
      })),
    });
  } catch {
    /* nothing pending — ignore */
  }
};

/* ══════════════════ Keep Awake ══════════════════ */

let webWakeLock = null;

/** Keep the screen on during an active workout (native: KeepAwake plugin;
 *  web: Screen Wake Lock API). */
export const keepAwake = async () => {
  if (isNative()) {
    try {
      await KeepAwake.keepAwake();
      return;
    } catch {
      /* fall through to web wake lock */
    }
  }
  try {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      webWakeLock = (await navigator.wakeLock?.request?.("screen")) || null;
    }
  } catch {
    /* unsupported or denied */
  }
};

/** Release the wake lock (workout finished / paused / page closed). */
export const allowSleep = async () => {
  if (isNative()) {
    try {
      await KeepAwake.allowSleep();
    } catch {
      /* ignore */
    }
  }
  try {
    webWakeLock?.release?.();
  } catch {
    /* already released */
  }
  webWakeLock = null;
};

/* ══════════════════ Haptics Helper ══════════════════ */

export const triggerImpact = async (style = "LIGHT") => {
  if (isNative()) {
    try {
      const mappedStyle =
        style === "HEAVY"
          ? ImpactStyle.Heavy
          : style === "MEDIUM"
            ? ImpactStyle.Medium
            : ImpactStyle.Light;
      await Haptics.impact({ style: mappedStyle });
      return;
    } catch {}
  }
  try {
    navigator.vibrate?.(style === "HEAVY" ? 50 : style === "MEDIUM" ? 25 : 10);
  } catch {}
};

export const triggerNotification = async (type = "SUCCESS") => {
  if (isNative()) {
    try {
      const mappedType =
        type === "WARNING" ? NotificationType.Warning : NotificationType.Success;
      await Haptics.notification({ type: mappedType });
      return;
    } catch {}
  }
  try {
    navigator.vibrate?.(
      type === "WARNING" ? [200, 100, 200] : [50, 30, 50],
    );
  } catch {}
};
