import { memo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Ghost,
  Check,
  Plus,
  Minus,
  Info,
  ArrowLeftRight,
  X,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import SwapExerciseModal from "./SwapExerciseModal";

function ExerciseCard({ exerciseIndex, exerciseData }) {
  const { exerciseId, sets } = exerciseData;
  const exercise = useWorkoutStore((s) => s.getExerciseById(exerciseId));
  const ghostData = useWorkoutStore((s) => s.getGhostData(exerciseId));
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const [showSwap, setShowSwap] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!exercise) return null;

  const pr = personalRecords[exerciseId];

  return (
    <>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Exercise Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <button
            onClick={() => exercise.image && setShowImageModal(true)}
            className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 transition-transform active:scale-95"
            aria-label={`View ${exercise.name} details`}
            title="Click to view details"
          >
            {exercise.image ? (
              <img
                src={getImageUrl(exercise.image)}
                alt={exercise.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <ArrowLeftRight size={18} />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">
              {exercise.name}
            </h3>
            <p className="text-xs text-slate-500">{exercise.muscle}</p>
            {pr && (
              <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                PR: {pr} kg
              </p>
            )}
          </div>
          {/* Swap button */}
          <button
            onClick={() => setShowSwap(true)}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-neon-blue/10 hover:text-neon-blue text-slate-500 transition-all active:scale-90"
            aria-label={`Swap ${exercise.name} for another exercise`}
            title="Swap exercise"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* Ghost Replay */}
        {ghostData && (
          <div className="px-4 py-2 bg-neon-purple/5 border-b border-slate-800/50 flex items-start gap-2">
            <Ghost size={14} className="text-neon-purple mt-0.5 shrink-0" />
            <div className="text-xs text-slate-400">
              <span className="text-neon-purple font-medium">
                Last session ({ghostData.date}):{" "}
              </span>
              {ghostData.sets.map((s, i) => (
                <span key={i} className="text-slate-400">
                  {i > 0 && " → "}
                  {s.weight}kg × {s.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <details className="border-b border-slate-800/50 group">
          <summary className="px-4 py-2 text-xs text-slate-500 cursor-pointer hover:text-slate-300 flex items-center gap-1.5 select-none">
            <Info size={12} />
            How to perform
          </summary>
          <p className="px-4 pb-3 text-xs text-slate-400 leading-relaxed">
            {exercise.tips}
          </p>
        </details>

        {/* Sets Table */}
        <div className="p-4 space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[11px] text-slate-500 uppercase tracking-wider font-medium px-1">
            <span>Set</span>
            <span>KG</span>
            <span>Reps</span>
            <span className="text-center">✓</span>
          </div>

          {/* Set rows */}
          {sets.map((set, si) => (
            <div
              key={si}
              className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center transition-all ${
                set.done ? "opacity-60" : ""
              }`}
            >
              <span className="text-xs text-slate-500 font-mono pl-1">
                {si + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={ghostData?.sets[si]?.weight || "—"}
                  value={set.weight}
                  onChange={(e) =>
                    updateSet(exerciseIndex, si, "weight", e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
                  disabled={set.done}
                />
                {ghostData?.sets[si] && (
                  <span className="text-[11px] text-slate-500 pl-1 truncate">
                    {ghostData.sets[si].weight}kg
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={ghostData?.sets[si]?.reps || "—"}
                  value={set.reps}
                  onChange={(e) =>
                    updateSet(exerciseIndex, si, "reps", e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
                  disabled={set.done}
                />
                {ghostData?.sets[si] && (
                  <span className="text-[11px] text-slate-500 pl-1 truncate">
                    {ghostData.sets[si].reps} reps
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleSetDone(exerciseIndex, si)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none ${
                  set.done
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600"
                }`}
                aria-label={
                  set.done
                    ? `Mark set ${si + 1} as incomplete`
                    : `Mark set ${si + 1} as complete`
                }
              >
                <Check size={16} strokeWidth={set.done ? 3 : 2} />
              </button>
            </div>
          ))}

          {/* Add/Remove set buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => removeSet(exerciseIndex, sets.length - 1)}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
              disabled={sets.length <= 1}
              aria-label="Remove last set"
            >
              <Minus size={14} /> Remove
            </button>
            <button
              onClick={() => addSet(exerciseIndex)}
              className="text-xs text-neon-blue hover:text-neon-blue/80 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
              aria-label="Add a set"
            >
              <Plus size={14} /> Add Set
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Large image */}
              <div className="w-full aspect-square bg-slate-800">
                <img
                  src={getImageUrl(exercise.image)}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-lg">
                  {exercise.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{exercise.muscle}</p>
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-neon-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neon-blue font-medium mb-1">
                      How to perform
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
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
