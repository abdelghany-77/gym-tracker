import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Clock,
  Dumbbell,
  Flag,
  ChevronDown,
  Layers,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import AngleCoverageBadge from "../components/AngleCoverageBadge";
import SwapExerciseModal from "../components/SwapExerciseModal";
import Modal, { ConfirmDialog } from "../components/Modal";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import { useState, useMemo, useEffect, useRef } from "react";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const exercises = useWorkoutStore((s) => s.exercises);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);

  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [previousPRsSnapshot, setPreviousPRsSnapshot] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [swapTargetAngle, setSwapTargetAngle] = useState(null);
  const [showAngleSwapModal, setShowAngleSwapModal] = useState(false);
  const timerRef = useRef(null);

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
    return activeWorkout.exercises
      .map((ex) => map.get(ex.exerciseId))
      .filter(Boolean);
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

  const handleSelectAngleSuggestion = (angleId) => {
    setSwapTargetAngle(angleId);
    setShowAngleSwapModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-5rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-2rem)] overflow-hidden bg-bg-deep">
      {/* ═══ TOP FIXED HEADER ═══ */}
      <header className="shrink-0 bg-bg-surface/70 px-3 pt-2 pb-1.5 space-y-2">
        {/* Row 1: Back, Program Name, Elapsed Timer, Cancel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/workout")}
            className="w-9 h-9 shrink-0 rounded-full bg-slate-800/60 flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-300"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-white truncate">
              {activeWorkout.programName || "Active Routine"}
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-neon-emerald"
                aria-hidden="true"
              />
              {progress.doneSets}/{progress.totalSets} sets · {progress.percent}
              %
            </p>
          </div>

          <div
            className="flex items-center gap-1 text-xs font-medium tabular-nums text-neon-cyan shrink-0"
            aria-label="Workout elapsed time"
          >
            <Clock size={14} aria-hidden="true" />
            <span>{formatTime(elapsed)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCoverage(true)}
            aria-label="Training coverage"
            title="Training coverage"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-neon-cyan transition-colors"
          >
            <Layers size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmCancel(true)}
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-400"
            aria-label="Cancel workout"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="h-0.5 overflow-hidden rounded-full bg-slate-800/80"
          role="progressbar"
          aria-label="Workout progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-emerald transition-[width] duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </header>

      {/* ═══ EXERCISE ARROW NAVIGATION ═══ */}
      <div className="shrink-0 px-3 pb-1.5 bg-bg-surface/70 border-b border-border-slate/50">
        <div className="flex items-center gap-1 rounded-xl bg-slate-800/40 p-0.5">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700/60 transition-colors disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Previous exercise"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative min-w-0 flex-1">
            <label htmlFor="workout-exercise" className="sr-only">
              Jump to exercise
            </label>
            <select
              id="workout-exercise"
              value={currentIndex}
              onChange={(event) => setCurrentIndex(Number(event.target.value))}
              disabled={!totalExercises}
              className="w-full min-h-9 cursor-pointer appearance-none rounded-lg border-0 bg-transparent pl-2 pr-7 text-xs font-medium text-white truncate focus-visible:ring-1 focus-visible:ring-neon-cyan/40"
            >
              {!totalExercises && <option value={0}>No exercises</option>}
              {activeWorkout.exercises.map((entry, index) => (
                <option
                  key={`${entry.exerciseId}-${index}`}
                  value={index}
                  className="bg-bg-surface text-white"
                >
                  {index + 1}/{totalExercises} ·{" "}
                  {exercises.find(
                    (exercise) => exercise.id === entry.exerciseId,
                  )?.name || "Exercise"}
                  {entry.sets.length > 0 && entry.sets.every((set) => set.done)
                    ? " ✓"
                    : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neon-cyan"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentIndex((index) =>
                Math.min(totalExercises - 1, index + 1),
              )
            }
            disabled={currentIndex >= totalExercises - 1}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Next exercise"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ═══ CENTER WORKOUT EXECUTION AREA (Zero Scroll Optimized) ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-3 custom-scrollbar">
        {currentExercise && (
          <div key={currentExercise.exerciseId} className="animate-fadeIn">
            <ExerciseCard
              exerciseIndex={currentIndex}
              exerciseData={currentExercise}
            />
          </div>
        )}

        {(totalExercises === 0 || currentIndex === totalExercises - 1) && (
          <button
            type="button"
            onClick={() => setShowConfirmFinish(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neon-emerald px-4 py-3 text-sm font-semibold text-bg-deep"
          >
            <Flag size={17} /> Finish workout
          </button>
        )}

        {/* Rest timer stays below the exercise card and never changes exercise selection. */}
        <section aria-label="Rest timer">
          <RestTimer inline />
        </section>
      </div>

      {/* ═══ DIALOGS & MODALS ═══ */}
      <Modal
        isOpen={showCoverage}
        onClose={() => setShowCoverage(false)}
        title="Training coverage"
        maxWidth="max-w-lg"
      >
        <div className="p-4">
          <AngleCoverageBadge
            exercises={activeWorkoutExerciseObjs}
            programContext={
              activeWorkout.programName || activeWorkout.programId
            }
            onSelectSuggestion={(angleId) => {
              setShowCoverage(false);
              handleSelectAngleSuggestion(angleId);
            }}
            compact
          />
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={handleFinish}
        title="Finish Workout?"
        description={`You've completed ${progress.doneSets} of ${progress.totalSets} sets (${progress.percent}%). Only completed sets will be saved.`}
        confirmText="Save & Finish"
        cancelText="Keep Going"
        variant="success"
      />

      <ConfirmDialog
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Cancel Workout?"
        description="All progress from this session will be lost. This cannot be undone."
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
