import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Clock,
  Dumbbell,
  Check,
  SkipForward,
  Flag,
  Zap,
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
  const activePillRef = useRef(null);

  // Live elapsed timer
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

  // Ensure active pill stays centered in horizontal carousel
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

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

  // Map active exercises to full catalog objects for biomechanical validation
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
        <div className="min-h-screen bg-bg-deep">
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
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
          <Dumbbell size={28} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">No active workout session.</p>
        <button
          onClick={() => navigate("/workout")}
          className="text-neon-blue hover:underline text-sm font-medium"
        >
          Start a workout →
        </button>
      </div>
    );
  }

  const totalExercises = activeWorkout.exercises.length;
  const currentExercise = activeWorkout.exercises[currentIndex];
  const ghostData = currentExercise ? getGhostData(currentExercise.exerciseId) : null;
  const nextUnfinishedSetIndex = currentExercise ? currentExercise.sets.findIndex((s) => !s.done) : -1;

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
      navigator.vibrate?.(50);
      haptics.light();

      // Check if all sets for this exercise are now done
      const remaining = currentExercise.sets.filter((s, idx) => !s.done && idx !== si);
      if (remaining.length === 0 && currentIndex < totalExercises - 1) {
        setTimeout(() => {
          setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1));
        }, 350);
      }
    } else {
      if (currentIndex < totalExercises - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setShowConfirmFinish(true);
      }
    }
  };

  const handleSkipExercise = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSelectAngleSuggestion = (angleId) => {
    setSwapTargetAngle(angleId);
    setShowAngleSwapModal(true);
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-bg-deep">
      {/* ═══ TOP FIXED HEADER ═══ */}
      <div className="shrink-0 bg-bg-deep px-3 pt-2.5 pb-1 space-y-1.5 border-b border-border-slate/40">
        {/* Row 1: Back, Program Name, Elapsed Timer, Cancel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/workout")}
            className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all text-slate-300"
            aria-label="Go back"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold text-white truncate">
              {activeWorkout.programName || "Active Routine"}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>{progress.doneSets}/{progress.totalSets} sets ({progress.percent}%)</span>
              {progress.percent === 100 && (
                <span className="text-neon-green font-bold flex items-center gap-0.5">
                  <Zap size={10} /> 100%
                </span>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-1 text-xs text-neon-cyan font-mono font-bold bg-neon-cyan/8 px-2 py-0.5 rounded-lg border border-neon-cyan/15 shrink-0"
            aria-live="polite"
          >
            <Clock size={11} />
            <span>{formatTime(elapsed)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmCancel(true)}
            className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all text-slate-400"
            aria-label="Cancel workout"
          >
            <X size={15} />
          </button>
        </div>

        {/* Row 2: Real-Time Biomechanical Angle Audit Badge */}
        <AngleCoverageBadge
          exercises={activeWorkoutExerciseObjs}
          programContext={activeWorkout.programName || activeWorkout.programId}
          onSelectSuggestion={handleSelectAngleSuggestion}
          compact
        />
      </div>

      {/* ═══ HORIZONTAL SWIPEABLE EXERCISE PILL CAROUSEL ═══ */}
      <div className="shrink-0 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-border-slate/40 bg-bg-surface/30 snap-x">
        {activeWorkout.exercises.map((exData, i) => {
          const exInfo = exercises.find((e) => e.id === exData.exerciseId);
          const allDone = exData.sets.length > 0 && exData.sets.every((s) => s.done);
          const isCurrent = i === currentIndex;
          const someDone = exData.sets.some((s) => s.done);

          return (
            <button
              key={i}
              ref={isCurrent ? activePillRef : null}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors active:scale-95 border snap-start ${
                isCurrent
                  ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : allDone
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : someDone
                      ? "bg-slate-800 text-slate-200 border-slate-700"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">{i + 1}.</span>
              <span className="max-w-[100px] truncate">{exInfo?.name || "Exercise"}</span>
              {allDone ? (
                <Check size={11} className="text-emerald-400 shrink-0" strokeWidth={3} />
              ) : (
                <span className="text-[10px] opacity-60 font-mono shrink-0">
                  {exData.sets.filter((s) => s.done).length}/{exData.sets.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ CENTER WORKOUT EXECUTION AREA (Zero Scroll Optimized) ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-hidden p-3 flex flex-col justify-between gap-2 custom-scrollbar">
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

      {/* ═══ STICKY BOTTOM ACTION BAR ═══ */}
      <div className="shrink-0 p-3 bg-bg-surface/95 backdrop-blur-md border-t border-border-slate flex items-center gap-2 z-20">
        {/* Primary Log Set Button */}
        <button
          type="button"
          onClick={handleLogCurrentSet}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-cyan to-neon-green text-bg-deep shadow-[0_0_16px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-press"
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

        {/* Skip to Next Exercise Button */}
        <button
          type="button"
          onClick={handleSkipExercise}
          disabled={currentIndex >= totalExercises - 1}
          className="py-3 px-3.5 rounded-xl font-semibold text-xs bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 disabled:opacity-30 border border-slate-700/60 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          title="Skip to next exercise"
        >
          <SkipForward size={15} />
          <span className="hidden sm:inline">Skip</span>
        </button>

        {/* Finish Workout Action */}
        <button
          type="button"
          onClick={() => setShowConfirmFinish(true)}
          className="py-3 px-3 rounded-xl font-semibold text-xs bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          title="Finish Workout"
        >
          <Flag size={15} />
          <span>{progress.percent}%</span>
        </button>
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

      {/* Shareable Workout Receipt Modal */}
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
