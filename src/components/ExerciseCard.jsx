import { memo, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Plus,
  Minus,
  Info,
  ArrowLeftRight,
  X,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  PlayCircle,
  Activity,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import SwapExerciseModal from "./SwapExerciseModal";
import AngleBadge from "./AngleBadge";
import { haptics } from "../utils/haptics";

function ExerciseCard({ exerciseIndex, exerciseData }) {
  const { exerciseId, sets } = exerciseData;
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const getGhostData = useWorkoutStore((s) => s.getGhostData);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [showSwap, setShowSwap] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [infoTab, setInfoTab] = useState("how");

  // eslint-disable-next-line react-hooks/exhaustive-deps -- exercises/history trigger re-computation
  const exercise = useMemo(() => getExerciseById(exerciseId), [getExerciseById, exerciseId, exercises]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ghostData = useMemo(() => getGhostData(exerciseId), [getGhostData, exerciseId, history]);

  if (!exercise) return null;

  // Helper stepper adjustments
  const adjustWeight = (si, delta) => {
    const current = Number(sets[si].weight) || (ghostData?.sets[si]?.weight ? Number(ghostData.sets[si].weight) : 0);
    const nextVal = Math.max(0, current + delta);
    updateSet(exerciseIndex, si, "weight", nextVal === 0 ? "" : nextVal.toString());
  };

  const adjustReps = (si, delta) => {
    const current = Number(sets[si].reps) || (ghostData?.sets[si]?.reps ? Number(ghostData.sets[si].reps) : exercise.default_reps || 10);
    const nextVal = Math.max(1, current + delta);
    updateSet(exerciseIndex, si, "reps", nextVal.toString());
  };

  const videoUrl = exercise.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " workout execution form")}`;

  return (
    <>
      <div className="glass-card overflow-hidden shadow-xl shadow-black/40 border border-border-slate transition-all">
        {/* Exercise overview */}
        <div className="p-3.5 space-y-2.5 border-b border-border-slate/60 bg-bg-surface/60">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white truncate text-base tracking-tight">{exercise.name}</h3>
              {exercise.nameAr && (
                <p className="text-[11px] text-slate-400 font-medium truncate" dir="rtl">{exercise.nameAr}</p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                  {exercise.muscle}
                </span>
                {exercise.targetAngle && <AngleBadge angle={exercise.targetAngle} size="sm" />}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSwap(true)}
              className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 active:scale-90 border border-slate-700/50 shrink-0"
              aria-label={`Swap ${exercise.name} for another exercise`}
              title="تبديل التمرين"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTechniqueModal(true)}
            className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-[#0B0F17] border border-border-slate flex items-center justify-center"
            aria-label={`View ${exercise.name} technique and anatomy`}
          >
            <img
              src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
              alt={exercise.name}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getImageUrl("/icons/dumbbell.svg");
              }}
            />
            <span className="absolute right-2 top-2 rounded-md bg-bg-deep/85 px-2 py-1 text-[10px] font-semibold text-slate-300 border border-border-slate">
              Form & Tips
            </span>
          </button>

          <div className="grid grid-cols-2 rounded-lg overflow-hidden border border-border-slate">
            <button
              type="button"
              onClick={() => setInfoTab("how")}
              className={`py-1.5 text-[11px] font-bold transition-colors ${infoTab === "how" ? "bg-neon-green text-bg-deep" : "bg-slate-900/70 text-slate-400"}`}
            >
              How to do it
            </button>
            <button
              type="button"
              onClick={() => setInfoTab("muscles")}
              className={`py-1.5 text-[11px] font-bold transition-colors ${infoTab === "muscles" ? "bg-neon-green text-bg-deep" : "bg-slate-900/70 text-slate-400"}`}
            >
              Muscles
            </button>
          </div>

          <div className="min-h-8 text-[11px] leading-relaxed text-slate-400">
            {infoTab === "how" ? (
              <p>{exercise.tips || exercise.setupAlignment || "Control the movement and keep the target muscle engaged throughout every repetition."}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-neon-cyan font-semibold">{exercise.primaryTarget || exercise.muscle}</span>
                {(exercise.secondaryMuscles || []).map((muscle) => (
                  <span key={muscle} className="rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">{muscle}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Previous performance */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border-slate/50 bg-bg-deep/40 text-[10px]">
          <span className="text-slate-500">Previous Performance</span>
          <span className="text-slate-300 font-mono truncate">
            {ghostData
              ? ghostData.sets.map((s) => `${s.weight || 0} kg × ${s.reps || 0} reps`).join("  ·  ")
              : "No previous performance"}
          </span>
        </div>

        {/* Sets Table */}
        <div className="p-4 space-y-2.5">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold px-1 pb-1.5 border-b border-border-slate/50">
            <span className="text-center">Set</span>
            <span className="text-center">Weight (kg)</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>

          {/* Set Rows */}
          {sets.map((set, si) => (
            <div
              key={si}
              className={`grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 items-center p-1.5 rounded-xl transition-all relative ${
                set.done
                  ? "bg-neon-emerald/5 border border-neon-emerald/20"
                  : "bg-slate-900/40 border border-transparent hover:border-slate-800"
              }`}
            >
              {/* Set Number */}
              <div className="flex items-center justify-center">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                    set.done
                      ? "text-neon-emerald bg-neon-emerald/15"
                      : "text-slate-400 bg-slate-800"
                  }`}
                >
                  {si + 1}
                </span>
              </div>

              {/* Weight Input + Steppers */}
              <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden h-10 px-1">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={ghostData?.sets[si]?.weight ? `${ghostData.sets[si].weight}` : "0"}
                  value={set.weight}
                  disabled={set.done}
                  onChange={(e) => updateSet(exerciseIndex, si, "weight", e.target.value)}
                  className="w-full bg-transparent text-center font-bold font-mono text-sm text-white focus:outline-none disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={`Set ${si + 1} weight in kg`}
                />
                {!set.done && (
                  <div className="flex flex-col border-l border-slate-700/60 pl-0.5">
                    <button
                      type="button"
                      onClick={() => adjustWeight(si, 2.5)}
                      className="text-slate-500 p-0.5"
                      title="+2.5 kg"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustWeight(si, -2.5)}
                      className="text-slate-500 p-0.5"
                      title="-2.5 kg"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Reps Input + Steppers */}
              <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden h-10 px-1">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={ghostData?.sets[si]?.reps ? `${ghostData.sets[si].reps}` : `${exercise.default_reps || 10}`}
                  value={set.reps}
                  disabled={set.done}
                  onChange={(e) => updateSet(exerciseIndex, si, "reps", e.target.value)}
                  className="w-full bg-transparent text-center font-bold font-mono text-sm text-white focus:outline-none disabled:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={`Set ${si + 1} reps`}
                />
                {!set.done && (
                  <div className="flex flex-col border-l border-slate-700/60 pl-0.5">
                    <button
                      type="button"
                      onClick={() => adjustReps(si, 1)}
                      className="text-slate-500 hover:text-neon-cyan p-0.5 transition-colors"
                      title="+1 rep"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustReps(si, -1)}
                      className="text-slate-500 hover:text-neon-cyan p-0.5 transition-colors"
                      title="-1 rep"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Done Check Button */}
              <button
                type="button"
                onClick={() => {
                  // If fields empty, auto-fill from ghost data or defaults for fast mobile logging
                  if (!set.done) {
                    if (!set.weight && ghostData?.sets[si]?.weight) {
                      updateSet(exerciseIndex, si, "weight", ghostData.sets[si].weight);
                    }
                    if (!set.reps) {
                      updateSet(exerciseIndex, si, "reps", ghostData?.sets[si]?.reps || exercise.default_reps || 10);
                    }
                  }
                  toggleSetDone(exerciseIndex, si);
                  if (!set.done) {
                    navigator.vibrate?.(50);
                    haptics.light();
                  }
                }}
                className={`w-11 h-10 rounded-xl flex items-center justify-center transition-all btn-press focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none ${
                  set.done ? "animate-set-complete " : ""
                }${
                  set.done
                    ? "bg-neon-emerald text-bg-deep font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-neon-cyan/50 hover:text-white"
                }`}
                aria-label={
                  set.done
                    ? `Mark set ${si + 1} as incomplete`
                    : `Mark set ${si + 1} as complete`
                }
              >
                <Check size={18} strokeWidth={set.done ? 3 : 2} />
              </button>

              {/* Progressive Overload Indicator */}
              {ghostData?.sets[si] && set.weight && (
                <div className="absolute -right-1 -top-1" aria-hidden="true">
                  {Number(set.weight) > ghostData.sets[si].weight ? (
                    <span className="flex items-center text-[9px] bg-neon-green/20 text-neon-green px-1 rounded-full border border-neon-green/30 font-bold">
                      <TrendingUp size={9} className="mr-0.5" /> +PR
                    </span>
                  ) : Number(set.weight) < ghostData.sets[si].weight ? (
                    <TrendingDown size={10} className="text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {/* Add/Remove set buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border-slate/40 mt-2 px-1">
            <button
              type="button"
              onClick={() => removeSet(exerciseIndex, sets.length - 1)}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none px-2 py-1 rounded-lg"
              disabled={sets.length <= 1}
              aria-label="Remove last set"
            >
              <Minus size={13} /> Remove Set
            </button>
            <button
              type="button"
              onClick={() => addSet(exerciseIndex)}
              className="text-xs text-neon-cyan font-semibold hover:text-neon-cyan/80 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none bg-neon-cyan/10 px-3 py-1 rounded-lg border border-neon-cyan/20"
              aria-label="Add a set"
            >
              <Plus size={13} /> Add Set
            </button>
          </div>
        </div>
      </div>

      {/* ═══ INTERACTIVE TECHNIQUE & ANATOMY MICRO-MODAL ═══ */}
      {showTechniqueModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowTechniqueModal(false)}
          >
            <div
              className="relative bg-bg-surface w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-border-slate shadow-2xl overflow-hidden animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer handle for mobile */}
              <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-slate bg-bg-deep/70">
                <div className="flex items-center gap-2 min-w-0">
                  <Activity size={18} className="text-neon-cyan shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-base truncate">
                      {exercise.name}
                    </h3>
                    {exercise.nameAr && (
                      <p className="text-xs text-slate-400 truncate" dir="rtl">
                        {exercise.nameAr}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTechniqueModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all ml-2"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Anatomy & Biomechanics Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
                {/* 1. Large High-Clarity Anatomical Illustration */}
                <div className="w-full aspect-[2/1] rounded-2xl bg-[#0B0F17] border border-border-slate flex items-center justify-center p-2 overflow-hidden shadow-inner relative">
                  <img
                    src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                    alt={exercise.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getImageUrl("/icons/dumbbell.svg");
                    }}
                  />
                  {exercise.targetAngle && (
                    <div className="absolute top-3 right-3">
                      <AngleBadge angle={exercise.targetAngle} />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
                    <span className="rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Start
                    </span>
                    <span className="rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Finish
                    </span>
                  </div>
                </div>

                {/* 2. Target Muscle Head & Synergists Badges */}
                <div className="bg-bg-deep/60 p-3.5 rounded-xl border border-border-slate space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      Primary Target:
                    </span>
                    <span className="text-neon-cyan font-bold bg-neon-cyan/10 px-2.5 py-0.5 rounded-md border border-neon-cyan/25">
                      {exercise.primaryTarget || exercise.muscle}
                    </span>
                  </div>

                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                        Synergists:
                      </span>
                      {exercise.secondaryMuscles.map((sec, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[11px] border border-slate-700/60"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}

                  {exercise.jointAction && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <strong className="text-slate-300">Biomechanical Action:</strong> {exercise.jointAction}
                    </p>
                  )}
                </div>

                {/* 3. Execution Cues & Joint Alignment */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Check size={14} className="text-neon-green" />
                    Biomechanical Execution Cues
                  </h4>
                  <div className="bg-bg-deep/40 rounded-xl p-3 border border-border-slate space-y-2">
                    {exercise.setupAlignment && (
                      <p className="text-slate-300 font-medium pb-1.5 border-b border-slate-800/80">
                        <span className="text-neon-cyan font-bold">Setup: </span>
                        {exercise.setupAlignment}
                      </p>
                    )}
                    {Array.isArray(exercise.executionCues) && exercise.executionCues.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-300">
                        {exercise.executionCues.map((cue, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-neon-cyan/10 text-neon-cyan font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{cue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-300 leading-relaxed">{exercise.tips}</p>
                    )}
                  </div>
                </div>

                {/* 4. Common Biomechanical Mistakes */}
                {Array.isArray(exercise.commonMistakes) && exercise.commonMistakes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" />
                      Common Mistakes to Avoid
                    </h4>
                    <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20 space-y-1.5">
                      {exercise.commonMistakes.map((mistake, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-amber-200/90 text-[11px]">
                          <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                          <span>{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Watch Video Tutorial Link */}
                <div className="pt-2">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold border border-slate-700 transition-all active:scale-[0.98]"
                  >
                    <PlayCircle size={16} className="text-red-400" />
                    <span>Watch Form Video Tutorial (YouTube)</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Close footer */}
              <div className="p-3 border-t border-border-slate bg-bg-deep/80 text-center">
                <button
                  type="button"
                  onClick={() => setShowTechniqueModal(false)}
                  className="w-full py-2.5 rounded-xl bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan font-bold transition-colors"
                >
                  Return to Workout / العودة للتمرين
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Swap Modal */}
      <SwapExerciseModal
        isOpen={showSwap}
        onClose={() => setShowSwap(false)}
        exerciseIndex={exerciseIndex}
        currentExerciseId={exerciseId}
      />
    </>
  );
}

export default memo(ExerciseCard);
