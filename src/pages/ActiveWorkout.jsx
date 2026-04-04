import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Zap,
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
  const [autoAdvancedTo, setAutoAdvancedTo] = useState(-1);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

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

  // Auto-advance to next exercise when all sets are done
  useEffect(() => {
    if (!activeWorkout) return;
    const currentExercise = activeWorkout.exercises[currentIndex];
    if (!currentExercise) return;
    const allDone = currentExercise.sets.every((s) => s.done);
    const totalExercises = activeWorkout.exercises.length;
    if (allDone && currentIndex < totalExercises - 1 && autoAdvancedTo !== currentIndex) {
      const timer = setTimeout(() => {
        setAutoAdvancedTo(currentIndex);
        setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1));
        // Scroll to top when auto-advancing
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeWorkout, currentIndex, autoAdvancedTo]);

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

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goNext = () => {
    setCurrentIndex((i) => Math.min(totalExercises - 1, i + 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100dvh-4rem)]">
      {/* ═══ COMPACT HEADER ═══ */}
      <div className="shrink-0 bg-slate-950 px-4 pt-3 pb-2 space-y-2">
        {/* Top row: back, title, cancel */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/workout")}
            className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {activeWorkout.programName}
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 text-xs text-neon-blue font-mono font-bold bg-neon-blue/8 px-2.5 py-1 rounded-lg border border-neon-blue/15"
            aria-live="polite"
          >
            <Clock size={11} />
            <span>{formatTime(elapsed)}</span>
          </div>

          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all"
            aria-label="Cancel workout"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar + pagination — single row */}
        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percent}%` }}
                role="progressbar"
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium tabular-nums shrink-0">
              {progress.doneSets}/{progress.totalSets}
            </span>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-1">
            {activeWorkout.exercises.map((ex, i) => {
              const allDone = ex.sets.every((s) => s.done);
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-5 bg-neon-blue"
                      : allDone
                        ? "w-1.5 bg-neon-green/60"
                        : "w-1.5 bg-slate-700"
                  }`}
                  aria-label={`Exercise ${i + 1}`}
                  aria-current={i === currentIndex ? "step" : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4"
      >
        {/* Exercise number indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90 border border-slate-700/30"
              aria-label="Previous exercise"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-400">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="text-slate-600 mx-0.5">/</span>
              <span>{totalExercises}</span>
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === totalExercises - 1}
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90 border border-slate-700/30"
              aria-label="Next exercise"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {progress.percent === 100 && (
            <div className="flex items-center gap-1 text-xs text-neon-green font-medium animate-fadeIn">
              <Zap size={12} />
              All done!
            </div>
          )}
        </div>

        {/* ─── Exercise Card ─── */}
        <div key={currentExercise.exerciseId} className="animate-fadeIn">
          <ExerciseCard
            exerciseIndex={currentIndex}
            exerciseData={currentExercise}
          />
        </div>

        {/* ─── Inline Rest Timer ─── */}
        <RestTimer inline />

        {/* ─── Next Exercise Preview ─── */}
        {nextExercise && (
          <button
            onClick={goNext}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-neon-blue/25 hover:bg-slate-900/70 transition-all active:scale-[0.98] btn-press"
            aria-label={`Next up: ${nextExercise.name}`}
          >
            <div className="w-8 h-8 rounded-lg bg-neon-blue/8 flex items-center justify-center shrink-0">
              <ChevronRight size={14} className="text-neon-blue" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                Up Next
              </p>
              <p className="text-sm font-medium text-slate-300 truncate">
                {nextExercise.name}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/30">
              {nextExerciseData.sets.length} sets
            </span>
          </button>
        )}

        {/* ─── Finish Workout Button ─── */}
        <button
          onClick={() => setShowConfirmFinish(true)}
          className="w-full bg-gradient-to-r from-neon-green/12 to-emerald-500/12 text-neon-green font-semibold py-3.5 rounded-2xl border border-neon-green/20 hover:border-neon-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-press"
          aria-label={`Finish workout, ${progress.percent}% completed`}
        >
          <CheckCircle2 size={18} />
          <span className="text-sm">Finish Workout ({progress.percent}%)</span>
        </button>
      </div>

      {/* ═══ DIALOGS ═══ */}
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
    </div>
  );
}
