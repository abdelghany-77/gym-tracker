import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import { ConfirmDialog } from "../components/Modal";
import { useState, useMemo, useEffect, useRef } from "react";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Redirect if no active workout
  if (!activeWorkout) {
    return (
      <div className="px-4 pt-20 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
          <Dumbbell size={28} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">
          No active workout session.
        </p>
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
  const nextExerciseData =
    currentIndex < totalExercises - 1
      ? activeWorkout.exercises[currentIndex + 1]
      : null;
  const nextExercise = nextExerciseData
    ? exercises.find((e) => e.id === nextExerciseData.exerciseId)
    : null;

  const handleFinish = () => {
    finishWorkout();
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    cancelWorkout();
    navigate("/workout", { replace: true });
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1));

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/workout")}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all btn-press focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
            aria-label="Go back to workout selection"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              {activeWorkout.programName}
            </p>
            <div
              className="flex items-center gap-1.5 justify-center text-xs text-neon-blue font-mono font-bold"
              aria-live="polite"
              aria-label={`Elapsed time: ${formatTime(elapsed)}`}
            >
              <Clock size={12} />
              <span>{formatTime(elapsed)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all btn-press focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
            aria-label="Cancel workout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {progress.doneSets}/{progress.totalSets} sets
            </span>
            <span className="text-neon-blue font-medium">
              {progress.percent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-neon-blue to-neon-green rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percent}%` }}
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Exercise pagination */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors px-2 py-1 rounded-lg"
            aria-label="Previous exercise"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <div className="flex items-center gap-1.5">
            {activeWorkout.exercises.map((ex, i) => {
              const allDone = ex.sets.every((s) => s.done);
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-6 bg-neon-blue"
                      : allDone
                        ? "bg-neon-green/60"
                        : "bg-slate-700"
                  }`}
                  aria-label={`Go to exercise ${i + 1}`}
                  aria-current={i === currentIndex ? "step" : undefined}
                />
              );
            })}
          </div>
          <button
            onClick={goNext}
            disabled={currentIndex === totalExercises - 1}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors px-2 py-1 rounded-lg"
            aria-label="Next exercise"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* One-at-a-time Exercise Card */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <div key={currentExercise.exerciseId} className="animate-fadeIn">
          <ExerciseCard
            exerciseIndex={currentIndex}
            exerciseData={currentExercise}
          />
        </div>

        {/* Next Exercise Preview */}
        {nextExercise && (
          <button
            onClick={goNext}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] btn-press"
            aria-label={`Next up: ${nextExercise.name}`}
          >
            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center shrink-0">
              <ChevronRight size={16} className="text-neon-blue" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                Up Next
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {nextExercise.name}
              </p>
            </div>
            <span className="text-[11px] text-slate-500 shrink-0">
              {nextExerciseData.sets.length} sets
            </span>
          </button>
        )}

        {/* Finish Workout Button */}
        <button
          onClick={() => setShowConfirmFinish(true)}
          className="w-full bg-linear-to-r from-neon-green/20 to-emerald-500/20 text-neon-green font-semibold py-4 rounded-2xl border border-neon-green/30 hover:border-neon-green/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-press focus-visible:ring-2 focus-visible:ring-neon-green/50 focus-visible:outline-none"
          aria-label={`Finish workout, ${progress.percent}% completed`}
        >
          <CheckCircle2 size={20} />
          Finish Workout ({progress.percent}% done)
        </button>
      </div>

      {/* Rest Timer (floating) */}
      <RestTimer />

      {/* Confirm Finish */}
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

      {/* Confirm Cancel */}
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
    </div>
  );
}
