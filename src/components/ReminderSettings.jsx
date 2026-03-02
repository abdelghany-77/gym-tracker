import {
  Bell,
  BellOff,
  Droplets,
  Clock,
  BellRing,
  Volume2,
  VolumeX,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

export default function ReminderSettings() {
  const remindersEnabled = useWorkoutStore((s) => s.remindersEnabled);
  const toggleReminders = useWorkoutStore((s) => s.toggleReminders);
  const soundEnabled = useWorkoutStore((s) => s.soundEnabled);
  const toggleSound = useWorkoutStore((s) => s.toggleSound);
  const waterIntervalMinutes = useWorkoutStore((s) => s.waterIntervalMinutes);
  const setWaterInterval = useWorkoutStore((s) => s.setWaterInterval);
  const notificationsGranted = useWorkoutStore((s) => s.notificationsGranted);
  const setNotificationsGranted = useWorkoutStore(
    (s) => s.setNotificationsGranted,
  );

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationsGranted(perm === "granted");
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <BellRing size={14} className="text-amber-400" />
          Reminders
        </h2>
        <button
          onClick={toggleReminders}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
            remindersEnabled
              ? "bg-cyan-500 shadow-md shadow-cyan-500/30"
              : "bg-slate-700"
          }`}
          aria-label="Toggle reminders"
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
              remindersEnabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {remindersEnabled && (
        <>
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2">
              {notificationsGranted ? (
                <Bell size={14} className="text-cyan-400" />
              ) : (
                <BellOff size={14} className="text-slate-500" />
              )}
              <div>
                <p className="text-xs text-white font-medium">
                  Push Notifications
                </p>
                <p className="text-[10px] text-slate-500">
                  {notificationsGranted
                    ? "Enabled — works even when app is closed"
                    : "Get notified even outside the app"}
                </p>
              </div>
            </div>
            {!notificationsGranted ? (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/30 hover:bg-cyan-500/30 transition-all active:scale-95"
              >
                Enable
              </button>
            ) : (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Active ✓
              </span>
            )}
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 size={14} className="text-violet-400" />
              ) : (
                <VolumeX size={14} className="text-slate-500" />
              )}
              <div>
                <p className="text-xs text-white font-medium">
                  Notification Sound
                </p>
                <p className="text-[10px] text-slate-500">
                  Play a chime when reminders fire
                </p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                soundEnabled
                  ? "bg-violet-500 shadow-md shadow-violet-500/30"
                  : "bg-slate-700"
              }`}
              aria-label="Toggle notification sound"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  soundEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Water Interval */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={12} className="text-cyan-400" />
              Water Reminder Interval
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Clock size={14} className="text-cyan-400" />
              <span className="text-xs text-white flex-1">Remind every</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min="10"
                  max="180"
                  step="10"
                  value={waterIntervalMinutes}
                  onChange={(e) => setWaterInterval(Number(e.target.value))}
                  className="w-16 bg-slate-700 text-white rounded-lg px-2 py-1.5 border border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-colors text-sm text-center"
                />
                <span className="text-xs text-slate-500">min</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
