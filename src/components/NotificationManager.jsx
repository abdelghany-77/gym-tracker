import { useEffect, useRef, useState, useCallback } from "react";
import { X, Droplets, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

// ── Generate notification sound using Web Audio API ──
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a pleasant two-tone chime
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playTone(587.33, now, 0.25); // D5
    playTone(880, now + 0.15, 0.35); // A5
    playTone(1174.66, now + 0.3, 0.45); // D6

    // Close context after sounds finish
    setTimeout(() => audioCtx.close(), 1500);
  } catch {
    // Audio not supported — silent fallback
  }
}

// ── In-app toast notification ──
function Toast({ message, icon: Icon, color, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slideDown max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          {Icon && <Icon size={20} />}
        </div>
        <p className="flex-1 text-sm text-white font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationManager() {
  const remindersEnabled = useWorkoutStore((s) => s.remindersEnabled);
  const soundEnabled = useWorkoutStore((s) => s.soundEnabled);
  const waterIntervalMinutes = useWorkoutStore((s) => s.waterIntervalMinutes);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const waterGoal = useWorkoutStore((s) => s.getWaterGoal());
  const lastWaterReminderTime = useWorkoutStore(
    (s) => s.lastWaterReminderTime,
  );
  const updateLastWaterReminderTime = useWorkoutStore(
    (s) => s.updateLastWaterReminderTime,
  );
  const [toasts, setToasts] = useState([]);
  const notifiedVitaminRef = useRef(false);

  const waterCount = dailyChecklist.water || 0;
  const vitaminTaken = dailyChecklist.vitamin || false;

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  // Show a notification (browser push + sound + in-app toast)
  const showNotification = useCallback(
    (title, body, icon, color) => {
      // Play sound if enabled
      if (soundEnabled) {
        playNotificationSound();
      }

      // Browser notification (works even when tab is backgrounded / PWA installed)
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, {
            body,
            icon: "/gym-tracker/icon.png",
            badge: "/gym-tracker/icon.png",
            vibrate: [200, 100, 200],
            tag: title, // prevents duplicate stacking
            renotify: true,
          });
        } catch {
          // Fallback: SW-based notifications not available
        }
      }

      // Always show in-app toast
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message: body, icon, color }]);
    },
    [soundEnabled],
  );

  // ── Water reminder interval ──
  useEffect(() => {
    if (!remindersEnabled || waterCount >= waterGoal) return;

    const checkWater = () => {
      const now = Date.now();
      const elapsed = lastWaterReminderTime
        ? now - lastWaterReminderTime
        : Infinity;
      const intervalMs = waterIntervalMinutes * 60 * 1000;

      if (elapsed >= intervalMs) {
        showNotification(
          "💧 Water Reminder",
          `Time to drink water! You've had ${waterCount}/${waterGoal} cups today.`,
          Droplets,
          "bg-cyan-500/20 text-cyan-400",
        );
        updateLastWaterReminderTime();
      }
    };

    // Delay initial check to avoid first-load spam
    const initTimer = setTimeout(checkWater, 3000);
    const interval = setInterval(checkWater, 60_000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [
    remindersEnabled,
    waterIntervalMinutes,
    waterCount,
    waterGoal,
    lastWaterReminderTime,
    updateLastWaterReminderTime,
    showNotification,
  ]);

  // ── Vitamin reminder (once daily at a reasonable hour) ──
  useEffect(() => {
    if (!remindersEnabled || vitaminTaken || notifiedVitaminRef.current) return;

    const checkVitamin = () => {
      const hour = new Date().getHours();
      // Remind between 8 AM and 10 PM if not yet taken
      if (hour >= 8 && hour <= 22 && !notifiedVitaminRef.current) {
        showNotification(
          "💊 Vitamin Reminder",
          "Don't forget to take your multivitamins today!",
          Pill,
          "bg-violet-500/20 text-violet-400",
        );
        notifiedVitaminRef.current = true;
      }
    };

    const initTimer = setTimeout(checkVitamin, 5000);
    return () => clearTimeout(initTimer);
  }, [remindersEnabled, vitaminTaken, showNotification]);

  // Reset vitamin notification flag at midnight
  useEffect(() => {
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedVitaminRef.current = false;
      }
    }, 60_000);
    return () => clearInterval(midnightCheck);
  }, []);

  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          icon={t.icon}
          color={t.color}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </>
  );
}
