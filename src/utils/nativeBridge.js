// ── Native Bridge: platform-aware Capacitor upgrades with web fallbacks ──
//
// Every helper detects the Capacitor native shell via the runtime bridge
// (window.Capacitor.isNativePlatform()) and, when present, upgrades the web
// API to the native plugin. On web/PWA builds every call degrades gracefully
// to the browser equivalent (or a no-op), so the same bundle serves both.
//
// Plugin access uses the injected runtime proxy (window.Capacitor.Plugins.X)
// rather than static imports — the installed plugin packages register
// themselves under those keys during `npx cap sync`.

/** True when running inside the Capacitor native shell. */
export const isNative = () =>
  typeof window !== "undefined" && !!window.Capacitor?.isNativePlatform?.();

const getPlugin = (name) => {
  if (!isNative()) return null;
  return window.Capacitor?.Plugins?.[name] || null;
};

/* ══════════════════ Status Bar ══════════════════ */

/** Dark status bar matching the app theme (native only). */
export const initStatusBar = async () => {
  const StatusBar = getPlugin("StatusBar");
  if (!StatusBar) return;
  try {
    await StatusBar.setStyle({ style: "DARK" });
    await StatusBar.setBackgroundColor({ color: "#0B0F17" });
  } catch {
    /* styling is cosmetic — non-fatal */
  }
};

/* ══════════════════ Notification channel ══════════════════ */

/** Single high-priority Android channel for all timer alerts. */
export const CHANNEL_ID = "gym-timer-channel";

/* ══════════════════ Rest Timer scheduling ══════════════════ */

// Fixed id so re-scheduling replaces the pending notification and cancel()
// can target it precisely.
export const REST_NOTIFICATION_ID = 7001;

/**
 * Schedule the "Rest complete" notification to fire at the exact deadline —
 * even if the OS puts the app in idle/doze (allowWhileIdle) — so the alert
 * survives a killed or backgrounded WebView. Web fallback: none needed (the
 * wall-clock timer + visibilitychange re-sync covers foreground; Web
 * Notifications fire through notificationService.showLocalNotification).
 */
export const scheduleRestNotification = async (endTimestampMs) => {
  const LocalNotifications = getPlugin("LocalNotifications");
  if (!LocalNotifications?.schedule) return false;
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
            exact: true,
          },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
};

/** Cancel the pending rest notification (skip / reset / pause / early stop). */
export const cancelRestNotification = async () => {
  const LocalNotifications = getPlugin("LocalNotifications");
  if (!LocalNotifications?.cancel) return;
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: REST_NOTIFICATION_ID }],
    });
  } catch {
    /* nothing pending — ignore */
  }
};

/* ══════════════════ Hydration scheduling ══════════════════ */

// Capacitor's local notifications have no "every N minutes" repeat unit, so we
// pre-schedule a batch of one-shot reminders spaced by the chosen interval.
// The batch is cancelled and re-scheduled whenever the interval changes or the
// workout ends.
const HYDRATION_BASE_ID = 8000;
const HYDRATION_BATCH = 12;

export const scheduleHydrationNotifications = async (
  intervalMinutes,
  startAt = Date.now(),
) => {
  const LocalNotifications = getPlugin("LocalNotifications");
  if (
    !LocalNotifications?.schedule ||
    !intervalMinutes ||
    intervalMinutes <= 0
  ) {
    return 0;
  }
  const intervalMs = intervalMinutes * 60_000;
  try {
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
  } catch {
    return 0;
  }
};

export const cancelHydrationNotifications = async () => {
  const LocalNotifications = getPlugin("LocalNotifications");
  if (!LocalNotifications?.cancel) return;
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

/* ══════════════════ Haptics ══════════════════ */
// (haptic feedback lives in utils/haptics.js — single seam, native-aware)

/* ══════════════════ Keep Awake ══════════════════ */

let webWakeLock = null;

/** Keep the screen on during an active workout (native: KeepAwake plugin;
 *  web: Screen Wake Lock API). */
export const keepAwake = async () => {
  const KeepAwake = getPlugin("KeepAwake");
  if (KeepAwake?.keepAwake) {
    try {
      await KeepAwake.keepAwake();
      return;
    } catch {
      /* fall through to web wake lock */
    }
  }
  try {
    webWakeLock = (await navigator.wakeLock?.request?.("screen")) || null;
  } catch {
    /* unsupported or denied */
  }
};

/** Release the wake lock (workout finished / paused / page closed). */
export const allowSleep = async () => {
  const KeepAwake = getPlugin("KeepAwake");
  if (KeepAwake?.allowSleep) {
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
