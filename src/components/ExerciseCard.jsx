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

// Set-type tag styles: W = warm-up (excluded from volume/PRs), N = normal, F = failure
const SET_TYPE_META = {
  W: {
    label: "W",
    nameAr: "إحماء",
    nameEn: "Warm-up",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  N: {
    label: "N",
    nameAr: "عادية",
    nameEn: "Normal",
    badge: "bg-slate-800 text-slate-300 border-slate-600/70",
  },
  F: {
    label: "F",
    nameAr: "فشل عضلي",
    nameEn: "Failure",
    badge: "bg-rose-600/15 text-rose-400 border-rose-600/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]",
  },
};

const SET_GRID = "grid grid-cols-[1.5rem_2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 items-center";

function ExerciseCard({ exerciseIndex, exerciseData, onAllSetsComplete }) {
  const { exerciseId, sets } = exerciseData;
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const getGhostData = useWorkoutStore((s) => s.getGhostData);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const cycleSetType = useWorkoutStore((s) => s.cycleSetType);
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
  // Working sets only — warm-up sets are excluded from previous-performance baselines.
  const ghostData = useMemo(() => {
    if (!history.length) return null;
    const ghost = getGhostData(exerciseId);
    if (!ghost) return null;
    const workingSets = ghost.sets.filter((s) => s.type !== "W");
    if (!workingSets.length) return null;
    return { ...ghost, sets: workingSets };
  }, [getGhostData, exerciseId, history]);

  if (!exercise) return null;

  const handleToggleDone = (si) => {
    const set = sets[si];
    // If fields empty, auto-fill from ghost data or defaults for fast mobile logging
    if (!set.done) {
      if (!set.weight && ghostData?.sets[si]?.weight) {
        updateSet(exerciseIndex, si, "weight", ghostData.sets[si].weight);
      }
      if (!set.reps) {
        updateSet(
          exerciseIndex,
          si,
          "reps",
          ghostData?.sets[si]?.reps || exercise.default_reps || 10,
        );
      }
      navigator.vibrate?.(50);
      haptics.light();
    }
    toggleSetDone(exerciseIndex, si);

    // Auto-advance: the just-completed set was the final one and every set is now done.
    if (!set.done && onAllSetsComplete) {
      const allDone =
        sets.length > 0 &&
        sets.every((s, idx) => s.done || idx === si);
      if (allDone) onAllSetsComplete();
    }
  };

  return (
    <>
      <div className="glass-card overflow-hidden shadow-xl shadow-black/40 border border-border-slate transition-all">
        <div className="p-3 space-y-3 border-b border-border-slate">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">{exercise.name}</h3>
              {exercise.nameAr && <p className="mt-1 text-[11px] text-slate-400" dir="rtl">{exercise.nameAr}</p>}
            </div>
            <button type="button" onClick={() => setShowSwap(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors" aria-label={`Swap ${exercise.name} for another exercise`}>
              <ArrowLeftRight size={16} />
            </button>
          </div>
          {/* Tight 2:1 framing — matches the 768×384 dual-frame sources with zero letterboxing */}
          <div className="w-full aspect-[2/1] overflow-hidden rounded-xl border border-border-slate bg-[#0B0F17]">
            <ExerciseImage exercise={exercise} className="h-full w-full" zoomable />
          </div>
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

        {/* Previous performance (working sets only) */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border-slate/50 bg-bg-deep/40 text-[10px]">
          <span className="text-slate-500">Previous Performance</span>
          <span className="text-slate-300 font-mono truncate tabular-nums">
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
          <div className={`${SET_GRID} text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-1 pb-1.5 border-b border-border-slate/50`}>
            <span className="text-center">Set</span>
            <span className="text-center">Type</span>
            <span className="text-center">Weight (kg)</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>

          {/* Set Rows */}
          {sets.map((set, si) => {
            const typeMeta = SET_TYPE_META[set.type || "N"];
            return (
              <div
                key={si}
                className={`${SET_GRID} p-2 rounded-2xl relative ${
                  set.type === "F"
                    ? "border border-rose-600/30 bg-rose-600/[0.04]"
                    : set.done
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

                {/* Set Type Tag (tap to cycle N → W → F) */}
                <button
                  type="button"
                  onClick={() => {
                    cycleSetType(exerciseIndex, si);
                    haptics.light();
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black border transition-all active:scale-90 ${typeMeta.badge}`}
                  aria-label={`Set ${si + 1} type: ${typeMeta.nameEn}. Tap to change`}
                  title={`${typeMeta.nameEn} / ${typeMeta.nameAr}`}
                >
                  {typeMeta.label}
                </button>

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
                  onClick={() => handleToggleDone(si)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all btn-press focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:outline-none ${
                    set.done ? "animate-set-complete " : ""
                  }${
                    set.done
                      ? "bg-neon-emerald text-bg-deep font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : set.type === "F"
                        ? "bg-rose-950/60 text-rose-300 border border-rose-600/40"
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
                {ghostData?.sets[si] && set.weight && (set.type || "N") !== "W" && (
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
            );
          })}

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

          {/* Set-type legend */}
          <p className="text-[9px] text-slate-500 pt-1 px-1">
            <span className="text-amber-400 font-semibold">W</span> Warm-up (excluded from volume & PRs) ·{" "}
            <span className="text-slate-300 font-semibold">N</span> Normal ·{" "}
            <span className="text-rose-400 font-semibold">F</span> Failure — tap the Type badge to cycle
          </p>
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
