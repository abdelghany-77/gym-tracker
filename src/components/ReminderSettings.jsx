import { useState } from "react";
import {
  Bell,
  BellOff,
  Droplets,
  Clock,
  BellRing,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { todayKey } from "../store/helpers";
import {
  requestNotificationPermission as requestPermission,
  getBackgroundCapability,
  scheduleDelayedNotification,
  syncBackgroundReminders,
} from "../utils/notificationService";
import PWAInstallButton from "./PWAInstallButton";

// Active-workout hydration quick options (0 = Off)
const HYDRATION_PRESETS = [0, 10, 15, 20, 30];

export default function ReminderSettings() {
  const remindersEnabled = useWorkoutStore((s) => s.remindersEnabled);
  const toggleReminders = useWorkoutStore((s) => s.toggleReminders);
  const soundEnabled = useWorkoutStore((s) => s.soundEnabled);
  const toggleSound = useWorkoutStore((s) => s.toggleSound);
  const waterIntervalMinutes = useWorkoutStore((s) => s.waterIntervalMinutes);
  const setWaterInterval = useWorkoutStore((s) => s.setWaterInterval);
  const hydrationIntervalMinutes = useWorkoutStore(
    (s) => s.hydrationIntervalMinutes,
  );
  const setHydrationInterval = useWorkoutStore((s) => s.setHydrationInterval);
  const notificationsGranted = useWorkoutStore((s) => s.notificationsGranted);
  const setNotificationsGranted = useWorkoutStore(
    (s) => s.setNotificationsGranted,
  );

  const [permissionError, setPermissionError] = useState("");
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [customHydration, setCustomHydration] = useState("");
  const [testScheduled, setTestScheduled] = useState(false);

  const capability = getBackgroundCapability();

  const requestNotificationPermission = async () => {
    setPermissionError("");
    setRequestingPermission(true);
    try {
      const perm = await requestPermission();
      const granted = perm === "granted";
      setNotificationsGranted(granted);
      if (granted) {
        const state = useWorkoutStore.getState();
        void syncBackgroundReminders({
          enabled: Boolean(state.remindersEnabled),
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
      } else if (perm === "denied") {
        setPermissionError(
          "Notifications are blocked. Enable them in your device or browser settings.",
        );
      }
    } catch {
      setNotificationsGranted(false);
      setPermissionError(
        "Could not enable notifications. Try again in your device or browser settings.",
      );
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleScheduleTestNotification = async () => {
    if (!notificationsGranted) {
      await requestNotificationPermission();
      if (!useWorkoutStore.getState().notificationsGranted) return;
    }
    const ok = await scheduleDelayedNotification({
      title: "GymTracker Background Check",
      body: "Background notifications are working even while the app is minimized or closed.",
      delayMs: 5000,
      tag: "gym-test-alert",
      url: "#/",
    });
    if (ok) {
      setTestScheduled(true);
      setTimeout(() => setTestScheduled(false), 6000);
    }
  };

  return (
    <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <BellRing size={15} className="text-amber-400" />
          Reminders &amp; Background Alerts
        </h2>
        <button
          onClick={toggleReminders}
          className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 ${
            remindersEnabled ? "bg-sky-500" : "bg-slate-700"
          }`}
          aria-label="Toggle reminders"
          role="switch"
          aria-checked={remindersEnabled}
        >
          <div
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
              remindersEnabled ? "left-[24px]" : "left-1"
            }`}
          />
        </button>
      </div>

      {remindersEnabled && (
        <>
          {/* Push Notifications & Background Status */}
          <div className="rounded-xl bg-bg-deep border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {notificationsGranted ? (
                  <Bell size={15} className="text-sky-400 shrink-0" />
                ) : (
                  <BellOff size={15} className="text-slate-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-white font-semibold">
                    Push Notifications
                  </p>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {notificationsGranted
                      ? capability.label
                      : "Allow OS alarms for water, vitamins, rest timers & workout days"}
                  </p>
                </div>
              </div>
              {!notificationsGranted ? (
                <button
                  onClick={requestNotificationPermission}
                  disabled={requestingPermission}
                  className="min-h-10 px-3.5 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white transition-colors shrink-0"
                >
                  {requestingPermission ? "Enabling…" : "Enable"}
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-semibold shrink-0">
                  Active ✓
                </span>
              )}
            </div>

            {notificationsGranted && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400">
                  {testScheduled
                    ? "Scheduled! Minimize or lock your screen — arrives in 5s."
                    : "Verify delivery when app is closed or screen locked."}
                </p>
                <button
                  type="button"
                  onClick={handleScheduleTestNotification}
                  className="min-h-9 px-3 rounded-lg border border-slate-700 bg-bg-surface text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  {testScheduled ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Sent (5s)
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      Test in 5s
                    </>
                  )}
                </button>
              </div>
            )}

            <PWAInstallButton compact />
          </div>

          {permissionError && (
            <p role="alert" className="text-xs text-amber-400">
              {permissionError}
            </p>
          )}

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-deep border border-slate-800 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {soundEnabled ? (
                <Volume2 size={15} className="text-sky-400 shrink-0" />
              ) : (
                <VolumeX size={15} className="text-slate-500 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-white font-semibold">
                  Notification Sound
                </p>
                <p className="text-[11px] text-slate-400">
                  Play a chime when reminders fire
                </p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 ${
                soundEnabled ? "bg-sky-500" : "bg-slate-700"
              }`}
              aria-label="Toggle notification sound"
              role="switch"
              aria-checked={soundEnabled}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  soundEnabled ? "left-[24px]" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Water Interval */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={12} className="text-sky-400" />
              Water Reminder Interval
            </h3>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-deep border border-slate-800">
              <Clock size={14} className="text-sky-400 shrink-0" />
              <span className="text-xs text-white flex-1">
                Daytime reminders every
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label="Water reminder interval in minutes"
                  inputMode="numeric"
                  min="10"
                  max="180"
                  step="10"
                  key={waterIntervalMinutes}
                  defaultValue={waterIntervalMinutes}
                  onBlur={(e) => {
                    const value = e.target.valueAsNumber;
                    if (Number.isFinite(value)) setWaterInterval(value);
                    e.target.value = String(
                      useWorkoutStore.getState().waterIntervalMinutes,
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  className="min-h-10 w-16 bg-bg-surface text-white font-mono tabular-nums rounded-xl px-2 border border-slate-700 focus:border-slate-400 focus:outline-none text-sm text-center"
                />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>
          </div>

          {/* ── Active-Workout Hydration Reminder ── */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={12} className="text-sky-400" />
              Workout Hydration Reminder
            </h3>
            <div className="p-3.5 rounded-xl bg-bg-deep border border-slate-800 space-y-2.5">
              <p className="text-[11px] text-slate-400">
                Scheduled alerts during active workouts (works in background).
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {HYDRATION_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setHydrationInterval(minutes)}
                    aria-pressed={hydrationIntervalMinutes === minutes}
                    className={`min-h-10 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                      hydrationIntervalMinutes === minutes
                        ? "bg-slate-100 text-slate-950 border-slate-100"
                        : "bg-bg-surface text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {minutes === 0 ? "Off" : `${minutes}m`}
                  </button>
                ))}
                <span className="w-px h-5 bg-slate-700" aria-hidden="true" />
                <input
                  type="number"
                  aria-label="Custom hydration interval in minutes"
                  inputMode="numeric"
                  min="5"
                  max="180"
                  placeholder="min"
                  value={customHydration}
                  onChange={(e) => setCustomHydration(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = Number(customHydration);
                      if (Number.isFinite(value) && value > 0) {
                        setHydrationInterval(value);
                        setCustomHydration("");
                      }
                    }
                  }}
                  className="min-h-10 w-16 bg-bg-surface text-white rounded-xl px-2 border border-slate-700 focus:border-slate-400 focus:outline-none text-sm text-center font-mono tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => {
                    const value = Number(customHydration);
                    if (Number.isFinite(value) && value > 0) {
                      setHydrationInterval(value);
                      setCustomHydration("");
                    }
                  }}
                  className="min-h-10 px-3.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  Set
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Current:{" "}
                <span className="text-sky-400 font-semibold font-mono tabular-nums">
                  {hydrationIntervalMinutes
                    ? `Every ${hydrationIntervalMinutes} min`
                    : "Off"}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
