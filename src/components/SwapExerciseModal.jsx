import { useState, useMemo } from "react";
import { X, ArrowLeftRight, Search, Dumbbell, Filter, ChevronDown, Check } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import { getAngleLabel } from "../utils/angleUtils";
import AngleBadge from "./AngleBadge";

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
  const [showAllMuscle, setShowAllMuscle] = useState(false);

  const currentExercise = useMemo(() => {
    return isOpen ? getExerciseById(currentExerciseId) : null;
  }, [isOpen, getExerciseById, currentExerciseId]);

  const targetMuscle = currentExercise?.primaryMuscle || currentExercise?.muscle?.toLowerCase() || "";
  const targetAngle = currentExercise?.targetAngle || "";

  // Filter: by default only same primaryMuscle + same targetAngle
  // Toggle: show all for the same primaryMuscle
  const alternatives = useMemo(() => {
    if (!isOpen) return [];
    return exercises.filter((ex) => {
      if (ex.id === currentExerciseId) return false;

      const exMuscle = ex.primaryMuscle || ex.muscle?.toLowerCase() || "";
      if (exMuscle !== targetMuscle) return false;

      if (!showAllMuscle && targetAngle && ex.targetAngle !== targetAngle) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          (ex.nameAr && ex.nameAr.includes(q))
        );
      }
      return true;
    });
  }, [exercises, currentExerciseId, targetMuscle, targetAngle, showAllMuscle, search, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (newExerciseId) => {
    swapExercise(exerciseIndex, newExerciseId, permanent);
    setSearch("");
    setShowAllMuscle(false);
    onClose();
  };

  const angleLabel = getAngleLabel(targetAngle);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-bg-surface w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-border-slate shadow-2xl shadow-black/80 animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ Drawer Drag Handle (Mobile) ═══ */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-slate">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                تبديل التمرين
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Smart Angle-Matched Swap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ═══ Current exercise info ═══ */}
        <div className="px-5 pt-3 pb-2 bg-bg-deep/40">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
            Replacing Target Exercise
          </p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-border-slate">
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#0B0F17] shrink-0 border border-[#1E293B] flex items-center justify-center p-1">
              <img
                src={getImageUrl(currentExercise?.image || (currentExercise?.id ? `/exercises/${currentExercise.id}.png` : "/exercises/default.png"))}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getImageUrl("/icons/dumbbell.svg");
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {currentExercise?.name}
              </p>
              {currentExercise?.nameAr && (
                <p className="text-[11px] text-slate-400 truncate" dir="rtl">
                  {currentExercise.nameAr}
                </p>
              )}
            </div>
            {targetAngle && <AngleBadge angle={targetAngle} />}
          </div>
        </div>

        {/* ═══ Search & Angle Filter Controls ═══ */}
        <div className="px-5 py-2.5 space-y-2.5">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search biomechanical alternatives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-deep/80 border border-border-slate rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/30 placeholder:text-slate-500 transition-all"
            />
          </div>

          {/* Toggle: show all for muscle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAllMuscle(!showAllMuscle)}
              className={`flex items-center gap-2 text-xs font-semibold transition-all px-3 py-1.5 rounded-lg border ${
                showAllMuscle
                  ? "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30"
                  : "text-slate-400 bg-slate-800/60 border-slate-700/60 hover:text-white"
              }`}
            >
              <Filter size={12} />
              {showAllMuscle
                ? `Showing all ${targetMuscle.toUpperCase()} exercises`
                : `Showing ${angleLabel.en} only`}
              <ChevronDown
                size={12}
                className={`transition-transform ${showAllMuscle ? "rotate-180" : ""}`}
              />
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              {alternatives.length} match{alternatives.length === 1 ? "" : "es"}
            </span>
          </div>
        </div>

        {/* ═══ Alternatives list ═══ */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2.5 custom-scrollbar min-h-[180px]">
          {alternatives.length === 0 ? (
            <div className="text-center py-10 space-y-2.5">
              <Dumbbell size={32} className="mx-auto text-slate-700" />
              <p className="text-sm text-slate-400 font-medium">
                No direct alternatives found for this angle
              </p>
              {!showAllMuscle && (
                <button
                  onClick={() => setShowAllMuscle(true)}
                  className="text-xs text-neon-cyan hover:underline font-semibold"
                >
                  Show all {targetMuscle} exercises →
                </button>
              )}
            </div>
          ) : (
            alternatives.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex.id)}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl glass-card glass-card-hover text-left active:scale-[0.98] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0F17] shrink-0 border border-[#1E293B] p-1 flex items-center justify-center">
                  <img
                    src={getImageUrl(ex.image || `/exercises/${ex.id}.png`)}
                    alt={ex.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getImageUrl("/icons/dumbbell.svg");
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-neon-cyan transition-colors">
                    {ex.name}
                  </p>
                  {ex.nameAr && (
                    <p className="text-[11px] text-slate-400 truncate" dir="rtl">
                      {ex.nameAr}
                    </p>
                  )}
                  {ex.tips && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {ex.tips}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {ex.targetAngle && <AngleBadge angle={ex.targetAngle} size="sm" />}
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                    {ex.category}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ═══ Footer with permanent toggle ═══ */}
        <div className="p-4 border-t border-border-slate bg-bg-deep/80 backdrop-blur-md">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                permanent
                  ? "bg-neon-cyan border-neon-cyan text-bg-deep shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  : "border-slate-600 bg-slate-800/80 group-hover:border-slate-400"
              }`}
              onClick={() => setPermanent(!permanent)}
            >
              {permanent && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="text-xs">
              <span className="text-slate-300 font-medium">
                Save as permanent routine override
              </span>
              <p className="text-[10px] text-slate-500">
                Preserves default split while updating future sessions
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
