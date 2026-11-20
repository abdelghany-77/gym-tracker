/* global clients, TimestampTrigger */
// ── Background Notification Extension for GymTracker Service Worker ──
// Loaded by Workbox via importScripts. Handles:
//   1. Persisting reminder schedules so background periodicSync wakes can fire
//      Water & Vitamin reminders even after all app tabs are closed.
//   2. Scheduling delayed notifications (Rest Timer / Test alert) using
//      TimestampTrigger when supported or an in-SW timer fallback.
//   3. Opening or focusing the exact app route when a user taps a notification.

const REMINDER_CACHE = "gym-reminder-state-v1";
const REMINDER_URL = "/__gym_reminder_state__.json";
const activeTimers = new Map();

async function saveReminderState(state) {
  try {
    const cache = await caches.open(REMINDER_CACHE);
    await cache.put(
      REMINDER_URL,
      new Response(JSON.stringify(state), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch {
    // CacheStorage may be restricted in private browsing
  }
}

async function readReminderState() {
  try {
    const cache = await caches.open(REMINDER_CACHE);
    const res = await cache.match(REMINDER_URL);
    if (!res) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function localTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function displaySwNotification({
  title,
  body,
  tag = "gym-alert",
  url = "#/",
  vibrate = [200, 100, 200],
  timestamp = null,
}) {
  const options = {
    body,
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    tag,
    renotify: true,
    vibrate,
    data: { url },
  };

  if (timestamp && typeof TimestampTrigger !== "undefined") {
    options.showTrigger = new TimestampTrigger(timestamp);
  }

  await self.registration.showNotification(title, options);
}

self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "SYNC_REMINDERS" && msg.payload) {
    event.waitUntil(saveReminderState(msg.payload));
    return;
  }

  if (msg.type === "SCHEDULE_DELAYED_NOTIFICATION" && msg.payload) {
    const { title, body, delayMs, tag = "gym-delayed", url = "#/" } = msg.payload;
    const ms = Math.max(0, Number(delayMs) || 0);

    // Clear any existing SW timer for this tag
    if (activeTimers.has(tag)) {
      clearTimeout(activeTimers.get(tag));
      activeTimers.delete(tag);
    }

    // Prefer native Notification Triggers API (fires even if SW sleeps/closes)
    if (typeof TimestampTrigger !== "undefined" && ms >= 1000) {
      event.waitUntil(
        displaySwNotification({
          title,
          body,
          tag,
          url,
          timestamp: Date.now() + ms,
        }).catch(() => {}),
      );
      return;
    }

    // Fallback: keep SW alive with waitUntil for short delays (<= 5 min)
    if (ms <= 5 * 60 * 1000) {
      event.waitUntil(
        new Promise((resolve) => {
          const timerId = setTimeout(async () => {
            activeTimers.delete(tag);
            try {
              await displaySwNotification({ title, body, tag, url });
            } catch {
              // ignore
            }
            resolve();
          }, ms);
          activeTimers.set(tag, timerId);
        }),
      );
    }
    return;
  }

  if (msg.type === "CANCEL_DELAYED_NOTIFICATION" && msg.tag) {
    const tag = msg.tag;
    if (activeTimers.has(tag)) {
      clearTimeout(activeTimers.get(tag));
      activeTimers.delete(tag);
    }
    event.waitUntil(
      self.registration
        .getNotifications({ tag, includeTriggered: true })
        .then((list) => list.forEach((n) => n.close()))
        .catch(() => {}),
    );
  }
});

// Background periodic sync wake (Chrome / Android installed PWA when app is closed)
self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "gym-reminders-sync") return;
  event.waitUntil(
    (async () => {
      const state = await readReminderState();
      if (!state || !state.remindersEnabled) return;

      const now = Date.now();
      const hour = new Date(now).getHours();
      const today = localTodayKey();
      let dirty = false;

      // Daytime Water reminder (08:00 - 22:00)
      if (hour >= 8 && hour < 22) {
        const waterGoal = Number(state.waterGoal) || 8;
        const waterCount =
          state.today === today ? Number(state.waterCount) || 0 : 0;
        const intervalMs = (Number(state.waterIntervalMinutes) || 60) * 60_000;
        const lastSent = Number(state.lastWaterReminderTime) || 0;

        if (waterCount < waterGoal && now - lastSent >= intervalMs) {
          await displaySwNotification({
            title: "Water Reminder",
            body: `Time to drink water! You've had ${waterCount}/${waterGoal} cups today.`,
            tag: "gym-water-reminder",
            url: "#/nutrition",
          });
          state.lastWaterReminderTime = now;
          dirty = true;
        }
      }

      // Daily Vitamin reminder (08:00 - 21:00)
      if (hour >= 8 && hour < 21) {
        const vitaminDone = state.today === today ? Boolean(state.vitaminDone) : false;
        if (!vitaminDone && state.lastVitaminReminderDate !== today) {
          await displaySwNotification({
            title: "Vitamin Reminder",
            body: "Don't forget to take your daily multivitamins!",
            tag: "gym-vitamin-reminder",
            url: "#/nutrition",
          });
          state.lastVitaminReminderDate = today;
          dirty = true;
        }
      }

      if (dirty) {
        state.today = today;
        await saveReminderState(state);
      }
    })(),
  );
});

// Clicking any notification opens or focuses the app at the relevant route
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetHash = event.notification?.data?.url || "#/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(`./${targetHash}`);
        }
        return undefined;
      }),
  );
});
