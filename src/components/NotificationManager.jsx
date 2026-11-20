import { useEffect, useState, useCallback } from "react";
import { todayKey } from "../store/helpers";
import { X, Droplets, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { playNotificationChime, primeAudio } from "../utils/audioUtil";
import {
  showLocalNotification,
  getNotificationPermission,
  syncBackgroundReminders,
} from "../utils/notificationService";

// ── In-app toast notification ──
function Toast({ id, message, icon: Icon, color, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 6000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="animate-slideDown w-full">
      <div className="bg-bg-surface/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-3.5 shadow-2xl shadow-black/40 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
        >
          {Icon && <Icon size={20} />}
        </div>
        <p role="status" className="flex-1 text-sm text-white font-medium">
          {message}
        </p>
        <button
          onClick={() => onClose(id)}
          aria-label="Dismiss reminder"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationManager() {
  const [toasts, setToasts] = useState([]);

  // Subscribe to reminder-relevant fields so background OS/SW schedules stay in sync
  const remindersEnabled = useWorkoutStore((s) => s.remindersEnabled);
  const notificationsGranted = useWorkoutStore((s) => s.notificationsGranted);
  const waterIntervalMinutes = useWorkoutStore((s) => s.waterIntervalMinutes);
  const waterCount = useWorkoutStore((s) => s.dailyChecklist?.water || 0);
  const vitaminDone = useWorkoutStore((s) => Boolean(s.dailyChecklist?.vitamin));
  const lastWaterReminderTime = useWorkoutStore((s) => s.lastWaterReminderTime);
  const lastVitaminReminderDate = useWorkoutStore(
    (s) => s.lastVitaminReminderDate,
  );
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule);
  const programs = useWorkoutStore((s) => s.programs);

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const pushBackgroundSync = useCallback(() => {
    const state = useWorkoutStore.getState();
    void syncBackgroundReminders({
      enabled: Boolean(state.remindersEnabled && state.notificationsGranted),
      waterIntervalMinutes: state.waterIntervalMinutes,
      waterCount: state.dailyChecklist?.water || 0,
      waterGoal: state.getWaterGoal(),
      vitaminDone: Boolean(state.dailyChecklist?.vitamin),
      lastWaterReminderTime: state.lastWaterReminderTime,
      lastVitaminReminderDate: state.lastVitaminReminderDate,
      today: todayKey(),
      weeklySchedule: state.weeklySchedule,
      programs: state.programs,
    });
  }, []);

  // Keep native Android OS alarms & PWA Service Worker schedule synchronized
  useEffect(() => {
    pushBackgroundSync();
  }, [
    pushBackgroundSync,
    remindersEnabled,
    notificationsGranted,
    waterIntervalMinutes,
    waterCount,
    vitaminDone,
    lastWaterReminderTime,
    lastVitaminReminderDate,
    weeklySchedule,
    programs,
  ]);

  // Show a notification (system push + sound + in-app toast)
  const showNotification = useCallback((title, body, icon, color, url) => {
    if (useWorkoutStore.getState().soundEnabled) {
      playNotificationChime();
    }

    void showLocalNotification({
      title,
      body,
      tag: title,
      url,
    });

    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message: body, icon, color }]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    primeAudio();

    const checkReminders = () => {
      useWorkoutStore.getState().ensureDailyChecklist();
      const state = useWorkoutStore.getState();

      void getNotificationPermission().then((permission) => {
        if (cancelled) return;
        const granted = permission === "granted";
        const latest = useWorkoutStore.getState();
        if (granted !== latest.notificationsGranted) {
          latest.setNotificationsGranted(granted);
        }
      });
      if (!state.remindersEnabled) return;

      const waterGoal = state.getWaterGoal();
      const currentWater = state.dailyChecklist?.water || 0;
      const elapsed = state.lastWaterReminderTime
        ? Date.now() - state.lastWaterReminderTime
        : Infinity;
      if (
        currentWater < waterGoal &&
        elapsed >= state.waterIntervalMinutes * 60_000
      ) {
        showNotification(
          "Water Reminder",
          `Time to drink water! You've had ${currentWater}/${waterGoal} cups today.`,
          Droplets,
          "bg-sky-500/15 text-sky-400",
          "#/nutrition",
        );
        state.updateLastWaterReminderTime();
      }

      const hour = new Date().getHours();
      if (
        !state.dailyChecklist?.vitamin &&
        state.lastVitaminReminderDate !== todayKey() &&
        hour >= 8 &&
        hour < 22
      ) {
        showNotification(
          "Vitamin Reminder",
          "Don't forget to take your multivitamins today!",
          Pill,
          "bg-violet-500/15 text-violet-400",
          "#/nutrition",
        );
        state.markVitaminReminderSent();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkReminders();
      } else {
        // Flush latest schedule to OS alarms / Service Worker right before app backgrounds
        pushBackgroundSync();
      }
    };

    const handlePageHide = () => {
      pushBackgroundSync();
    };

    useWorkoutStore.getState().ensureDailyChecklist();
    const initTimer = setTimeout(checkReminders, 5000);
    const interval = setInterval(checkReminders, 60_000);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkReminders);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkReminders);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [showNotification, pushBackgroundSync]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)] flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          message={t.message}
          icon={t.icon}
          color={t.color}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
