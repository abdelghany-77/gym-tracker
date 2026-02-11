import { useState } from "react";
import { Trash2, Download, Upload, Trophy, RotateCcw } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

export default function Profile() {
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const clearHistory = useWorkoutStore((s) => s.clearHistory);
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Export data as JSON
  const handleExport = () => {
    const data = {
      history,
      personalRecords,
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

  // Import data from JSON
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.history) {
          localStorage.setItem("gym_history", JSON.stringify(data.history));
        }
        if (data.personalRecords) {
          localStorage.setItem("gym_prs", JSON.stringify(data.personalRecords));
        }
        window.location.reload();
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const prEntries = Object.entries(personalRecords)
    .map(([exerciseId, weight]) => ({
      exercise: getExerciseById(exerciseId),
      weight,
    }))
    .filter((e) => e.exercise)
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Stats summary */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white">Training Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neon-blue">
              {history.length}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
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
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Total Sets
            </p>
          </div>
        </div>
      </div>

      {/* Personal Records */}
      {prEntries.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            Personal Records
          </h2>
          <div className="space-y-2">
            {prEntries.map(({ exercise, weight }) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">{exercise.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {exercise.muscle}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-400">
                  {weight} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white">Data Management</h2>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98]"
        >
          <Download size={16} className="text-neon-blue" />
          <div className="text-left">
            <p className="text-sm text-white">Export Data</p>
            <p className="text-[10px] text-slate-500">
              Download your workout history as JSON
            </p>
          </div>
        </button>

        <label className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.98]">
          <Upload size={16} className="text-neon-green" />
          <div className="text-left">
            <p className="text-sm text-white">Import Data</p>
            <p className="text-[10px] text-slate-500">
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

        <button
          onClick={() => setShowConfirmClear(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors active:scale-[0.98]"
        >
          <Trash2 size={16} className="text-red-400" />
          <div className="text-left">
            <p className="text-sm text-red-400">Clear All Data</p>
            <p className="text-[10px] text-red-400/50">This cannot be undone</p>
          </div>
        </button>
      </div>

      {/* App info */}
      <p className="text-center text-[10px] text-slate-600 pt-2">
        GymTracker v1.0 — Built with React + Zustand + Tailwind
      </p>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Clear All Data?
            </h3>
            <p className="text-sm text-slate-400">
              This will permanently delete your workout history, personal
              records, and all saved data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowConfirmClear(false);
                }}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
