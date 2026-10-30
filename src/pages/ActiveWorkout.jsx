import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Clock,
  Dumbbell,
  Check,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import AngleCoverageBadge from "../components/AngleCoverageBadge";
import SwapExerciseModal from "../components/SwapExerciseModal";
import { ConfirmDialog } from "../components/Modal";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import { haptics } from "../utils/haptics";
import { useState, useMemo, useEffect, useRef } from "react";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const exercises = useWorkoutStore((s) => s.exercises);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const getGhostData = useWorkoutStore((s) => s.getGhostData);

  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [previousPRsSnapshot, setPreviousPRsSnapshot] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [swapTargetAngle, setSwapTargetAngle] = useState(null);
  const [showAngleSwapModal, setShowAngleSwapModal] = useState(false);
  const timerRef = useRef(null);

  // Live elapsed workout timer
  useEffect(() => {
    if (!activeWorkout) return;
    const start = new Date(activeWorkout.startedAt).getTime();
    const tick = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeWorkout]);

  const totalExercises = activeWorkout?.exercises?.length || 0;
  const currentExercise = activeWorkout?.exercises?.[currentIndex];
  const ghostData = currentExercise ? getGhostData(currentExercise.exerciseId) : null;
  const nextUnfinishedSetIndex = currentExercise ? currentExercise.sets.findIndex((s) => !s.done) : -1;
  const currentExerciseAllDone = Boolean(
    currentExercise &&
      currentExercise.sets.length > 0 &&
      currentExercise.sets.every((s) => s.done)
  );

  // ═══ AUTOMATED PROGRESSION TO NEXT EXERCISE ON ALL-SETS COMPLETED ═══
  const prevAllDoneRef = useRef({});
  useEffect(() => {
    if (!currentExercise) return;
    const exId = currentExercise.exerciseId;
    const wasAllDone = Boolean(prevAllDoneRef.current[exId]);

    // Save current status in ref
    prevAllDoneRef.current[exId] = currentExerciseAllDone;

    // Trigger auto-advance ONLY when transitioning from not-done to all-done
    if (currentExerciseAllDone && !wasAllDone) {
      if (currentIndex < totalExercises - 1) {
        const timer = setTimeout(() => {
          setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1));
          haptics.success();
        }, 650);
        return () => clearTimeout(timer);
      }
    }
  }, [currentExerciseAllDone, currentExercise, currentIndex, totalExercises]);

  const progress = useMemo(() => {
    if (!activeWorkout) return { totalSets: 0, doneSets: 0, percent: 0 };
    const totalSets = activeWorkout.exercises.reduce(
      (acc, e) => acc + e.sets.length,
      0,
    );
    const doneSets = activeWorkout.exercises.reduce(
      (acc, e) => acc + e.sets.filter((s) => s.done).length,
      0,
    );
    return {
      totalSets,
      doneSets,
      percent: totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0,
    };
  }, [activeWorkout]);

  // Catalog objects for biomechanical validation
  const activeWorkoutExerciseObjs = useMemo(() => {
    if (!activeWorkout?.exercises) return [];
    const map = new Map(exercises.map((e) => [e.id, e]));
    return activeWorkout.exercises.map((ex) => map.get(ex.exerciseId)).filter(Boolean);
  }, [activeWorkout, exercises]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Redirect if no active workout
  if (!activeWorkout) {
    if (completedSession) {
      return (
        <div className="min-h-screen bg-[#0D1723]">
          <WorkoutReceiptModal
            isOpen={true}
            session={completedSession}
            previousPRs={previousPRsSnapshot}
            onClose={() => {
              setCompletedSession(null);
              navigate("/", { replace: true });
            }}
          />
        </div>
      );
    }

    return (
      <div className="px-4 pt-20 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#142332] flex items-center justify-center border border-[#223348]">
          <Dumbbell size={28} className="text-[#8E9FA5]" />
        </div>
        <p className="text-[#8E9FA5] font-medium">No active workout session.</p>
        <button
          onClick={() => navigate("/workout")}
          className="text-[#C4E58A] hover:underline text-sm font-semibold"
        >
          Start a workout →
        </button>
      </div>
    );
  }

  const handleFinish = () => {
    setPreviousPRsSnapshot({ ...personalRecords });
    const session = finishWorkout();
    setShowConfirmFinish(false);
    setCompletedSession(session);
  };

  const handleCancel = () => {
    cancelWorkout();
    navigate("/workout", { replace: true });
  };

  // Single-tap fast set completion from bottom action bar
  const handleLogCurrentSet = () => {
    if (!currentExercise) return;
    const si = currentExercise.sets.findIndex((s) => !s.done);
    if (si !== -1) {
      const targetSet = currentExercise.sets[si];
      if (!targetSet.weight && ghostData?.sets[si]?.weight) {
        updateSet(currentIndex, si, "weight", ghostData.sets[si].weight);
      }
      if (!targetSet.reps) {
        const exerciseObj = exercises.find((e) => e.id === currentExercise.exerciseId);
        updateSet(currentIndex, si, "reps", ghostData?.sets[si]?.reps || exerciseObj?.default_reps || 10);
      }
      toggleSetDone(currentIndex, si);
      try {
        navigator.vibrate?.(50);
      } catch {}
      haptics.light();
    } else {
      if (currentIndex < totalExercises - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setShowConfirmFinish(true);
      }
    }
  };

  const handleSelectAngleSuggestion = (angleId) => {
    setSwapTargetAngle(angleId);
    setShowAngleSwapModal(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0D1723] select-none text-[#F1F5F7]">
      {/* ═══ TOP FIXED HEADER (Matches Reference Panel 3) ═══ */}
      <div className="shrink-0 bg-[#0D1723] px-3 sm:px-4 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2 space-y-1.5 border-b border-[#223348]/60">
        <div className="flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/workout")}
            className="w-9 h-9 rounded-xl bg-[#142332] border border-[#223348] flex items-center justify-center hover:bg-[#192C3C] active:scale-95 transition-all text-[#8E9FA5]"
            aria-label="Back to routines"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Routine Title & Subtitle */}
          <div className="flex-1 text-center min-w-0">
            <h2 className="text-sm font-bold text-[#F1F5F7] truncate">
              {activeWorkout.programName || "Active Routine"}
            </h2>
            <p className="text-[11px] text-[#8E9FA5] font-medium">
              {currentIndex + 1}/{totalExercises} exercises
            </p>
          </div>

          {/* Settings / Discard Option */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-[#73C8B4] font-mono font-bold bg-[#73C8B4]/10 px-2 py-1 rounded-lg border border-[#73C8B4]/20">
              <Clock size={11} />
              <span>{formatTime(elapsed)}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmCancel(true)}
              className="w-9 h-9 rounded-xl bg-[#142332] border border-[#223348] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all text-[#8E9FA5]"
              aria-label="Cancel workout"
              title="Discard workout"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Biomechanical Angle Warning Banner if any angle is neglected */}
        <AngleCoverageBadge
          exercises={activeWorkoutExerciseObjs}
          programContext={activeWorkout.programName || activeWorkout.programId}
          onSelectSuggestion={handleSelectAngleSuggestion}
          compact
        />
      </div>

      {/* ═══ COMPACT TOP EXERCISE NAVIGATOR (< 1/7 >) ═══ */}
      <div className="shrink-0 px-3 py-1.5 bg-[#142332]/70 border-b border-[#223348]/50 flex items-center justify-between text-xs select-none">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1723] hover:bg-[#192C3C] text-[#8E9FA5] hover:text-[#F1F5F7] disabled:opacity-20 disabled:pointer-events-none border border-[#223348] transition-all active:scale-95"
          aria-label="Previous exercise"
        >
          <ChevronLeft size={14} />
          <span className="text-[10px] font-medium hidden min-[360px]:inline">Prev</span>
        </button>

        {/* Indicator: < 1 / 7 > */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8E9FA5] uppercase font-bold tracking-wider">Exercise</span>
          <div className="flex items-center gap-1 bg-[#0D1723] border border-[#223348] px-2.5 py-0.5 rounded-lg font-mono">
            <span className="text-[#C4E58A] font-bold text-xs">{currentIndex + 1}</span>
            <span className="text-[#8E9FA5] text-xs">/</span>
            <span className="text-[#F1F5F7] text-xs">{totalExercises}</span>
          </div>
          {currentExerciseAllDone && (
            <span className="flex items-center gap-1 text-[#C4E58A] text-[10px] font-bold bg-[#C4E58A]/10 border border-[#C4E58A]/25 px-1.5 py-0.5 rounded-md animate-fadeIn">
              <Check size={10} strokeWidth={3} /> Done
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1))}
          disabled={currentIndex >= totalExercises - 1}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1723] hover:bg-[#192C3C] text-[#8E9FA5] hover:text-[#F1F5F7] disabled:opacity-20 disabled:pointer-events-none border border-[#223348] transition-all active:scale-95"
          aria-label="Next exercise"
        >
          <span className="text-[10px] font-medium hidden min-[360px]:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ═══ CENTER WORKOUT EXECUTION AREA (Zero-Scroll Optimized) ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col justify-between gap-2.5 custom-scrollbar">
        {currentExercise && (
          <div key={currentExercise.exerciseId} className="animate-fadeIn">
            <ExerciseCard
              exerciseIndex={currentIndex}
              exerciseData={currentExercise}
            />
          </div>
        )}

        {/* Inline Compact Rest Timer */}
        <RestTimer inline />
      </div>

      {/* ═══ STICKY BOTTOM ACTION BAR (Matches Reference Panel 3) ═══ */}
      <div className="shrink-0 p-3 bg-[#142332]/95 backdrop-blur-md border-t border-[#223348] flex items-center justify-between gap-2 z-20 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="py-3 px-3.5 rounded-xl font-bold text-xs bg-[#192C3C] text-[#8E9FA5] hover:text-[#F1F5F7] disabled:opacity-20 border border-[#223348] transition-all active:scale-95 flex items-center gap-1 shrink-0"
        >
          <ChevronLeft size={16} />
          <span className="hidden min-[380px]:inline">Previous</span>
        </button>

        {/* Primary Log Set Button: Lime Green Pill */}
        <button
          type="button"
          onClick={handleLogCurrentSet}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] shadow-[0_0_16px_rgba(196,229,138,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} strokeWidth={3} />
          <span>
            {nextUnfinishedSetIndex !== -1
              ? `Log Set ${nextUnfinishedSetIndex + 1}`
              : currentIndex < totalExercises - 1
                ? "Next Exercise →"
                : "Finish Workout ✓"}
          </span>
        </button>

        {/* Next Button / Finish */}
        {currentIndex < totalExercises - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1))}
            className="py-3 px-3.5 rounded-xl font-bold text-xs bg-[#192C3C] text-[#8E9FA5] hover:text-[#F1F5F7] border border-[#223348] transition-all active:scale-95 flex items-center gap-1 shrink-0"
          >
            <span className="hidden min-[380px]:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmFinish(true)}
            className="py-3 px-3.5 rounded-xl font-bold text-xs bg-[#73C8B4]/20 text-[#73C8B4] border border-[#73C8B4]/40 hover:bg-[#73C8B4]/30 transition-all active:scale-95 shrink-0"
          >
            Finish
          </button>
        )}
      </div>

      {/* ═══ DIALOGS & MODALS ═══ */}
      <ConfirmDialog
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={handleFinish}
        title="Finish Workout?"
        message={`You've completed ${progress.doneSets} of ${progress.totalSets} sets (${progress.percent}%). Only completed sets will be saved.`}
        confirmText="Save & Finish"
        cancelText="Keep Going"
        variant="success"
      />

      <ConfirmDialog
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Cancel Workout?"
        message="All progress from this session will be lost. This cannot be undone."
        confirmText="Discard"
        cancelText="Go Back"
        variant="danger"
      />

      {/* Missing Angle Swap Modal */}
      {showAngleSwapModal && currentExercise && (
        <SwapExerciseModal
          isOpen={showAngleSwapModal}
          onClose={() => {
            setShowAngleSwapModal(false);
            setSwapTargetAngle(null);
          }}
          exerciseIndex={currentIndex}
          currentExerciseId={currentExercise.exerciseId}
          filterAngle={swapTargetAngle}
        />
      )}

      {/* Workout Receipt Modal */}
      {completedSession && (
        <WorkoutReceiptModal
          isOpen={Boolean(completedSession)}
          session={completedSession}
          previousPRs={previousPRsSnapshot}
          onClose={() => {
            setCompletedSession(null);
            navigate("/", { replace: true });
          }}
        />
      )}
    </div>
  );
}
