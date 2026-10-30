import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { auditRoutineAngles } from "../utils/biomechanicsValidator";
import { angleLabels } from "../data/exercises";

/**
 * AngleCoverageBadge Component
 * Real-time daily biomechanical audit badge that flags missing angles
 * with an amber warning chip and 1-tap candidate recommendations.
 */
export default function AngleCoverageBadge({
  exercises = [],
  programContext = "",
  onSelectSuggestion, // Callback when user taps suggestion: (missingAngle, suggestedEx) => void
  className = "",
}) {
  const [expanded, setExpanded] = useState(false);

  const audit = useMemo(() => {
    return auditRoutineAngles(exercises, programContext);
  }, [exercises, programContext]);

  if (!audit || audit.totalRequired === 0) return null;

  const { isComplete, missingAngles, coveragePercent } = audit;
  const primaryMissing = missingAngles[0];

  return (
    <div className={`w-full transition-all ${className}`}>
      {/* ── Top Real-Time Status Chip ── */}
      <div
        className={`w-full rounded-xl transition-all border text-xs flex items-center justify-between p-2 select-none ${
          isComplete
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isComplete ? (
            <span className="flex items-center gap-1.5 font-bold shrink-0 text-emerald-400">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>100% Angle Coverage</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-amber-400 shrink-0">
                <AlertTriangle size={13} className="shrink-0" />
                <span>Missing: {angleLabels[primaryMissing.id]?.en || primaryMissing.id}</span>
              </span>

              {primaryMissing.suggestedExercise && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSuggestion?.(primaryMissing.id, primaryMissing.suggestedExercise);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-colors active:scale-95"
                  title={`Add ${primaryMissing.suggestedExercise.name}`}
                >
                  <span>Suggested: {primaryMissing.suggestedExercise.name}</span>
                  <ArrowRight size={10} />
                </button>
              )}

              {missingAngles.length > 1 && (
                <span className="text-[10px] text-amber-400/80 font-mono">
                  +{missingAngles.length - 1} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand / Collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white shrink-0 ml-1.5"
          aria-label={expanded ? "Hide angle breakdown" : "Show angle breakdown"}
          title="Toggle biomechanical angle breakdown"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Expandable Angle Audit Breakdown Drawer ── */}
      {expanded && (
        <div className="mt-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2 animate-fadeIn text-xs shadow-xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-neon-cyan" />
              {audit.dayTitle} Biomechanical Audit
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                isComplete ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {audit.coveredCount}/{audit.totalRequired} Angles ({coveragePercent}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
            {/* Required Angles List */}
            {audit.coveredAngles.map((angle) => (
              <div
                key={angle.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{angle.label}</span>
                </div>
                <span className="text-[9px] text-emerald-400 uppercase font-mono font-bold">
                  Covered
                </span>
              </div>
            ))}

            {audit.missingAngles.map((angle) => (
              <div
                key={angle.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-amber-200 font-medium block truncate">
                      {angle.label}
                    </span>
                    {angle.suggestedExercise && (
                      <span className="text-[9px] text-slate-400 block truncate">
                        Rec: {angle.suggestedExercise.name}
                      </span>
                    )}
                  </div>
                </div>

                {angle.suggestedExercise && (
                  <button
                    type="button"
                    onClick={() => onSelectSuggestion?.(angle.id, angle.suggestedExercise)}
                    className="p-1 px-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded border border-amber-500/30 shrink-0 ml-1 font-semibold text-[10px] flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
