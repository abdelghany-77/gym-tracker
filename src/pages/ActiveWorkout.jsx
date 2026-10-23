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
  const [completedSession, setCompletedSession] = useState(null);
  const [previousPRsSnapshot, setPreviousPRsSnapshot] = useState({});
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

  // Auto-advance to next exercise when all sets of current exercise are done
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
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeWorkout, currentIndex, autoAdvancedTo]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!activeWorkout) {
    if (completedSession) {
      return (
        <div className="min-h-screen bg-background">
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
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-elevated flex items-center justify-center border border-border">
          <Dumbbell size={26} className="text-slate-400" />
        </div>
        <p className="text-slate-300 font-medium">No active workout session.</p>
        <button
          onClick={() => navigate("/workout")}
          className="text-teal-400 hover:underline text-xs font-semibold"
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
    setPreviousPRsSnapshot({ ...personalRecords });
    const session = finishWorkout();
    setShowConfirmFinish(false);
    setCompletedSession(session);
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
    <div className="max-w-lg mx-auto flex flex-col h-[100dvh] bg-background">
      {/* ═══ WORKOUT HEADER ═══ */}
      <div className="shrink-0 bg-background px-4 pt-3 pb-2 space-y-2 border-b border-border">
        {/* Top row: back, title, timer, cancel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center hover:bg-surface-hover active:scale-95 transition-all text-slate-300"
            aria-label="Cancel or go back"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate tracking-tight">
              {activeWorkout.programName}
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 text-xs text-teal-400 font-mono font-bold bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/20"
            aria-live="polite"
          >
            <Clock size={12} />
            <span>{formatTime(elapsed)}</span>
          </div>

          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center hover:bg-rose-500/15 hover:text-rose-400 text-slate-400 active:scale-95 transition-all"
            aria-label="Discard workout"
            title="Discard workout"
          >
            <X size={15} />
          </button>
        </div>

        {/* Progress bar + exercise indicator dots */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percent}%` }}
                role="progressbar"
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0">
              {progress.doneSets}/{progress.totalSets} sets
            </span>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1 shrink-0">
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
                      ? "w-4 bg-teal-400"
                      : allDone
                        ? "w-1.5 bg-emerald-400"
                        : "w-1.5 bg-surface-elevated border border-border"
                  }`}
                  aria-label={`Go to exercise ${i + 1}`}
                  aria-current={i === currentIndex ? "step" : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SCROLLABLE EXERCISE AREA ═══ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-3"
      >
        {/* Exercise number navigator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-25 transition-all active:scale-90"
              aria-label="Previous exercise"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-slate-400">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="text-slate-500 mx-0.5">/</span>
              <span>{totalExercises}</span>
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === totalExercises - 1}
              className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-25 transition-all active:scale-90"
              aria-label="Next exercise"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {progress.percent === 100 && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-fadeIn">
              <Zap size={12} />
              All sets logged!
            </div>
          )}
        </div>

        {/* ── Exercise Card ── */}
        <div key={currentExercise.exerciseId} className="animate-fadeIn">
          <ExerciseCard
            exerciseIndex={currentIndex}
            exerciseData={currentExercise}
          />
        </div>

        {/* ── Inline Rest Timer ── */}
        <RestTimer inline />

        {/* ── Up Next Preview ── */}
        {nextExercise && (
          <button
            onClick={goNext}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-slate-600 transition-all active:scale-[0.98] btn-press"
            aria-label={`Next up: ${nextExercise.name}`}
          >
            <div className="w-7 h-7 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0 border border-border">
              <ChevronRight size={13} className="text-teal-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Up Next
              </p>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {nextExercise.name}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 bg-surface-elevated border border-border px-2 py-0.5 rounded-md font-mono">
              {nextExerciseData.sets.length} sets
            </span>
          </button>
        )}
      </div>

      {/* ═══ STICKY BOTTOM ACTION BAR ═══ */}
      <div className="shrink-0 px-4 pb-4 pt-2.5 bg-background border-t border-border shadow-lg">
        <button
          onClick={() => setShowConfirmFinish(true)}
          className={`w-full font-bold py-3.5 rounded-xl border flex items-center justify-center gap-2 btn-press transition-all ${
            progress.percent === 100
              ? "bg-teal-500 hover:bg-teal-400 text-slate-950 border-teal-500 shadow-sm"
              : "bg-surface-elevated hover:bg-surface-hover text-teal-400 border-teal-500/40"
          }`}
          aria-label={`Finish workout, ${progress.percent}% logged`}
        >
          <CheckCircle2 size={17} />
          <span className="text-sm">Finish Workout ({progress.percent}%)</span>
        </button>
      </div>

      {/* ═══ DIALOGS ═══ */}
      <ConfirmDialog
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={handleFinish}
        title="Finish Workout?"
        message={`You've logged ${progress.doneSets} of ${progress.totalSets} sets (${progress.percent}%). Only completed sets will be recorded.`}
        confirmText="Save & Finish"
        cancelText="Keep Training"
        variant="success"
      />

      <ConfirmDialog
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Discard Workout?"
        message="All logged sets from this active session will be permanently deleted."
        confirmText="Discard Session"
        cancelText="Resume"
        variant="danger"
      />

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
