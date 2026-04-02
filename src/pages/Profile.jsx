import { useState, useMemo, useCallback } from "react";
import {
  Trash2,
  Download,
  Upload,
  Trophy,
  User,
  Activity,
  Flag,
  Dumbbell,
  Flame,
  Zap,
  Crown,
  Target,
  BarChart2,
  Rocket,
  Award,
  RefreshCw,
  Sun,
  Moon,
  Ruler,
  Plus,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { ConfirmDialog } from "../components/Modal";
import { z } from "zod";
import ReminderSettings from "../components/ReminderSettings";
import ScheduleEditor from "../components/ScheduleEditor";

// Zod schema for import validation
const importSchema = z.object({
  history: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        programId: z.string(),
        programName: z.string(),
        exercises: z.array(
          z.object({
            exerciseId: z.string(),
            sets: z.array(
              z.object({
                weight: z.number(),
                reps: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .optional(),
  personalRecords: z.record(z.number()).optional(),
  userProfile: z
    .object({
      name: z.string().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      age: z.number().optional(),
    })
    .optional(),
});

export default function Profile() {
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const clearHistory = useWorkoutStore((s) => s.clearHistory);
  const resetToDefaults = useWorkoutStore((s) => s.resetToDefaults);
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const userProfile = useWorkoutStore((s) => s.userProfile);
  const updateUserProfile = useWorkoutStore((s) => s.updateUserProfile);
  const getAchievements = useWorkoutStore((s) => s.getAchievements);
  const getWeeklyTrend = useWorkoutStore((s) => s.getWeeklyTrend);
  const getBMI = useWorkoutStore((s) => s.getBMI);
  const theme = useWorkoutStore((s) => s.theme);
  const toggleTheme = useWorkoutStore((s) => s.toggleTheme);
  const measurements = useWorkoutStore((s) => s.measurements);
  const addMeasurement = useWorkoutStore((s) => s.addMeasurement);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    bodyFat: "", chest: "", waist: "", arms: "", thighs: "",
  });

  const achievements = useMemo(
    () => getAchievements(),
    [getAchievements, history, personalRecords],
  );
  const weeklyTrend = useMemo(
    () => getWeeklyTrend(),
    [getWeeklyTrend, history],
  );

  // Icon map for achievements
  const achievementIcons = {
    flag: Flag,
    dumbbell: Dumbbell,
    flame: Flame,
    zap: Zap,
    crown: Crown,
    trophy: Trophy,
    target: Target,
    "bar-chart": BarChart2,
    rocket: Rocket,
  };

  // BMI calculation from store
  const bmi = useMemo(
    () => getBMI(),
    [getBMI, userProfile.weight, userProfile.height],
  );

  // Export data as JSON
  const handleExport = () => {
    const data = {
      history,
      personalRecords,
      userProfile,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gym-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data from JSON with Zod validation
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target.result);
        const result = importSchema.safeParse(raw);
        if (!result.success) {
          setImportError(result.error.issues.map((i) => i.message).join(", "));
          return;
        }
        const data = result.data;
        if (data.history) {
          localStorage.setItem("gym_history", JSON.stringify(data.history));
        }
        if (data.personalRecords) {
          localStorage.setItem("gym_prs", JSON.stringify(data.personalRecords));
        }
        if (data.userProfile) {
          localStorage.setItem("gym_profile", JSON.stringify(data.userProfile));
        }
        window.location.reload();
      } catch {
        setImportError("Invalid JSON file. Please select a valid backup.");
      }
    };
    reader.readAsText(file);
  }, []);

  const prEntries = Object.entries(personalRecords)
    .map(([exerciseId, weight]) => ({
      exercise: getExerciseById(exerciseId),
      weight,
    }))
    .filter((e) => e.exercise)
    .sort((a, b) => b.weight - a.weight);

  const maxTrend = Math.max(...weeklyTrend.map((w) => w.count), 1);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* User Avatar & Greeting */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-slate-700 flex items-center justify-center text-2xl font-bold text-neon-blue shrink-0">
          {userProfile.name ? (
            userProfile.name.charAt(0).toUpperCase()
          ) : (
            <User size={28} className="text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={userProfile.name || ""}
            onChange={(e) => updateUserProfile({ name: e.target.value })}
            placeholder="Your Name"
            className="text-xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 w-full focus:placeholder-slate-500"
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            {history.length} workouts • {Object.keys(personalRecords).length}{" "}
            PRs
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-white">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">
              Weight (kg)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={userProfile.weight || ""}
              onChange={(e) =>
                updateUserProfile({ weight: Number(e.target.value) })
              }
              placeholder="0"
              className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">
              Height (cm)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={userProfile.height || ""}
              onChange={(e) =>
                updateUserProfile({ height: Number(e.target.value) })
              }
              placeholder="0"
              className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">Age</label>
            <input
              type="number"
              inputMode="numeric"
              value={userProfile.age || ""}
              onChange={(e) =>
                updateUserProfile({ age: Number(e.target.value) })
              }
              placeholder="24"
              className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/30 transition-colors"
            />
          </div>
        </div>

        {/* BMI Row */}
        {bmi && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 col-span-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  BMI
                </p>
                <p className={`text-lg font-bold ${bmi.color}`}>{bmi.value}</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bmi.color} bg-white/5`}
              >
                {bmi.category}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle (item 13) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon size={14} className="text-neon-blue" />
            ) : (
              <Sun size={14} className="text-amber-400" />
            )}
            <h2 className="text-sm font-semibold text-white">Appearance</h2>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              theme === "light"
                ? "bg-amber-400 shadow-md shadow-amber-400/30"
                : "bg-slate-700"
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                theme === "light" ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reminder Settings */}
      <ReminderSettings />

      {/* Weekly Schedule Editor (item 16) */}
      <ScheduleEditor />

      {/* Body Measurements (item 8) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Ruler size={14} className="text-neon-purple" />
            Body Measurements
          </h2>
          <button
            onClick={() => setShowMeasurementForm(!showMeasurementForm)}
            className="text-[11px] text-neon-blue hover:text-neon-blue/80 font-medium transition-colors flex items-center gap-0.5"
          >
            <Plus size={12} /> Add Entry
          </button>
        </div>

        {showMeasurementForm && (
          <div className="space-y-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="grid grid-cols-3 gap-2">
              {["bodyFat", "chest", "waist", "arms", "thighs"].map((key) => (
                <div key={key}>
                  <label className="text-[10px] text-slate-500 mb-1 block capitalize">
                    {key === "bodyFat" ? "Body Fat %" : key}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={measureForm[key]}
                    onChange={(e) =>
                      setMeasureForm({ ...measureForm, [key]: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white rounded-lg px-2 py-2 border border-slate-600 focus:border-neon-blue focus:outline-none text-xs"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const entry = {};
                Object.entries(measureForm).forEach(([k, v]) => {
                  if (v) entry[k] = Number(v);
                });
                if (Object.keys(entry).length > 0) {
                  addMeasurement(entry);
                  setMeasureForm({ bodyFat: "", chest: "", waist: "", arms: "", thighs: "" });
                  setShowMeasurementForm(false);
                }
              }}
              className="w-full py-2 rounded-xl bg-neon-blue/20 text-neon-blue font-semibold text-xs border border-neon-blue/30 hover:bg-neon-blue/30 transition-all"
            >
              Save Measurement
            </button>
          </div>
        )}

        {measurements.entries.length > 0 ? (
          <div className="space-y-2">
            {[...measurements.entries].reverse().slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0 text-xs"
              >
                <span className="text-slate-500">{entry.date}</span>
                <div className="flex gap-3 text-slate-300">
                  {entry.bodyFat && <span>{entry.bodyFat}% BF</span>}
                  {entry.chest && <span>Chest {entry.chest}</span>}
                  {entry.waist && <span>Waist {entry.waist}</span>}
                  {entry.arms && <span>Arms {entry.arms}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-3">
            No measurements recorded yet
          </p>
        )}
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={14} className="text-neon-blue" />
          Weekly Trend
        </h2>
        <div className="flex items-end justify-between gap-2 h-24">
          {weeklyTrend.map((week, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex items-end justify-center"
                style={{ height: "72px" }}
              >
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                    week.count > 0
                      ? "bg-gradient-to-t from-neon-blue/40 to-neon-blue/80"
                      : "bg-slate-800"
                  }`}
                  style={{
                    height: `${Math.max(4, (week.count / maxTrend) * 72)}px`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {week.label}
              </span>
              {week.count > 0 && (
                <span className="text-[10px] text-neon-blue font-bold">
                  {week.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => {
            const IconComponent = achievementIcons[a.icon] || Award;
            return (
              <div
                key={a.id}
                className={`relative group aspect-square rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 border transition-all ${
                  a.earned
                    ? "bg-slate-800 border-slate-700 hover:border-neon-blue/50"
                    : "bg-slate-900/50 border-slate-800 opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    a.earned
                      ? "bg-neon-blue/10 text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                      : "bg-slate-800 text-slate-600"
                  }`}
                >
                  <IconComponent size={20} />
                </div>
                <div className="space-y-0.5">
                  <p
                    className={`text-[10px] font-semibold leading-tight ${a.earned ? "text-white" : "text-slate-500"}`}
                  >
                    {a.label}
                  </p>
                </div>
                {a.earned && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white">Training Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neon-blue">
              {history.length}
            </p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">
              Total Sessions
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neon-green">
              {history.reduce(
                (acc, s) =>
                  acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
                0,
              )}
            </p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">
              Total Sets
            </p>
          </div>
        </div>
      </div>

      {/* Personal Records */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          Personal Records
        </h2>
        {prEntries.length > 0 ? (
          <div className="space-y-2">
            {prEntries.map(({ exercise, weight }) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">{exercise.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {exercise.muscle}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-400">
                  {weight} kg
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Dumbbell size={20} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">
              Complete workouts to track PRs
            </p>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white">Data Management</h2>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
          aria-label="Export workout data as JSON"
        >
          <Download size={16} className="text-neon-blue" />
          <div className="text-left">
            <p className="text-sm text-white">Export Data</p>
            <p className="text-[11px] text-slate-500">
              Download your workout history as JSON
            </p>
          </div>
        </button>

        <label className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.98] focus-within:ring-2 focus-within:ring-neon-blue/50">
          <Upload size={16} className="text-neon-green" />
          <div className="text-left">
            <p className="text-sm text-white">Import Data</p>
            <p className="text-[11px] text-slate-500">
              Restore from a backup file
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {importError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <p className="font-medium mb-0.5">Import failed</p>
            <p className="text-red-400/70">{importError}</p>
          </div>
        )}

        <button
          onClick={() => setShowConfirmReset(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none"
          aria-label="Reset exercises and programs to defaults"
        >
          <RefreshCw size={16} className="text-amber-400" />
          <div className="text-left">
            <p className="text-sm text-amber-400">Reset to Defaults</p>
            <p className="text-[11px] text-amber-400/50">
              Restore original exercises & programs
            </p>
          </div>
        </button>

        <button
          onClick={() => setShowConfirmClear(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:outline-none"
          aria-label="Clear all workout data"
        >
          <Trash2 size={16} className="text-red-400" />
          <div className="text-left">
            <p className="text-sm text-red-400">Clear All Data</p>
            <p className="text-[11px] text-red-400/50">This cannot be undone</p>
          </div>
        </button>
      </div>

      {/* App info */}
      <p className="text-center text-[11px] text-slate-600 pt-2"></p>

      {/* Confirm Clear */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          setShowConfirmClear(false);
        }}
        title="Clear All Data?"
        message="This will permanently delete your workout history, personal records, and all saved data."
        confirmText="Delete Everything"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Confirm Reset */}
      <ConfirmDialog
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={() => {
          resetToDefaults();
          setShowConfirmReset(false);
        }}
        title="Reset to Defaults?"
        message="This will restore all exercises and programs to the original defaults. Custom exercises will be lost. Your workout history and PRs will NOT be affected."
        confirmText="Reset"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
