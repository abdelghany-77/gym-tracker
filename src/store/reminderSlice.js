import { loadFromStorage, saveToStorage, todayKey } from "./helpers";

const STORAGE_KEY = "gym_reminders";

const defaultState = () => ({
  waterIntervalMinutes: 60,
  remindersEnabled: true,
  notificationsGranted: false,
  soundEnabled: true,
  lastWaterReminderTime: null,
  lastVitaminReminderDate: null,
  lastResetDate: todayKey(),
});

const load = () => loadFromStorage(STORAGE_KEY, defaultState());

const persist = (state) => {
  const {
    waterIntervalMinutes,
    remindersEnabled,
    notificationsGranted,
    soundEnabled,
    lastWaterReminderTime,
    lastVitaminReminderDate,
    lastResetDate,
  } = state;
  saveToStorage(STORAGE_KEY, {
    waterIntervalMinutes,
    remindersEnabled,
    notificationsGranted,
    soundEnabled,
    lastWaterReminderTime,
    lastVitaminReminderDate,
    lastResetDate,
  });
};

// ── Reminder Slice (settings only — water/vitamin data lives in nutritionSlice) ──
export const createReminderSlice = (set) => {
  const saved = load();
  const merged = { ...defaultState(), ...saved };
  merged.waterIntervalMinutes = Number.isFinite(merged.waterIntervalMinutes)
    ? Math.min(180, Math.max(10, merged.waterIntervalMinutes))
    : 60;

  return {
    // ─── Reminder Settings State ───
    waterIntervalMinutes: merged.waterIntervalMinutes,
    remindersEnabled: merged.remindersEnabled,
    notificationsGranted: merged.notificationsGranted,
    soundEnabled: merged.soundEnabled,
    lastWaterReminderTime: merged.lastWaterReminderTime,
    lastVitaminReminderDate: merged.lastVitaminReminderDate,
    lastResetDate: merged.lastResetDate,

    // ─── Actions ───
    markVitaminReminderSent: () => {
      set((s) => {
        const next = { ...s, lastVitaminReminderDate: todayKey() };
        persist(next);
        return { lastVitaminReminderDate: next.lastVitaminReminderDate };
      });
    },
    setWaterInterval: (minutes) => {
      if (!Number.isFinite(minutes)) return;
      set((s) => {
        const next = {
          ...s,
          waterIntervalMinutes: Math.min(180, Math.max(10, minutes)),
        };
        persist(next);
        return { waterIntervalMinutes: next.waterIntervalMinutes };
      });
    },

    toggleReminders: () => {
      set((s) => {
        const next = { ...s, remindersEnabled: !s.remindersEnabled };
        persist(next);
        return { remindersEnabled: next.remindersEnabled };
      });
    },

    toggleSound: () => {
      set((s) => {
        const next = { ...s, soundEnabled: !s.soundEnabled };
        persist(next);
        return { soundEnabled: next.soundEnabled };
      });
    },

    setNotificationsGranted: (granted) => {
      set((s) => {
        const next = { ...s, notificationsGranted: granted };
        persist(next);
        return { notificationsGranted: next.notificationsGranted };
      });
    },

    updateLastWaterReminderTime: () => {
      set((s) => {
        const next = { ...s, lastWaterReminderTime: Date.now() };
        persist(next);
        return { lastWaterReminderTime: next.lastWaterReminderTime };
      });
    },
  };
};
