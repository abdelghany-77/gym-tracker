import { useState, useCallback } from "react";
import { Download, Upload, Trash2, RefreshCw } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";
import { ConfirmDialog } from "../Modal";
import { z } from "zod";

const importSchema = z.object({
  history: z.array(z.any()).optional(),
  personalRecords: z.record(z.number()).optional(),
  userProfile: z.object({
    name: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    age: z.number().optional(),
  }).optional(),
});

export default function DataManagement() {
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const userProfile = useWorkoutStore((s) => s.userProfile);
  const clearHistory = useWorkoutStore((s) => s.clearHistory);
  const resetToDefaults = useWorkoutStore((s) => s.resetToDefaults);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleExport = () => {
    const data = { history, personalRecords, userProfile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gym-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        if (data.history) localStorage.setItem("gym_history", JSON.stringify(data.history));
        if (data.personalRecords) localStorage.setItem("gym_prs", JSON.stringify(data.personalRecords));
        if (data.userProfile) localStorage.setItem("gym_profile", JSON.stringify(data.userProfile));
        window.location.reload();
      } catch {
        setImportError("Invalid JSON file. Please select a valid backup.");
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
      <h2 className="text-sm font-semibold text-white">Data Management</h2>

      <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98]">
        <Download size={16} className="text-neon-blue" />
        <div className="text-left">
          <p className="text-sm text-white">Export Data</p>
          <p className="text-[11px] text-slate-500">Download your workout history as JSON</p>
        </div>
      </button>

      <label className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.98]">
        <Upload size={16} className="text-neon-green" />
        <div className="text-left">
          <p className="text-sm text-white">Import Data</p>
          <p className="text-[11px] text-slate-500">Restore from a backup file</p>
        </div>
        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
      </label>

      {importError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <p className="font-medium mb-0.5">Import failed</p>
          <p className="text-red-400/70">{importError}</p>
        </div>
      )}

      <button onClick={() => setShowConfirmReset(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors active:scale-[0.98]">
        <RefreshCw size={16} className="text-amber-400" />
        <div className="text-left">
          <p className="text-sm text-amber-400">Reset to Defaults</p>
          <p className="text-[11px] text-amber-400/50">Restore original exercises & programs</p>
        </div>
      </button>

      <button onClick={() => setShowConfirmClear(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors active:scale-[0.98]">
        <Trash2 size={16} className="text-red-400" />
        <div className="text-left">
          <p className="text-sm text-red-400">Clear All Data</p>
          <p className="text-[11px] text-red-400/50">This cannot be undone</p>
        </div>
      </button>

      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => { clearHistory(); setShowConfirmClear(false); }}
        title="Clear All Data?"
        message="This will permanently delete your workout history, personal records, and all saved data."
        confirmText="Delete Everything"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={() => { resetToDefaults(); setShowConfirmReset(false); }}
        title="Reset to Defaults?"
        message="This will restore all exercises and programs to the original defaults."
        confirmText="Reset"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
