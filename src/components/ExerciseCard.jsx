import { memo, useState, useMemo } from "react";

import {
  Check,
  Plus,
  Minus,
  Info,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseImage from "./ExerciseImage";
import ExerciseDetails from "./ExerciseDetails";
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

  const exercise = useMemo(
    () =>
      exercises.find((item) => item.id === exerciseId) ||
      getExerciseById(exerciseId),
    [getExerciseById, exerciseId, exercises],
  );
  const ghostData = useMemo(
    () => (history.length ? getGhostData(exerciseId) : null),
    [getGhostData, exerciseId, history],
  );

  if (!exercise) return null;

  return (
    <>
      <div className="glass-card overflow-hidden shadow-xl shadow-black/40 border border-border-slate transition-all">
        <div className="p-3 space-y-3 border-b border-border-slate">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">{exercise.name}</h3>
              {exercise.nameAr && <p className="mt-1 text-[11px] text-slate-400" dir="rtl">{exercise.nameAr}</p>}
            </div>
            <button type="button" onClick={() => setShowSwap(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400" aria-label={`Swap ${exercise.name} for another exercise`}>
              <ArrowLeftRight size={16} />
            </button>
          </div>
          <button type="button" onClick={() => setShowTechniqueModal(true)} className="block h-[clamp(10rem,28dvh,16rem)] w-full overflow-hidden rounded-xl border border-border-slate" aria-label={`View ${exercise.name} technique and anatomy`}>
            <ExerciseImage exercise={exercise} className="h-full w-full" />
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">{exercise.muscle}</span>
              {exercise.targetAngle && <AngleBadge angle={exercise.targetAngle} size="sm" />}
            </div>
            <button type="button" onClick={() => setShowTechniqueModal(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan py-1">
              <Info size={13} /> Form & tips
            </button>
          </div>
        </div>

        {/* Previous performance */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border-slate/50 bg-bg-deep/40 text-[10px]">
          <span className="text-slate-500">Previous Performance</span>
          <span className="text-slate-300 font-mono truncate">
            {ghostData
              ? ghostData.sets
                  .map((s) => `${s.weight || 0} kg × ${s.reps || 0} reps`)
                  .join("  ·  ")
              : "No previous performance"}
          </span>
        </div>

        {/* Sets Table */}
        <div className="p-3 space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-1 pb-1.5 border-b border-border-slate/50">
            <span className="text-center">Set</span>
            <span className="text-center">Weight (kg)</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>

          {/* Set Rows */}
          {sets.map((set, si) => (
            <div
              key={si}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 items-center p-2 rounded-2xl relative ${
                set.done
                  ? "bg-neon-emerald/5 border border-neon-emerald/20"
                  : "bg-slate-800/30 border border-slate-700/40"
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

              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                placeholder={String(ghostData?.sets[si]?.weight ?? 0)}
                value={set.weight}
                disabled={set.done}
                onChange={(event) => updateSet(exerciseIndex, si, "weight", event.target.value)}
                className="h-11 min-w-0 w-full rounded-xl border border-slate-700/70 bg-bg-deep/60 px-2 text-center text-base font-semibold tabular-nums text-white placeholder:text-slate-500 focus:border-neon-cyan/60 focus:outline-none focus:shadow-none disabled:text-slate-400"
                aria-label={`Set ${si + 1} weight in kg`}
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder={String(ghostData?.sets[si]?.reps ?? exercise.default_reps ?? 10)}
                value={set.reps}
                disabled={set.done}
                onChange={(event) => updateSet(exerciseIndex, si, "reps", event.target.value)}
                className="h-11 min-w-0 w-full rounded-xl border border-slate-700/70 bg-bg-deep/60 px-2 text-center text-base font-semibold tabular-nums text-white placeholder:text-slate-500 focus:border-neon-cyan/60 focus:outline-none focus:shadow-none disabled:text-slate-400"
                aria-label={`Set ${si + 1} reps`}
              />

              {/* Done Check Button */}
              <button
                type="button"
                onClick={() => {
                  // If fields empty, auto-fill from ghost data or defaults for fast mobile logging
                  if (!set.done) {
                    if (!set.weight && ghostData?.sets[si]?.weight) {
                      updateSet(
                        exerciseIndex,
                        si,
                        "weight",
                        ghostData.sets[si].weight,
                      );
                    }
                    if (!set.reps) {
                      updateSet(
                        exerciseIndex,
                        si,
                        "reps",
                        ghostData?.sets[si]?.reps ||
                          exercise.default_reps ||
                          10,
                      );
                    }
                  }
                  toggleSetDone(exerciseIndex, si);
                  if (!set.done) {
                    navigator.vibrate?.(50);
                    haptics.light();
                  }
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all btn-press focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none ${
                  set.done ? "animate-set-complete " : ""
                }${
                  set.done
                    ? "bg-neon-emerald text-bg-deep font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
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

      <ExerciseDetails
        exercise={exercise}
        isOpen={showTechniqueModal}
        onClose={() => setShowTechniqueModal(false)}
      />

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
