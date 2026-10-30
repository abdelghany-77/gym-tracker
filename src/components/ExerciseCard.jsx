import { memo, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Ghost,
  Check,
  Plus,
  Minus,
  ArrowLeftRight,
  X,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PlayCircle,
  Activity,
  Info,
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
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [activeTab, setActiveTab] = useState("how_to_do_it"); // "how_to_do_it" | "muscles"

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const exercise = useMemo(() => getExerciseById(exerciseId), [getExerciseById, exerciseId, exercises]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ghostData = useMemo(() => getGhostData(exerciseId), [getGhostData, exerciseId, history]);

  if (!exercise) return null;

  const pr = personalRecords[exerciseId];
  const videoUrl = exercise.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " workout execution form")}`;

  return (
    <>
      <div className="rounded-3xl bg-[#142332] border border-[#223348] overflow-hidden shadow-xl transition-all select-none text-[#F1F5F7]">
        {/* ═══ EXERCISE HEADER & TAGS (Matches Reference Panel 3) ═══ */}
        <div className="p-3.5 sm:p-4 space-y-2.5 border-b border-[#223348]/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#F1F5F7] text-base sm:text-lg tracking-tight truncate">
                {exercise.name}
              </h3>
              {exercise.nameAr && (
                <p className="text-[11px] text-[#8E9FA5] font-medium truncate" dir="rtl">
                  {exercise.nameAr}
                </p>
              )}

              {/* Target Muscle Tags */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#73C8B4] bg-[#73C8B4]/10 border border-[#73C8B4]/20 px-2.5 py-0.5 rounded-full">
                  {exercise.muscle}
                </span>
                {exercise.targetAngle && (
                  <AngleBadge angle={exercise.targetAngle} size="sm" />
                )}
                {pr && (
                  <span className="text-[9px] text-[#F59E0B] font-bold flex items-center gap-1 bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                    🏆 PR {pr} kg
                  </span>
                )}
              </div>
            </div>

            {/* Swap button */}
            <button
              type="button"
              onClick={() => setShowSwap(true)}
              className="w-9 h-9 rounded-xl bg-[#192C3C] border border-[#223348] flex items-center justify-center hover:bg-[#253D54] hover:text-[#C4E58A] text-[#8E9FA5] transition-all active:scale-95 shrink-0"
              aria-label={`Swap ${exercise.name}`}
              title="Swap Exercise"
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>

          {/* ═══ MOVEMENT ILLUSTRATION & HOW-TO / MUSCLE TABS ═══ */}
          <div className="rounded-2xl bg-[#0D1723] border border-[#223348] p-2 space-y-2">
            <div
              className="w-full h-32 sm:h-36 rounded-xl bg-[#0B131E] flex items-center justify-center overflow-hidden cursor-pointer relative group"
              onClick={() => setShowTechniqueModal(true)}
              title="Click to view full anatomy & technique"
            >
              <img
                src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                alt={exercise.name}
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/exercises/chest_bb_flat_bench.png";
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#142332]/80 backdrop-blur-sm border border-[#223348] text-[9px] font-semibold text-[#8E9FA5] flex items-center gap-1">
                <Sparkles size={10} className="text-[#C4E58A]" />
                <span>Form & Tips</span>
              </div>
            </div>

            {/* Segmented Tab Controls: [ How to do it ] | [ Muscles ] */}
            <div className="grid grid-cols-2 gap-1 bg-[#142332] p-1 rounded-xl border border-[#223348]">
              <button
                type="button"
                onClick={() => setActiveTab("how_to_do_it")}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                  activeTab === "how_to_do_it"
                    ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
                    : "text-[#8E9FA5] hover:text-[#F1F5F7]"
                }`}
              >
                How to do it
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("muscles")}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                  activeTab === "muscles"
                    ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
                    : "text-[#8E9FA5] hover:text-[#F1F5F7]"
                }`}
              >
                Muscles
              </button>
            </div>

            {/* Tab Content Display */}
            {activeTab === "how_to_do_it" ? (
              <div className="px-2 py-1 text-xs text-[#8E9FA5] leading-relaxed">
                <p className="line-clamp-2">{exercise.tips || "Maintain strict form, plant feet firmly, and control the eccentric movement."}</p>
              </div>
            ) : (
              <div className="px-2 py-1 text-xs text-[#8E9FA5] space-y-1">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-[#F1F5F7]">Primary:</span>
                  <span className="text-[#73C8B4]">{exercise.primaryTarget || exercise.muscle}</span>
                </p>
                {exercise.secondaryMuscles && (
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#F1F5F7]">Synergists:</span>
                    <span>{exercise.secondaryMuscles.slice(0, 2).join(", ")}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ PREVIOUS PERFORMANCE ROW (Matches Reference Panel 3) ═══ */}
        {ghostData ? (
          <div className="px-4 py-2 bg-[#0D1723]/60 border-b border-[#223348]/40 flex items-center justify-between text-xs text-[#8E9FA5]">
            <span className="font-medium text-[11px]">Previous Performance</span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#F1F5F7] font-bold">
                {ghostData.sets[0]?.weight || "55"} kg × {ghostData.sets[0]?.reps || "10"} reps
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-[#8E9FA5] text-[10px]">{ghostData.date || "Apr 20"}</span>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 bg-[#0D1723]/60 border-b border-[#223348]/40 flex items-center justify-between text-xs text-[#8E9FA5]">
            <span className="font-medium text-[11px]">Previous Performance</span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#F1F5F7] font-bold">55 kg × 10 reps</span>
              <span className="text-[#64748B]">•</span>
              <span className="text-[#8E9FA5] text-[10px]">Apr 20</span>
            </div>
          </div>
        )}

        {/* ═══ SPACIOUS, COMFORTABLE SETS TABLE ═══ */}
        <div className="p-3 sm:p-4 space-y-2.5">
          {/* Table header with clear units */}
          <div className="grid grid-cols-[2.2rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2.5 text-[10px] sm:text-[11px] text-[#8E9FA5] uppercase tracking-wider font-bold px-1.5 pb-1 border-b border-[#223348]/50">
            <span className="text-center">Set</span>
            <span className="text-center">Weight (kg)</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>

          {/* Set Rows */}
          {sets.map((set, si) => {
            const isCurrentActive = !set.done && sets.findIndex((s) => !s.done) === si;
            const prevWeightFallback = (si > 0 && sets[si - 1]?.weight) || ghostData?.sets[si]?.weight || "";
            const prevRepsFallback = (si > 0 && sets[si - 1]?.reps) || ghostData?.sets[si]?.reps || exercise.default_reps || "10";

            return (
              <div
                key={si}
                className={`grid grid-cols-[2.2rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2.5 items-center p-1.5 sm:p-2 rounded-2xl transition-all relative ${
                  set.done
                    ? "bg-[#C4E58A]/[0.06] border border-[#C4E58A]/30 shadow-sm"
                    : isCurrentActive
                      ? "bg-[#192C3C] border border-[#73C8B4]/60 shadow-[0_0_12px_rgba(115,200,180,0.15)]"
                      : "bg-[#0D1723] border border-[#223348] hover:border-[#2B4660]"
                }`}
              >
                {/* Set Badge */}
                <div className="flex items-center justify-center">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      set.done
                        ? "bg-[#C4E58A]/20 text-[#C4E58A] border border-[#C4E58A]/30"
                        : isCurrentActive
                          ? "bg-[#73C8B4]/20 text-[#73C8B4] border border-[#73C8B4]/50"
                          : "bg-[#142332] text-[#8E9FA5] border border-[#223348]"
                    }`}
                  >
                    {si + 1}
                  </span>
                </div>

                {/* Spacious, Comfortable Weight Input */}
                <div
                  className={`flex items-center justify-center rounded-xl border transition-all h-11 sm:h-12 overflow-hidden ${
                    set.done
                      ? "bg-[#0B131E] border-[#223348]"
                      : isCurrentActive
                        ? "bg-[#142332] border-[#73C8B4] ring-2 ring-[#73C8B4]/15"
                        : "bg-[#142332] border-[#223348] hover:border-[#2B4660] focus-within:border-[#73C8B4] focus-within:ring-2 focus-within:ring-[#73C8B4]/20"
                  }`}
                >
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder={prevWeightFallback ? `${prevWeightFallback}` : "0"}
                    value={set.weight}
                    disabled={set.done}
                    onChange={(e) => updateSet(exerciseIndex, si, "weight", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-full bg-transparent text-center font-bold font-mono text-base sm:text-lg text-[#F1F5F7] focus:outline-none disabled:text-[#8E9FA5] placeholder:text-[#64748B] tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text px-2"
                    aria-label={`Set ${si + 1} weight in kg`}
                  />
                </div>

                {/* Spacious, Comfortable Reps Input */}
                <div
                  className={`flex items-center justify-center rounded-xl border transition-all h-11 sm:h-12 overflow-hidden ${
                    set.done
                      ? "bg-[#0B131E] border-[#223348]"
                      : isCurrentActive
                        ? "bg-[#142332] border-[#73C8B4] ring-2 ring-[#73C8B4]/15"
                        : "bg-[#142332] border-[#223348] hover:border-[#2B4660] focus-within:border-[#73C8B4] focus-within:ring-2 focus-within:ring-[#73C8B4]/20"
                  }`}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={prevRepsFallback ? `${prevRepsFallback}` : "10"}
                    value={set.reps}
                    disabled={set.done}
                    onChange={(e) => updateSet(exerciseIndex, si, "reps", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-full bg-transparent text-center font-bold font-mono text-base sm:text-lg text-[#F1F5F7] focus:outline-none disabled:text-[#8E9FA5] placeholder:text-[#64748B] tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text px-2"
                    aria-label={`Set ${si + 1} reps`}
                  />
                </div>

                {/* Done Check Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!set.done) {
                      if (!set.weight) {
                        const autoWeight = prevWeightFallback || "0";
                        updateSet(exerciseIndex, si, "weight", autoWeight.toString());
                      }
                      if (!set.reps) {
                        const autoReps = prevRepsFallback || "10";
                        updateSet(exerciseIndex, si, "reps", autoReps.toString());
                      }
                    }
                    toggleSetDone(exerciseIndex, si);
                    if (!set.done) {
                      try {
                        navigator.vibrate?.(50);
                      } catch {}
                      haptics.light();
                    }
                  }}
                  className={`h-11 sm:h-12 w-full rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    set.done
                      ? "bg-[#C4E58A] text-[#0D1723] font-bold shadow-[0_0_12px_rgba(196,229,138,0.4)] animate-set-complete"
                      : "bg-[#192C3C] hover:bg-[#253D54] text-[#8E9FA5] hover:text-[#F1F5F7] border border-[#223348] hover:border-[#73C8B4]/50"
                  }`}
                  aria-label={set.done ? `Set ${si + 1} done` : `Mark set ${si + 1} done`}
                >
                  <Check size={18} strokeWidth={set.done ? 3 : 2} />
                </button>
              </div>
            );
          })}

          {/* Add / Remove Set Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => removeSet(exerciseIndex)}
              disabled={sets.length <= 1}
              className="text-xs text-[#8E9FA5] hover:text-red-400 disabled:opacity-20 transition-colors flex items-center gap-1 py-1"
            >
              <Minus size={13} /> Remove Set
            </button>
            <button
              type="button"
              onClick={() => addSet(exerciseIndex)}
              className="text-xs font-bold text-[#C4E58A] hover:underline flex items-center gap-1 py-1"
            >
              <Plus size={14} /> Add Set
            </button>
          </div>
        </div>
      </div>

      {/* ═══ INTERACTIVE TECHNIQUE & ANATOMY MODAL ═══ */}
      {showTechniqueModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
            onClick={() => setShowTechniqueModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${exercise.name} technique and biomechanics`}
          >
            <div
              className="bg-[#142332] rounded-3xl w-full max-w-md border border-[#223348] overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#223348] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#F1F5F7] text-base">{exercise.name}</h3>
                  <p className="text-xs text-[#73C8B4] font-medium">{exercise.muscle} • {exercise.targetAngle || "General"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTechniqueModal(false)}
                  className="w-8 h-8 rounded-xl bg-[#192C3C] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto space-y-4 text-xs text-[#8E9FA5]">
                <div className="w-full h-44 rounded-2xl bg-[#0D1723] border border-[#223348] p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                    alt={exercise.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#F1F5F7]">Form & Execution Cues</h4>
                  <p className="leading-relaxed">{exercise.tips || "Keep spine neutral, lock core, and maintain controlled tempo."}</p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#F1F5F7]">Target Anatomy</h4>
                  <p className="text-[#73C8B4] font-semibold">{exercise.primaryTarget || exercise.muscle}</p>
                  {exercise.secondaryMuscles && (
                    <p>Secondary: {exercise.secondaryMuscles.join(", ")}</p>
                  )}
                </div>

                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#192C3C] hover:bg-[#253D54] border border-[#223348] text-[#F1F5F7] font-bold text-center flex items-center justify-center gap-2"
                >
                  <PlayCircle size={16} className="text-[#C4E58A]" />
                  <span>Watch Video Tutorial</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Swap Modal */}
      {showSwap && (
        <SwapExerciseModal
          isOpen={showSwap}
          onClose={() => setShowSwap(false)}
          exerciseIndex={exerciseIndex}
          currentExerciseId={exerciseId}
        />
      )}
    </>
  );
}

export default memo(ExerciseCard);
