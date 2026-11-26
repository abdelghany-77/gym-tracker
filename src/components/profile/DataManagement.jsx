import { useState, useCallback } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";
import { ConfirmDialog } from "../Modal";
import {
  buildExportPayload,
  exportBackupFile,
  importUserData,
} from "../../store/helpers";
import { isNative } from "../../utils/nativeBridge";

export default function DataManagement() {
  const clearHistory = useWorkoutStore((s) => s.clearHistory);
  const resetToDefaults = useWorkoutStore((s) => s.resetToDefaults);
  const rehydrateFromStorage = useWorkoutStore((s) => s.rehydrateFromStorage);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error' | 'info', title?: string, message: string }

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const result = await exportBackupFile();
      if (result.status === "cancelled") {
        setImportStatus({
          type: "info",
          title: "Export Saved Locally",
          message: `Share dismissed. A local copy was saved in app storage (${result.fileName}), or use Copy JSON below.`,
        });
      } else if (result.status === "shared") {
        setImportStatus({
          type: "success",
          title: "Backup Exported",
          message: `Backup (${result.fileName}) ready in Share sheet — choose Save to Files, Drive, or any app.`,
        });
      } else {
        setImportStatus({
          type: "success",
          title: "Backup Downloaded",
          message: "Backup downloaded successfully!",
        });
      }
      setTimeout(() => setImportStatus(null), 5000);
    } catch (err) {
      setImportStatus({
        type: "error",
        title: "Export Failed",
        message: err?.message || "Failed to generate backup export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJson = async () => {
    try {
      const jsonStr = JSON.stringify(buildExportPayload(), null, 2);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      } else {
        const area = document.createElement("textarea");
        area.value = jsonStr;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setImportStatus({
        type: "success",
        title: "Copied to Clipboard",
        message: "Backup JSON copied! You can paste and save it anywhere.",
      });
      setTimeout(() => setImportStatus(null), 4000);
    } catch {
      setImportStatus({
        type: "error",
        title: "Copy Failed",
        message: "Could not copy backup data to clipboard.",
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
              title: "Import Successful",
              message: `Restored: ${count.history ?? 0} workouts, ${count.prs ?? 0} PRs, ${count.exercises ?? 0} exercises.`,
            });
          } else {
            setImportStatus({
              type: "error",
              title: "Import Failed",
              message:
                result.message ||
                "Import failed. Please check the backup file.",
            });
          }
        } catch (err) {
          setImportStatus({
            type: "error",
            title: "Import Failed",
            message: err.message || "Failed to process backup file.",
          });
        }
      };
      reader.onerror = () => {
        setImportStatus({
          type: "error",
          title: "Import Failed",
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

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 transition-colors active:scale-[0.98] min-w-0"
        >
          <Download size={16} className="text-neon-blue shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-sm text-white truncate">
              {isExporting ? "Exporting..." : "Export Data"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isNative()
                ? "Save or share your backup (.json)"
                : "Download your workout history as JSON"}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleCopyJson}
          className="sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98] text-xs font-semibold text-slate-200 shrink-0"
          aria-label="Copy backup JSON to clipboard"
          title="Copy backup JSON"
        >
          <Copy size={14} className="text-slate-300 shrink-0" />
          <span>Copy JSON</span>
        </button>
      </div>

      <label className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer active:scale-[0.98]">
        <Upload size={16} className="text-neon-green shrink-0" />
        <div className="text-left min-w-0">
          <p className="text-sm text-white">Import Data</p>
          <p className="text-[11px] text-slate-400">
            Restore from a backup file (.json)
          </p>
        </div>
        <input
          type="file"
          accept=".json,application/json,text/plain,*/*"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      {importStatus && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            importStatus.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : importStatus.type === "info"
                ? "bg-sky-500/10 border-sky-500/20 text-sky-300"
                : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {importStatus.type === "error" ? (
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle
              size={15}
              className={`${
                importStatus.type === "info"
                  ? "text-sky-400"
                  : "text-emerald-400"
              } shrink-0 mt-0.5`}
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {importStatus.title ||
                (importStatus.type === "success" ? "Success" : "Failed")}
            </p>
            <p className="opacity-85 mt-0.5 break-words">
              {importStatus.message}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowConfirmReset(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors active:scale-[0.98]"
      >
        <RefreshCw size={16} className="text-amber-400 shrink-0" />
        <div className="text-left min-w-0">
          <p className="text-sm text-amber-400">Reset to Defaults</p>
          <p className="text-[11px] text-amber-400/50">
            Restore original exercises &amp; programs
          </p>
        </div>
      </button>

      <button
        onClick={() => setShowConfirmClear(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors active:scale-[0.98]"
      >
        <Trash2 size={16} className="text-red-400 shrink-0" />
        <div className="text-left min-w-0">
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
