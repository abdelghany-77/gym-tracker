import { useEffect, useState, useCallback } from "react";
import { todayKey } from "../store/helpers";
import { X, Droplets, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { playNotificationChime, primeAudio } from "../utils/audioUtil";
import {
  showLocalNotification,
  getNotificationPermission,
} from "../utils/notificationService";

// ── In-app toast notification ──
function Toast({ id, message, icon: Icon, color, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 6000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="animate-slideDown w-full">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          {Icon && <Icon size={20} />}
        </div>
        <p role="status" className="flex-1 text-sm text-white font-medium">
          {message}
        </p>
        <button
          onClick={() => onClose(id)}
          aria-label="Dismiss reminder"
          className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationManager() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  // Show a notification (browser push + sound + in-app toast)
  const showNotification = useCallback((title, body, icon, color) => {
    // Play sound if enabled (shared unlocked AudioContext)
    if (useWorkoutStore.getState().soundEnabled) {
      playNotificationChime();
    }

    // Browser/native notification (works when tab is backgrounded / PWA installed / native shell)
    void showLocalNotification({
      title,
      body,
      tag: title, // prevents duplicate stacking
    });

    // Always show in-app toast
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message: body, icon, color }]);
  }, []);

  useEffect(() => {
    // Unlock the shared AudioContext early (first user gesture resumes it).
    primeAudio();
    const checkReminders = () => {
      // Also roll over tracking when reminders are disabled or the tab resumes.
      useWorkoutStore.getState().ensureDailyChecklist();
      const state = useWorkoutStore.getState();
      // Sync the persisted permission flag with the platform (web or native).
      void getNotificationPermission().then((permission) => {
        const granted = permission === "granted";
        if (granted !== state.notificationsGranted)
          state.setNotificationsGranted(granted);
      });
      if (!state.remindersEnabled) return;

      const waterGoal = state.getWaterGoal();
      const waterCount = state.dailyChecklist.water || 0;
      const elapsed = state.lastWaterReminderTime
        ? Date.now() - state.lastWaterReminderTime
        : Infinity;
      if (
        waterCount < waterGoal &&
        elapsed >= state.waterIntervalMinutes * 60_000
      ) {
        showNotification(
          "💧 Water Reminder",
          `Time to drink water! You've had ${waterCount}/${waterGoal} cups today.`,
          Droplets,
          "bg-cyan-500/20 text-cyan-400",
        );
        state.updateLastWaterReminderTime();
      }

      const hour = new Date().getHours();
      if (
        !state.dailyChecklist.vitamin &&
        state.lastVitaminReminderDate !== todayKey() &&
        hour >= 8 &&
        hour < 22
      ) {
        showNotification(
          "💊 Vitamin Reminder",
          "Don't forget to take your multivitamins today!",
          Pill,
          "bg-violet-500/20 text-violet-400",
        );
        state.markVitaminReminderSent();
      }
    };
    const handleResume = () => {
      if (document.visibilityState === "visible") checkReminders();
    };
    useWorkoutStore.getState().ensureDailyChecklist();
    const initTimer = setTimeout(checkReminders, 5000);
    const interval = setInterval(checkReminders, 60_000);
    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("focus", handleResume);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("focus", handleResume);
    };
  }, [showNotification]);

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
