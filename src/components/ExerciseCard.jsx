import { memo, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Ghost,
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
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [showSwap, setShowSwap] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- exercises/history trigger re-computation
  const exercise = useMemo(() => getExerciseById(exerciseId), [getExerciseById, exerciseId, exercises]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ghostData = useMemo(() => getGhostData(exerciseId), [getGhostData, exerciseId, history]);

  if (!exercise) return null;

  const pr = personalRecords[exerciseId];

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

  return (
    <>
      <div className="glass-card overflow-hidden shadow-xl shadow-black/40 border border-border-slate transition-all">
        {/* Exercise Header */}
        <div className="flex items-center gap-3.5 p-4 border-b border-border-slate/60 bg-bg-surface/60">
          <button
            onClick={() => setShowImageModal(true)}
            className="w-14 h-14 rounded-2xl overflow-hidden bg-[#121824] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-transform active:scale-95 border border-[#1E293B] shadow-md flex items-center justify-center"
            aria-label={`View ${exercise.name} details`}
            title="Click to view details"
          >
            <img
              src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
              alt={exercise.name}
              className="w-12 h-12 rounded-lg object-contain bg-[#0B0F17] border border-[#1E293B] p-1"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getImageUrl("/icons/dumbbell.svg");
              }}
            />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate text-[15px] tracking-tight">
              {exercise.name}
            </h3>
            {exercise.nameAr && (
              <p className="text-[11px] text-slate-400 font-medium truncate" dir="rtl">
                {exercise.nameAr}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                {exercise.muscle}
              </span>
              {exercise.targetAngle && (
                <AngleBadge angle={exercise.targetAngle} size="sm" />
              )}
              {pr && (
                <span className="text-[10px] text-amber-accent font-bold flex items-center gap-1 bg-amber-accent/10 px-2 py-0.5 rounded-md border border-amber-accent/20">
                  🏆 {pr} kg
                </span>
              )}
            </div>
          </div>
          {/* Swap button */}
          <button
            onClick={() => setShowSwap(true)}
            className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-neon-cyan/15 hover:text-neon-cyan text-slate-400 transition-all active:scale-90 border border-slate-700/50"
            aria-label={`Swap ${exercise.name} for another exercise`}
            title="تبديل التمرين"
          >
            <ArrowLeftRight size={17} />
          </button>
        </div>

        {/* Ghost Replay Banner */}
        {ghostData && (
          <div className="px-4 py-2 bg-vivid-purple/8 border-b border-border-slate/50 flex items-center gap-2">
            <Ghost size={14} className="text-vivid-purple shrink-0" />
            <div className="text-xs text-slate-300 flex-1 truncate">
              <span className="text-vivid-purple font-semibold">
                Previous ({ghostData.date}):{" "}
              </span>
              {ghostData.sets.map((s, i) => (
                <span key={i} className="text-slate-400 font-mono">
                  {i > 0 && " | "}
                  <strong className="text-slate-200">{s.weight}</strong>kg × <strong className="text-slate-200">{s.reps}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Form Tips + Video */}
        <details className="border-b border-border-slate/50 group">
          <summary className="px-4 py-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 flex items-center gap-1.5 select-none font-medium">
            <Info size={13} className="text-neon-cyan" />
            How to perform / التكنيك
          </summary>
          <div className="px-4 pb-3 space-y-2 bg-bg-deep/40 pt-1">
            <p className="text-xs text-slate-300 leading-relaxed">
              {exercise.tips}
            </p>
            {exercise.video && (
              <a
                href={exercise.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-neon-cyan hover:underline transition-colors font-semibold"
              >
                <ExternalLink size={11} />
                Watch form tutorial video
              </a>
            )}
          </div>
        </details>

        {/* Sets Table */}
        <div className="p-4 space-y-2.5">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold px-1 pb-1.5 border-b border-border-slate/50">
            <span id={`set-header-${exerciseId}`}>Set</span>
            <span id={`kg-header-${exerciseId}`}>Weight (KG)</span>
            <span id={`reps-header-${exerciseId}`}>Reps</span>
            <span className="text-center" id={`done-header-${exerciseId}`}>
              Log
            </span>
          </div>

          {/* Set rows */}
          {sets.map((set, si) => (
            <div
              key={si}
              className={`grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 items-center transition-all relative py-1 rounded-xl px-1 ${
                set.done
                  ? "bg-neon-emerald/5 border border-neon-emerald/20 opacity-75"
                  : "bg-bg-deep/50 border border-border-slate/60 hover:border-slate-700"
              }`}
            >
              {/* Set index badge */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {si + 1}
                </span>
              </div>

              {/* Weight Input + Steppers */}
              <div className="relative flex items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder={ghostData?.sets[si]?.weight ? `${ghostData.sets[si].weight}` : "—"}
                  value={set.weight}
                  onChange={(e) =>
                    updateSet(exerciseIndex, si, "weight", e.target.value)
                  }
                  className="w-full bg-slate-900/90 border border-border-slate rounded-lg pl-2.5 pr-6 py-2 text-sm text-white font-mono font-semibold placeholder:text-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-colors"
                  disabled={set.done}
                  aria-label={`Set ${si + 1} weight in kg`}
                  aria-describedby={`kg-header-${exerciseId}`}
                />
                {!set.done && (
                  <div className="absolute right-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => adjustWeight(si, 2.5)}
                      className="text-slate-500 hover:text-neon-cyan p-0.5 transition-colors"
                      title="+2.5 kg"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustWeight(si, -2.5)}
                      className="text-slate-500 hover:text-neon-cyan p-0.5 transition-colors"
                      title="-2.5 kg"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Reps Input + Steppers */}
              <div className="relative flex items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={ghostData?.sets[si]?.reps ? `${ghostData.sets[si].reps}` : `${exercise.default_reps || 10}`}
                  value={set.reps}
                  onChange={(e) =>
                    updateSet(exerciseIndex, si, "reps", e.target.value)
                  }
                  className="w-full bg-slate-900/90 border border-border-slate rounded-lg pl-2.5 pr-6 py-2 text-sm text-white font-mono font-semibold placeholder:text-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-colors"
                  disabled={set.done}
                  aria-label={`Set ${si + 1} reps`}
                  aria-describedby={`reps-header-${exerciseId}`}
                />
                {!set.done && (
                  <div className="absolute right-1 flex flex-col">
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
                  if (!set.done) haptics.light();
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
              onClick={() => removeSet(exerciseIndex, sets.length - 1)}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none px-2 py-1 rounded-lg"
              disabled={sets.length <= 1}
              aria-label="Remove last set"
            >
              <Minus size={13} /> Remove Set
            </button>
            <button
              onClick={() => addSet(exerciseIndex)}
              className="text-xs text-neon-cyan font-semibold hover:text-neon-cyan/80 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none bg-neon-cyan/10 px-3 py-1 rounded-lg border border-neon-cyan/20"
              aria-label="Add a set"
            >
              <Plus size={13} /> Add Set
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative glass-card overflow-hidden shadow-2xl w-full max-w-sm border border-border-slate"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Large image */}
              <div className="w-full aspect-square bg-[#121824] flex items-center justify-center p-4 border-b border-border-slate">
                <img
                  src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImageUrl("/icons/dumbbell.svg");
                  }}
                />
              </div>

              {/* Info */}
              <div className="p-4 bg-bg-surface">
                <h3 className="font-bold text-white text-lg">
                  {exercise.name}
                </h3>
                {exercise.nameAr && (
                  <p className="text-xs text-slate-400 mb-2" dir="rtl">{exercise.nameAr}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-semibold">{exercise.muscle}</span>
                  {exercise.targetAngle && <AngleBadge angle={exercise.targetAngle} />}
                </div>
                <div className="flex items-start gap-2 bg-bg-deep/60 p-3 rounded-xl border border-border-slate">
                  <Info size={15} className="text-neon-cyan mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neon-cyan font-bold mb-1">
                      Biomechanical Cue
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {exercise.tips}
                    </p>
                  </div>
                </div>
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
