import { memo, useState, useMemo } from "react";

import {
  Check,
  Plus,
  Minus,
  Info,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Copy,
  AlertTriangle,
  Disc3,
  StickyNote,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ActiveExerciseMediaPanel from "./ActiveExerciseMediaPanel";
import ExerciseDetails from "./ExerciseDetails";
import SwapExerciseModal from "./SwapExerciseModal";
import PlateCalculatorModal from "./PlateCalculatorModal";
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
    badge: "bg-rose-600/15 text-rose-400 border-rose-600/40",
  },
};

const SET_GRID =
  "grid grid-cols-[1.5rem_2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 items-center";

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
  const savedNote = useWorkoutStore((s) => s.exerciseNotes?.[exerciseId] || "");
  const setExerciseNote = useWorkoutStore((s) => s.setExerciseNote);
  const [showSwap, setShowSwap] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showQuickCues, setShowQuickCues] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

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

  // Live working volume & best estimated 1RM (Epley) for this exercise
  const liveStats = useMemo(() => {
    let workingVolume = 0;
    let bestE1rm = 0;
    for (const set of sets) {
      if (!set.done || set.type === "W") continue;
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      if (w > 0 && r > 0) {
        workingVolume += w * r;
        const e1rm = r === 1 ? w : Math.round(w * (1 + r / 30));
        if (e1rm > bestE1rm) bestE1rm = e1rm;
      }
    }
    return { workingVolume: Math.round(workingVolume), bestE1rm };
  }, [sets]);

  const activeSetIdx = useMemo(
    () => sets.findIndex((s) => !s.done),
    [sets],
  );

  if (!exercise) return null;

  const handleToggleDone = (si) => {
    const set = sets[si];
    // If fields empty, auto-fill from previous set, ghost data, or defaults for fast mobile logging
    if (!set.done) {
      const prevSet = si > 0 ? sets[si - 1] : null;
      if (!set.weight) {
        const fallbackWeight =
          ghostData?.sets[si]?.weight ?? prevSet?.weight ?? "";
        if (fallbackWeight) {
          updateSet(exerciseIndex, si, "weight", fallbackWeight);
        }
      }
      if (!set.reps) {
        updateSet(
          exerciseIndex,
          si,
          "reps",
          ghostData?.sets[si]?.reps ||
            prevSet?.reps ||
            exercise.default_reps ||
            10,
        );
      }
      navigator.vibrate?.(50);
      haptics.light();
    }
    toggleSetDone(exerciseIndex, si);

    // Auto-advance: the just-completed set was the final one and every set is now done.
    if (!set.done && onAllSetsComplete) {
      const allDone =
        sets.length > 0 && sets.every((s, idx) => s.done || idx === si);
      if (allDone) onAllSetsComplete();
    }
  };

  // One-tap auto-fill unfinished sets from previous session or first filled set
  const handleQuickFill = () => {
    const firstFilled = sets.find((s) => s.weight || s.reps);
    sets.forEach((set, idx) => {
      if (set.done) return;
      const targetWeight =
        ghostData?.sets[idx]?.weight ??
        ghostData?.sets[0]?.weight ??
        firstFilled?.weight ??
        "";
      const targetReps =
        ghostData?.sets[idx]?.reps ??
        ghostData?.sets[0]?.reps ??
        firstFilled?.reps ??
        exercise.default_reps ??
        10;
      if (!set.weight && targetWeight !== "") {
        updateSet(exerciseIndex, idx, "weight", String(targetWeight));
      }
      if (!set.reps && targetReps !== "") {
        updateSet(exerciseIndex, idx, "reps", String(targetReps));
      }
    });
    haptics.light();
  };

  // Micro weight nudge for the currently active (next incomplete) set
  const handleNudgeActiveWeight = (delta) => {
    if (activeSetIdx < 0) return;
    const set = sets[activeSetIdx];
    const base =
      Number(set.weight) ||
      Number(ghostData?.sets[activeSetIdx]?.weight) ||
      (activeSetIdx > 0 ? Number(sets[activeSetIdx - 1]?.weight) : 0) ||
      0;
    const next = Math.max(0, Math.round((base + delta) * 10) / 10);
    updateSet(exerciseIndex, activeSetIdx, "weight", String(next));
    haptics.light();
  };

  const hasQuickCues = Boolean(
    exercise.setupAlignment ||
      exercise.executionCues?.length > 0 ||
      exercise.commonMistakes?.length > 0,
  );

  return (
    <>
      <div className="glass-card overflow-hidden shadow-xl shadow-black/40 border border-slate-800 transition-all">
        <div className="p-3 space-y-3 border-b border-slate-800">
          {/* Exercise Title + Swap Action */}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {exercise.name}
              </h3>
              {exercise.nameAr && (
                <p className="mt-0.5 text-xs text-slate-400" dir="rtl" lang="ar">
                  {exercise.nameAr}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSwap(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              aria-label={`Swap ${exercise.name} for another exercise`}
              title="Swap for same-angle alternative"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          {/* Side-by-Side Image Slider + Continuous Video */}
          <ActiveExerciseMediaPanel exercise={exercise} />

          {/* Muscle / Angle + Inline Quick Cues & Full Details triggers */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">
                {exercise.muscle}
              </span>
              {exercise.equipment && (
                <span className="text-xs text-slate-400 capitalize">
                  · {exercise.equipment}
                </span>
              )}
              {exercise.targetAngle && (
                <AngleBadge angle={exercise.targetAngle} size="sm" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowNoteEditor((v) => !v)}
                aria-expanded={showNoteEditor}
                className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  savedNote
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                    : "border-slate-700/80 bg-slate-800/70 text-slate-200 hover:bg-slate-700"
                }`}
                title="Persistent personal note for this exercise"
              >
                <StickyNote size={13} aria-hidden="true" />
                {savedNote ? "Note" : "Add note"}
              </button>
              {hasQuickCues && (
                <button
                  type="button"
                  onClick={() => setShowQuickCues((v) => !v)}
                  aria-expanded={showQuickCues}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Quick cues
                  {showQuickCues ? (
                    <ChevronUp size={13} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={13} aria-hidden="true" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTechniqueModal(true)}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Info size={13} aria-hidden="true" /> Full guide
              </button>
            </div>
          </div>

          {/* Persistent Exercise Note preview or editor */}
          {savedNote && !showNoteEditor && (
            <button
              type="button"
              onClick={() => setShowNoteEditor(true)}
              className="w-full text-left rounded-xl border border-amber-500/25 bg-amber-950/15 px-3 py-2 text-xs text-amber-100/90 hover:border-amber-500/40 transition-colors flex items-start gap-2"
            >
              <StickyNote
                size={13}
                className="text-amber-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="leading-relaxed">{savedNote}</span>
            </button>
          )}

          {showNoteEditor && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2.5 space-y-1.5 animate-fadeIn">
              <label
                htmlFor={`note-${exerciseId}`}
                className="block text-[11px] font-medium text-slate-400"
              >
                Saved cue / seat setting (persists for future sessions)
              </label>
              <textarea
                id={`note-${exerciseId}`}
                rows={2}
                value={savedNote}
                onChange={(e) => setExerciseNote(exerciseId, e.target.value)}
                placeholder="e.g., Bench notch 3 · Pause 1s at bottom · Wide grip"
                className="w-full rounded-lg border border-slate-700 bg-bg-deep px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-slate-400 focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Inline Collapsible Quick Cues Drawer (no modal interruption) */}
          {showQuickCues && hasQuickCues && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-2 text-xs animate-fadeIn">
              {exercise.setupAlignment && (
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Setup: </span>
                  {exercise.setupAlignment}
                </p>
              )}
              {exercise.executionCues?.length > 0 && (
                <ol className="list-decimal pl-4 space-y-1 text-slate-300 leading-relaxed">
                  {exercise.executionCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ol>
              )}
              {exercise.commonMistakes?.length > 0 && (
                <div className="pt-1 border-t border-slate-800 flex items-start gap-1.5 text-slate-400">
                  <AlertTriangle
                    size={13}
                    className="text-amber-500 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-slate-200">Avoid: </strong>
                    {exercise.commonMistakes[0]}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Performance + Live Exercise Volume/e1RM + One-Tap Fill */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-slate-800/80 bg-bg-deep/50 text-[11px]">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 text-slate-400">
              <span>Previous:</span>
              <span className="text-slate-200 font-mono truncate tabular-nums">
                {ghostData
                  ? ghostData.sets
                      .map((s) => `${s.weight || 0}×${s.reps || 0}`)
                      .join(" · ")
                  : "No previous log"}
              </span>
            </div>
            {liveStats.workingVolume > 0 && (
              <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                Vol:{" "}
                <span className="text-slate-200 font-semibold">
                  {liveStats.workingVolume.toLocaleString()} kg
                </span>
                {liveStats.bestE1rm > 0 && (
                  <>
                    {" · "}Best e1RM:{" "}
                    <span className="text-slate-200 font-semibold">
                      {liveStats.bestE1rm} kg
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {activeSetIdx >= 0 && (ghostData || sets.some((s) => s.weight)) && (
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors shrink-0"
              title="Auto-fill remaining sets from previous log or first set"
            >
              <Copy size={11} aria-hidden="true" /> Fill sets
            </button>
          )}
        </div>

        {/* Sets Table */}
        <div className="p-3 space-y-2">
          {/* Quick +/- Weight Stepper + Plate Calculator for the Active Set */}
          {activeSetIdx >= 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/90 bg-slate-900/50 px-2.5 py-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  Set{" "}
                  <strong className="text-white tabular-nums">
                    {activeSetIdx + 1}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPlateCalc(true)}
                  className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800 px-2 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  aria-label="Open plate calculator"
                  title="Calculate barbell plates per side"
                >
                  <Disc3 size={12} aria-hidden="true" /> Plates
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {[-5, -2.5, +2.5, +5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleNudgeActiveWeight(delta)}
                    aria-label={`Adjust set ${activeSetIdx + 1} weight by ${delta > 0 ? `+${delta}` : delta} kg`}
                    className="min-h-8 min-w-10 rounded-lg border border-slate-700/80 bg-slate-800 px-2 text-[11px] font-mono font-medium text-slate-200 hover:bg-slate-700 active:scale-95 transition-all tabular-nums"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Table header */}
          <div
            className={`${SET_GRID} text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-1 pb-1.5 border-b border-slate-800/70`}
          >
            <span className="text-center">Set</span>
            <span className="text-center">Type</span>
            <span className="text-center">Weight (kg)</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Done</span>
          </div>

          {/* Set Rows */}
          {sets.map((set, si) => {
            const typeMeta = SET_TYPE_META[set.type || "N"];
            const isActiveRow = si === activeSetIdx;
            return (
              <div
                key={si}
                className={`${SET_GRID} p-2 rounded-2xl relative transition-colors ${
                  set.type === "F"
                    ? "border border-rose-600/35 bg-rose-600/[0.04]"
                    : set.done
                      ? "bg-emerald-500/[0.06] border border-emerald-500/25"
                      : isActiveRow
                        ? "bg-slate-800/60 border border-slate-600/80"
                        : "bg-slate-800/30 border border-slate-800"
                }`}
              >
                {/* Set Number */}
                <div className="flex items-center justify-center">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                      set.done
                        ? "text-emerald-400 bg-emerald-500/15"
                        : isActiveRow
                          ? "text-slate-950 bg-slate-200"
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
                  onChange={(event) =>
                    updateSet(exerciseIndex, si, "weight", event.target.value)
                  }
                  className="h-11 min-w-0 w-full rounded-xl border border-slate-700/70 bg-bg-deep/70 px-2 text-center text-base font-semibold tabular-nums text-white placeholder:text-slate-500 focus:border-slate-400 focus:outline-none disabled:text-slate-400"
                  aria-label={`Set ${si + 1} weight in kg`}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={String(
                    ghostData?.sets[si]?.reps ?? exercise.default_reps ?? 10,
                  )}
                  value={set.reps}
                  disabled={set.done}
                  onChange={(event) =>
                    updateSet(exerciseIndex, si, "reps", event.target.value)
                  }
                  className="h-11 min-w-0 w-full rounded-xl border border-slate-700/70 bg-bg-deep/70 px-2 text-center text-base font-semibold tabular-nums text-white placeholder:text-slate-500 focus:border-slate-400 focus:outline-none disabled:text-slate-400"
                  aria-label={`Set ${si + 1} reps`}
                />

                {/* Done Check Button */}
                <button
                  type="button"
                  onClick={() => handleToggleDone(si)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all btn-press focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                    set.done ? "animate-set-complete " : ""
                  }${
                    set.done
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : set.type === "F"
                        ? "bg-rose-950/60 text-rose-300 border border-rose-600/40"
                        : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                  }`}
                  aria-label={
                    set.done
                      ? `Mark set ${si + 1} as incomplete`
                      : `Mark set ${si + 1} as complete`
                  }
                >
                  <Check size={18} strokeWidth={set.done ? 3 : 2} />
                </button>

                {/* Progressive Overload Delta (vs previous session same set) */}
                {ghostData?.sets[si] &&
                  (set.weight || set.reps) &&
                  (set.type || "N") !== "W" && (() => {
                    const prevW = Number(ghostData.sets[si].weight) || 0;
                    const prevR = Number(ghostData.sets[si].reps) || 0;
                    const curW = Number(set.weight) || 0;
                    const curR = Number(set.reps) || 0;
                    const wDiff = Math.round((curW - prevW) * 10) / 10;
                    const rDiff = curR - prevR;
                    if (curW > 0 && wDiff > 0) {
                      return (
                        <div className="col-span-5 flex items-center justify-end gap-1 text-[10px] font-mono tabular-nums text-emerald-400 pr-1">
                          <TrendingUp size={10} aria-hidden="true" />
                          <span>+{wDiff} kg vs last session</span>
                        </div>
                      );
                    }
                    if (curW > 0 && wDiff === 0 && curR > 0 && rDiff > 0) {
                      return (
                        <div className="col-span-5 flex items-center justify-end gap-1 text-[10px] font-mono tabular-nums text-emerald-400 pr-1">
                          <TrendingUp size={10} aria-hidden="true" />
                          <span>+{rDiff} rep{rDiff > 1 ? "s" : ""} vs last session</span>
                        </div>
                      );
                    }
                    if (curW > 0 && wDiff < 0) {
                      return (
                        <div className="col-span-5 flex items-center justify-end gap-1 text-[10px] font-mono tabular-nums text-slate-400 pr-1">
                          <TrendingDown size={10} className="text-rose-400" aria-hidden="true" />
                          <span>{wDiff} kg vs last session</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </div>
            );
          })}

          {/* Add/Remove set buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-2 px-1">
            <button
              type="button"
              onClick={() => removeSet(exerciseIndex, sets.length - 1)}
              className="min-h-9 text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-30 px-2.5 py-1 rounded-lg"
              disabled={sets.length <= 1}
              aria-label="Remove last set"
            >
              <Minus size={13} /> Remove Set
            </button>
            <button
              type="button"
              onClick={() => addSet(exerciseIndex)}
              className="min-h-9 text-xs text-slate-950 font-semibold bg-slate-200 hover:bg-white flex items-center gap-1.5 transition-colors px-3 py-1 rounded-lg"
              aria-label="Add a set"
            >
              <Plus size={13} /> Add Set
            </button>
          </div>

          {/* Set-type legend */}
          <p className="text-[10px] text-slate-500 pt-1 px-1">
            <span className="text-amber-400 font-semibold">W</span> Warm-up
            (excluded from volume & PRs) ·{" "}
            <span className="text-slate-300 font-semibold">N</span> Normal ·{" "}
            <span className="text-rose-400 font-semibold">F</span> Failure — tap
            Type to cycle
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

      {/* Barbell Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={showPlateCalc}
        onClose={() => setShowPlateCalc(false)}
        initialWeight={
          (activeSetIdx >= 0 && sets[activeSetIdx]?.weight) ||
          ghostData?.sets[Math.max(0, activeSetIdx)]?.weight ||
          60
        }
        onApplyWeight={
          activeSetIdx >= 0
            ? (val) => updateSet(exerciseIndex, activeSetIdx, "weight", val)
            : undefined
        }
      />
    </>
  );
}

export default memo(ExerciseCard);
