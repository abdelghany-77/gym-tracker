import { useState, useCallback } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";
import { ConfirmDialog } from "../Modal";
import { exportUserData, importUserData } from "../../store/helpers";

export default function DataManagement() {
  const clearHistory = useWorkoutStore((s) => s.clearHistory);
  const resetToDefaults = useWorkoutStore((s) => s.resetToDefaults);
  const rehydrateFromStorage = useWorkoutStore((s) => s.rehydrateFromStorage);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleExport = () => {
    try {
      exportUserData();
      setImportStatus({
        type: "success",
        message: "Backup downloaded successfully!",
      });
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      setImportStatus({
        type: "error",
        message: err.message || "Failed to generate backup export.",
      });
    }
  };

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImportStatus(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const result = importUserData(text, rehydrateFromStorage);
          if (result.success) {
            const count = result.count || {};
            setImportStatus({
              type: "success",
              message: `Restored: ${count.history ?? 0} workouts, ${count.prs ?? 0} PRs, ${count.exercises ?? 0} exercises.`,
            });
          } else {
            setImportStatus({
              type: "error",
              message:
                result.message ||
                "Import failed. Please check the backup file.",
            });
          }
        } catch (err) {
          setImportStatus({
            type: "error",
            message: err.message || "Failed to process backup file.",
          });
        }
      };
      reader.onerror = () => {
        setImportStatus({
          type: "error",
          message: "Could not read the uploaded file.",
        });
      };
      reader.readAsText(file);
      // Reset file input value so same file can be selected again if needed
      e.target.value = "";
    },
    [rehydrateFromStorage],
  );

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
      <h2 className="text-sm font-semibold text-white">Data Management</h2>

      <button
        onClick={handleExport}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98]"
      >
        <Download size={16} className="text-neon-blue" />
        <div className="text-left">
          <p className="text-sm text-white">Export Data</p>
          <p className="text-[11px] text-slate-500">
            Download your workout history as JSON
          </p>
        </div>
      </button>

      <label className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.98]">
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

      {importStatus && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            importStatus.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {importStatus.type === "success" ? (
            <CheckCircle
              size={15}
              className="text-emerald-400 shrink-0 mt-0.5"
            />
          ) : (
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {importStatus.type === "success" ? "Success" : "Import Failed"}
            </p>
            <p className="opacity-80 mt-0.5">{importStatus.message}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowConfirmReset(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors active:scale-[0.98]"
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
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors active:scale-[0.98]"
      >
        <Trash2 size={16} className="text-red-400" />
        <div className="text-left">
          <p className="text-sm text-red-400">Clear Workout History</p>
          <p className="text-[11px] text-red-400/50">This cannot be undone</p>
        </div>
      </button>

      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          setShowConfirmClear(false);
        }}
        title="Clear Workout History?"
        description="This will permanently delete your workout history and personal records. Your profile, measurements, and other saved data will be kept."
        confirmText="Delete History"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={() => {
          resetToDefaults();
          setShowConfirmReset(false);
        }}
        title="Reset to Defaults?"
        description="This will restore all exercises and programs to the original defaults."
        confirmText="Reset"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
