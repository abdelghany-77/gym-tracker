import { memo } from "react";
import { Ghost, Check, Plus, Minus, Info } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

/**
 * ExerciseCard — renders inside ActiveWorkout.
 * Shows exercise info, ghost data from last session, and editable sets.
 */
function ExerciseCard({ exerciseIndex, exerciseData }) {
  const { exerciseId, sets } = exerciseData;
  const exercise = useWorkoutStore((s) => s.getExerciseById(exerciseId));
  const ghostData = useWorkoutStore((s) => s.getGhostData(exerciseId));
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);

  if (!exercise) return null;

  const pr = personalRecords[exerciseId];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Exercise Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{exercise.name}</h3>
          <p className="text-xs text-slate-500">{exercise.muscle}</p>
          {pr && (
            <p className="text-[10px] text-amber-400 font-medium mt-0.5">
              PR: {pr} kg
            </p>
          )}
        </div>
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
        <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium px-1">
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
            <button
              onClick={() => toggleSetDone(exerciseIndex, si)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                set.done
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <Check size={16} strokeWidth={set.done ? 3 : 2} />
            </button>
          </div>
        ))}

        {/* Add/Remove set buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => removeSet(exerciseIndex, sets.length - 1)}
            className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30"
            disabled={sets.length <= 1}
          >
            <Minus size={14} /> Remove
          </button>
          <button
            onClick={() => addSet(exerciseIndex)}
            className="text-xs text-neon-blue hover:text-neon-blue/80 flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Add Set
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ExerciseCard);
