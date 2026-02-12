import { useState } from "react";
import { X, ArrowLeftRight, Search, Dumbbell } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";

export default function SwapExerciseModal({
  isOpen,
  onClose,
  exerciseIndex,
  currentExerciseId,
}) {
  const exercises = useWorkoutStore((s) => s.exercises);
  const swapExercise = useWorkoutStore((s) => s.swapExercise);
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);
  const [search, setSearch] = useState("");
  const [permanent, setPermanent] = useState(false);

  if (!isOpen) return null;

  const currentExercise = getExerciseById(currentExerciseId);
  const targetMuscle = currentExercise?.muscle || "";

  // Filter by same muscle, exclude current
  const alternatives = exercises.filter(
    (ex) =>
      ex.muscle === targetMuscle &&
      ex.id !== currentExerciseId &&
      ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (newExerciseId) => {
    swapExercise(exerciseIndex, newExerciseId, permanent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md max-h-[80vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-neon-blue" />
            <h3 className="text-base font-semibold text-white">
              Swap Exercise
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current exercise info */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
            Replacing
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0">
              {currentExercise?.image ? (
                <img
                  src={getImageUrl(currentExercise.image)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Dumbbell size={14} />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-white">
              {currentExercise?.name}
            </span>
            <span className="text-[10px] text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded-full border border-neon-blue/20">
              {targetMuscle}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search alternatives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Alternatives list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2 scrollbar-hide">
          {alternatives.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No alternatives found for {targetMuscle}
            </div>
          ) : (
            alternatives.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-neon-blue/40 hover:bg-slate-800 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                  {ex.image ? (
                    <img
                      src={getImageUrl(ex.image)}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Dumbbell size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {ex.name}
                  </p>
                  {ex.tips && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {ex.tips}
                    </p>
                  )}
                </div>
                <ArrowLeftRight size={14} className="text-slate-600 shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer with permanent toggle */}
        <div className="p-4 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                permanent
                  ? "bg-neon-blue border-neon-blue"
                  : "border-slate-600 group-hover:border-slate-400"
              }`}
              onClick={() => setPermanent(!permanent)}
            >
              {permanent && (
                <svg
                  className="w-3 h-3 text-slate-950"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Also update this routine permanently
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
