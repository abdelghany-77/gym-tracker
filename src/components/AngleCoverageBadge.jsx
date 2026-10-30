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
        className={`w-full rounded-xl transition-all border text-xs flex items-center justify-between ${
          compact ? "px-2 py-1.5" : "p-2"
        } select-none ${
          isComplete
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {isComplete ? (
            <span className="flex items-center gap-1.5 font-bold shrink-0 text-emerald-400 text-xs">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
              <span>100% Angle Coverage</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <span className="flex items-center gap-1 font-bold text-amber-400 shrink-0 text-[11px]">
                <AlertTriangle size={12} className="shrink-0" />
                <span>Missing: {angleLabels[primaryMissing.id]?.en || primaryMissing.id}</span>
              </span>

              {primaryMissing.suggestedExercise && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSuggestion?.(primaryMissing.id, primaryMissing.suggestedExercise);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all active:scale-95 shrink-0 truncate max-w-[170px]"
                  title={`Add ${primaryMissing.suggestedExercise.name}`}
                >
                  <span className="truncate">Suggested: {primaryMissing.suggestedExercise.name}</span>
                  <ArrowRight size={10} className="shrink-0" />
                </button>
              )}

              {missingAngles.length > 1 && (
                <span className="text-[10px] text-amber-400/80 font-mono shrink-0">
                  +{missingAngles.length - 1}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand / Collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white shrink-0 ml-1"
          aria-label={expanded ? "Hide angle breakdown" : "Show angle breakdown"}
          title="Toggle biomechanical angle breakdown"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ── Expandable Angle Audit Breakdown Drawer ── */}
      {expanded && (
        <div className="mt-1.5 bg-slate-900/95 border border-slate-800 rounded-xl p-3 space-y-2 animate-fadeIn text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-[#73C8B4]" />
              <span>{audit.dayTitle} Audit</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-[#73C8B4]">
              {coveragePercent}% Covered ({coveredAngles.length}/{audit.totalRequired})
            </span>
          </div>

          {/* Missing angles breakdown */}
          {missingAngles.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Missing Biomechanical Angles
              </p>
              <div className="space-y-1">
                {missingAngles.map((missing) => (
                  <div
                    key={missing.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-300 text-xs truncate">
                          {missing.label}
                        </span>
                        {missing.labelAr && (
                          <span className="text-[10px] text-slate-400 truncate" dir="rtl">
                            ({missing.labelAr})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                        {missing.rationale}
                      </p>
                    </div>

                    {missing.suggestedExercise && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSuggestion?.(missing.id, missing.suggestedExercise);
                          setExpanded(false);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold bg-amber-500 text-slate-950 px-2 py-1 rounded-md hover:bg-amber-400 active:scale-95 transition-all shrink-0 shadow-sm"
                      >
                        <Plus size={11} strokeWidth={3} />
                        <span>Swap</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Covered angles list */}
          {coveredAngles.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Covered Angles ({coveredAngles.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {coveredAngles.map((angle) => (
                  <span
                    key={angle.id}
                    className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20"
                  >
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    <span>{angle.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
