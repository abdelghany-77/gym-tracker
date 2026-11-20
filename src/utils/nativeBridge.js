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

/** Single high-priority Android channel for all timer and reminder alerts. */
export const CHANNEL_ID = "gym-timer-channel";

/** Ensure the Android notification channel exists (no-op on web/iOS).
 * Uses the default system notification sound so alerts are never muted by a missing raw asset. */
export const ensureNotificationChannel = async () => {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Workouts, Rest & Hydration",
      description: "Rest timers, daily hydration, vitamin, and workout reminders",
      importance: 5, // IMPORTANCE_HIGH -> heads-up + lock screen
      visibility: 1, // PUBLIC
      vibration: true,
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
          title: "Rest complete",
          body: "Time for your next set!",
          schedule: {
            at: new Date(endTimestampMs),
            allowWhileIdle: true,
          },
          extra: { url: "#/workout/active" },
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

/* ══════════════════ Active-Workout Hydration scheduling ══════════════════ */

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
        title: "Hydration check",
        body: "Time to drink some water during your workout.",
        schedule: {
          at: new Date(startAt + intervalMs * (i + 1)),
          allowWhileIdle: true,
        },
        extra: { url: "#/workout/active" },
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

/* ══════════════════ Daily Background Reminders (App Closed / Locked) ══════════════════ */

const DAILY_WATER_BASE_ID = 9000;
const DAILY_WATER_SLOTS = 32; // Covers ~48h of daytime hydration slots
const DAILY_VITAMIN_ID = 9100;
const WORKOUT_DAY_BASE_ID = 9200; // 9200..9206 for Mon..Sun
const TEST_NOTIFICATION_ID = 9901;

// Convert Mon=0..Sun=6 index to Capacitor weekday (1=Sunday..7=Saturday)
const toCapacitorWeekday = (monIndex) => ((monIndex + 1) % 7) + 1;

export const cancelDailyBackgroundReminders = async () => {
  if (!isNative()) return;
  const ids = [
    ...Array.from({ length: DAILY_WATER_SLOTS }, (_, i) => ({
      id: DAILY_WATER_BASE_ID + i,
    })),
    { id: DAILY_VITAMIN_ID },
    ...Array.from({ length: 7 }, (_, i) => ({ id: WORKOUT_DAY_BASE_ID + i })),
  ];
  try {
    await LocalNotifications.cancel({ notifications: ids });
  } catch {
    /* nothing pending — ignore */
  }
};

/**
 * Schedule OS-level Android/iOS local alarms for daily Water, Vitamin, and
 * scheduled Workout Days so reminders fire reliably even when the app is
 * swiped closed or the screen is locked.
 */
export const scheduleDailyBackgroundReminders = async ({
  enabled,
  waterIntervalMinutes = 60,
  waterCount = 0,
  waterGoal = 8,
  vitaminDone = false,
  weeklySchedule = {},
  programs = {},
}) => {
  if (!isNative()) return 0;

  await cancelDailyBackgroundReminders();
  if (!enabled) return 0;

  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return 0;
  } catch {
    return 0;
  }

  const notifications = [];
  const now = new Date();
  const stepMs = Math.max(10, Number(waterIntervalMinutes) || 60) * 60_000;

  // 1. Daytime Water reminders (08:00 - 22:00) across the next 48 hours
  const waterCompletedToday = waterCount >= waterGoal;
  let cursor = new Date(now.getTime() + stepMs);
  if (waterCompletedToday) {
    cursor = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      8,
      0,
      0,
      0,
    );
  }

  const horizonMs = now.getTime() + 48 * 60 * 60_000;
  let slot = 0;
  while (cursor.getTime() <= horizonMs && slot < DAILY_WATER_SLOTS) {
    const h = cursor.getHours();
    if (h < 8) {
      cursor.setHours(8, 0, 0, 0);
      continue;
    }
    if (h >= 22) {
      cursor = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate() + 1,
        8,
        0,
        0,
        0,
      );
      continue;
    }
    if (cursor.getTime() > now.getTime() + 15_000) {
      notifications.push({
        id: DAILY_WATER_BASE_ID + slot,
        channelId: CHANNEL_ID,
        title: "Water Reminder",
        body: `Stay hydrated — daily target: ${waterGoal} cups.`,
        schedule: {
          at: new Date(cursor.getTime()),
          allowWhileIdle: true,
        },
        extra: { url: "#/nutrition" },
      });
      slot++;
    }
    cursor = new Date(cursor.getTime() + stepMs);
  }

  // 2. Daily recurring Vitamin reminder at 09:00 AM
  // If already taken today and it's before 09:00, schedule for tomorrow; otherwise recurring daily at 09:00.
  if (vitaminDone && now.getHours() < 9) {
    const tomorrow9am = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      9,
      0,
      0,
      0,
    );
    notifications.push({
      id: DAILY_VITAMIN_ID,
      channelId: CHANNEL_ID,
      title: "Vitamin Reminder",
      body: "Don't forget to take your daily multivitamins!",
      schedule: {
        at: tomorrow9am,
        allowWhileIdle: true,
      },
      extra: { url: "#/nutrition" },
    });
  } else {
    notifications.push({
      id: DAILY_VITAMIN_ID,
      channelId: CHANNEL_ID,
      title: "Vitamin Reminder",
      body: "Don't forget to take your daily multivitamins!",
      schedule: {
        on: { hour: 9, minute: 0 },
        repeats: true,
        allowWhileIdle: true,
      },
      extra: { url: "#/nutrition" },
    });
  }

  // 3. Weekly scheduled Workout Day reminders at 5:00 PM
  if (weeklySchedule && typeof weeklySchedule === "object") {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const progId = weeklySchedule[dayIdx];
      if (!progId || progId === "rest") continue;
      const program = programs?.[progId];
      if (!program) continue;
      notifications.push({
        id: WORKOUT_DAY_BASE_ID + dayIdx,
        channelId: CHANNEL_ID,
        title: `Workout Day: ${program.name}`,
        body: `${program.muscles?.join(" · ") || "Time to train"} — ready when you are.`,
        schedule: {
          on: {
            weekday: toCapacitorWeekday(dayIdx),
            hour: 17,
            minute: 0,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        extra: { url: "#/workout" },
      });
    }
  }

  if (notifications.length === 0) return 0;

  try {
    await LocalNotifications.schedule({ notifications });
    return notifications.length;
  } catch (err) {
    console.warn("Schedule daily background reminders error:", err);
    return 0;
  }
};

