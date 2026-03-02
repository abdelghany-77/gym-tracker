import { loadFromStorage, saveToStorage, todayKey } from "./helpers";

const STORAGE_KEY = "gym_reminders";

const defaultState = () => ({
  waterIntervalMinutes: 60,
  remindersEnabled: true,
  notificationsGranted: false,
  soundEnabled: true,
  lastWaterReminderTime: null,
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
    lastResetDate,
  } = state;
  saveToStorage(STORAGE_KEY, {
    waterIntervalMinutes,
    remindersEnabled,
    notificationsGranted,
    soundEnabled,
    lastWaterReminderTime,
    lastResetDate,
  });
};

// ── Reminder Slice (settings only — water/vitamin data lives in nutritionSlice) ──
export const createReminderSlice = (set) => {
  const saved = load();
  const merged = { ...defaultState(), ...saved };

  return {
    // ─── Reminder Settings State ───
    waterIntervalMinutes: merged.waterIntervalMinutes,
    remindersEnabled: merged.remindersEnabled,
    notificationsGranted: merged.notificationsGranted,
    soundEnabled: merged.soundEnabled,
    lastWaterReminderTime: merged.lastWaterReminderTime,
    lastResetDate: merged.lastResetDate,

    // ─── Actions ───
    setWaterInterval: (minutes) => {
      set((s) => {
        const next = { ...s, waterIntervalMinutes: Math.max(10, minutes) };
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