/** Schedule a short delayed native notification so users can test background delivery. */
export const scheduleNativeDelayedNotification = async ({
  title,
  body,
  delayMs = 5000,
  id = TEST_NOTIFICATION_ID,
  url = "#/",
}) => {
  if (!isNative()) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          channelId: CHANNEL_ID,
          title,
          body,
          schedule: {
            at: new Date(Date.now() + Math.max(1000, delayMs)),
            allowWhileIdle: true,
          },
          extra: { url },
        },
      ],
    });
    return true;
  } catch (err) {
    console.warn("Schedule delayed notification error:", err);
    return false;
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
    } catch {
      /* native haptics unavailable; fall back to web vibration */
    }
  }
  try {
    navigator.vibrate?.(style === "HEAVY" ? 50 : style === "MEDIUM" ? 25 : 10);
  } catch {
    /* web vibration unsupported */
  }
};

export const triggerNotification = async (type = "SUCCESS") => {
  if (isNative()) {
    try {
      const mappedType =
        type === "WARNING" ? NotificationType.Warning : NotificationType.Success;
      await Haptics.notification({ type: mappedType });
      return;
    } catch {
      /* native notification haptics unavailable; fall back to web vibration */
    }
  }
  try {
    navigator.vibrate?.(
      type === "WARNING" ? [200, 100, 200] : [50, 30, 50],
    );
  } catch {
    /* web vibration unsupported */
  }
};
