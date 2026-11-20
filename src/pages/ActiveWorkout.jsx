import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Clock,
  Dumbbell,
  Flag,
  ChevronDown,
  ChevronRight,
  Layers,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import AngleCoverageBadge from "../components/AngleCoverageBadge";
import SwapExerciseModal from "../components/SwapExerciseModal";
import Modal, { ConfirmDialog } from "../components/Modal";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import { primeAudio, playHydrationChime } from "../utils/audioUtil";
import {
  isNative,
  keepAwake,
  allowSleep,
  scheduleHydrationNotifications,
  cancelHydrationNotifications,
} from "../utils/nativeBridge";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "../utils/notificationService";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

// Hydration quick-pick options (0 = Off) + custom minute input
const HYDRATION_PRESETS = [0, 10, 15, 20, 30];

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const exercises = useWorkoutStore((s) => s.exercises);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const hydrationIntervalMinutes = useWorkoutStore(
    (s) => s.hydrationIntervalMinutes,
  );
  const setHydrationInterval = useWorkoutStore((s) => s.setHydrationInterval);

  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [previousPRsSnapshot, setPreviousPRsSnapshot] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [swapTargetAngle, setSwapTargetAngle] = useState(null);
  const [showAngleSwapModal, setShowAngleSwapModal] = useState(false);
  const [showHydrationMenu, setShowHydrationMenu] = useState(false);
  const [advanceNotice, setAdvanceNotice] = useState(false);
  const [hydrationToast, setHydrationToast] = useState(false);
  const [customHydration, setCustomHydration] = useState("");
  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const nextHydrationAtRef = useRef(null);

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

  // ── Auto-advance: brief confirmation, then move to the next exercise ──
  const totalExercises = activeWorkout?.exercises?.length || 0;

  const goNextExercise = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, totalExercises - 1));
  }, [totalExercises]);

  const handleAllSetsComplete = useCallback(() => {
    // Nothing to advance to on the last exercise.
    if (totalExercises < 2) return;
    if (currentIndex >= totalExercises - 1) return;
    setAdvanceNotice(true);
    clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      setAdvanceNotice(false);
      goNextExercise();
    }, 1600);
  }, [currentIndex, totalExercises, goNextExercise]);

  useEffect(() => {
    return () => clearTimeout(advanceTimeoutRef.current);
  }, []);

  // Unlock the shared AudioContext early (web gesture policy; no-op on native)
  useEffect(() => {
    primeAudio();
  }, []);

  // ── Keep the screen awake for the whole session; release on finish/close ──
  useEffect(() => {
    if (!activeWorkout) return undefined;
    void keepAwake();
    return () => {
      void allowSleep();
    };
  }, [activeWorkout]);

  // ── Native: request notification permission at first workout start so the
  // rest timer / hydration alerts are cleared for background delivery ──
  useEffect(() => {
    if (!activeWorkout || !isNative()) return;
    void (async () => {
      try {
        const permission = await getNotificationPermission();
        if (permission === "default") await requestNotificationPermission();
      } catch {
        /* surfaced later by the in-app permission UI */
      }
    })();
  }, [activeWorkout]);

  const dismissAdvanceNotice = useCallback(() => {
    clearTimeout(advanceTimeoutRef.current);
    setAdvanceNotice(false);
  }, []);

  // ── Configurable hydration reminder during active workouts ──
  useEffect(() => {
    if (!activeWorkout || !hydrationIntervalMinutes) {
      nextHydrationAtRef.current = null;
      return undefined;
    }
    // Arm the next reminder relative to now (wall-clock, background-safe)
    if (
      nextHydrationAtRef.current === null ||
      nextHydrationAtRef.current < Date.now()
    ) {
      nextHydrationAtRef.current =
        Date.now() + hydrationIntervalMinutes * 60_000;
    }
    const check = () => {
      if (Date.now() >= nextHydrationAtRef.current) {
        nextHydrationAtRef.current =
          Date.now() + hydrationIntervalMinutes * 60_000;
        setHydrationToast(true);
        playHydrationChime();
        try {
          navigator.vibrate?.([80, 60, 80]);
        } catch {
          /* unsupported */
        }
        setTimeout(() => setHydrationToast(false), 5000);
      }
    };
    const interval = setInterval(check, 10_000);
    // Wall-clock timestamps survive backgrounding; re-check immediately when
    // the app resumes so a due reminder fires right away (never late/drifted).
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    check();
    // Native: pre-schedule a batch of spaced reminders so hydration alerts
    // also fire while the WebView is backgrounded or the screen is locked
    // (foreground JS timers are throttled). Cancelled on interval change /
    // workout end and re-scheduled at the current interval.
    void scheduleHydrationNotifications(hydrationIntervalMinutes);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      void cancelHydrationNotifications();
    };
  }, [activeWorkout, hydrationIntervalMinutes]);

  const progress = useMemo(() => {
    const activeExList = activeWorkout?.exercises || [];
    if (!activeWorkout)
      return { totalSets: 0, doneSets: 0, percent: 0, workingVolume: 0 };
    const totalSets = activeExList.reduce(
      (acc, e) => acc + (e.sets || []).length,
      0,
    );
    const doneSets = activeExList.reduce(
      (acc, e) => acc + (e.sets || []).filter((s) => s.done).length,
      0,
    );
    const workingVolume = activeExList.reduce(
      (acc, e) =>
        acc +
        (e.sets || []).reduce((sAcc, s) => {
          if (!s.done || s.type === "W") return sAcc;
          return sAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }, 0),
      0,
    );
    return {
      totalSets,
      doneSets,
      workingVolume: Math.round(workingVolume),
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

  const currentExercise = (activeWorkout.exercises || [])[currentIndex];
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
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-5rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-2rem)] overflow-hidden bg-bg-deep">
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
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400 tabular-nums">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              {progress.doneSets}/{progress.totalSets} sets · {progress.percent}%
              {progress.workingVolume > 0 && (
                <span> · {progress.workingVolume.toLocaleString()} kg</span>
              )}
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
            onClick={() => setShowHydrationMenu((open) => !open)}
            aria-label="Hydration reminder settings"
            title={`Hydration reminder: ${hydrationIntervalMinutes ? `every ${hydrationIntervalMinutes} min` : "Off"}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              hydrationIntervalMinutes
                ? "text-cyan-400 hover:bg-cyan-500/10"
                : "text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
            }`}
          >
            <Droplets size={16} aria-hidden="true" />
          </button>
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

        {/* ── Hydration reminder quick settings ── */}
        {showHydrationMenu && (
          <div className="rounded-xl bg-slate-900/95 border border-slate-700 p-2.5 space-y-2 animate-fadeIn">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
              <Droplets size={11} className="text-cyan-400" /> Remind me to drink water every
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {HYDRATION_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setHydrationInterval(minutes)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                    hydrationIntervalMinutes === minutes
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-white"
                  }`}
                >
                  {minutes === 0 ? "Off" : `${minutes}m`}
                </button>
              ))}
              <span className="w-px h-5 bg-slate-700 mx-0.5" aria-hidden="true" />
              <input
                type="number"
                inputMode="numeric"
                min="5"
                max="180"
                placeholder="min"
                value={customHydration}
                onChange={(event) => setCustomHydration(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const value = Number(customHydration);
                    if (Number.isFinite(value) && value > 0) {
                      setHydrationInterval(value);
                      setCustomHydration("");
                    }
                  }
                }}
                className="w-14 bg-slate-800 text-white rounded-lg px-2 py-1 border border-slate-600 focus:border-cyan-400 focus:outline-none text-xs text-center tabular-nums"
                aria-label="Custom hydration interval in minutes"
              />
              <button
                type="button"
                onClick={() => {
                  const value = Number(customHydration);
                  if (Number.isFinite(value) && value > 0) {
                    setHydrationInterval(value);
                    setCustomHydration("");
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25"
              >
                Set
              </button>
            </div>
          </div>
        )}
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
              {(activeWorkout.exercises || []).map((entry, index) => (
                <option
                  key={`${entry.exerciseId}-${index}`}
                  value={index}
                  className="bg-bg-surface text-white"
                >
                  {index + 1}/{totalExercises} ·{" "}
                  {exercises.find(
                    (exercise) => exercise.id === entry.exerciseId,
                  )?.name || "Exercise"}
                  {(entry.sets || []).length > 0 &&
                  (entry.sets || []).every((set) => set.done)
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/70 text-white hover:bg-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Next exercise"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Quick Exercise Step Progress Strip */}
        {totalExercises > 1 && (
          <div
            className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5"
            aria-label="Exercise progress steps"
          >
            {(activeWorkout.exercises || []).map((entry, idx) => {
              const entrySets = entry.sets || [];
              const allDone =
                entrySets.length > 0 && entrySets.every((s) => s.done);
              const anyDone = entrySets.some((s) => s.done);
              const isCurrent = idx === currentIndex;
              const exName =
                exercises.find((e) => e.id === entry.exerciseId)?.name ||
                `Exercise ${idx + 1}`;
              return (
                <button
                  key={`${entry.exerciseId}-step-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to ${idx + 1}: ${exName}${allDone ? " (completed)" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`h-7 min-w-7 flex-1 rounded-md text-[11px] font-mono font-semibold transition-colors tabular-nums ${
                    isCurrent
                      ? "bg-slate-200 text-slate-950"
                      : allDone
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : anyDone
                          ? "bg-slate-700/80 text-slate-200 border border-slate-600"
                          : "bg-slate-800/70 text-slate-400 hover:text-white"
                  }`}
                >
                  {allDone ? "✓" : idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ CENTER WORKOUT EXECUTION AREA (Zero Scroll Optimized) ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-3 custom-scrollbar">
        {/* Auto-advance confirmation (brief, cancellable) — Rest Timer stays docked below */}
        {advanceNotice && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <CheckCircle2 size={16} className="text-neon-emerald shrink-0" />
              <span className="text-white font-semibold">Exercise complete!</span>
              <span className="text-slate-400 truncate">Advancing…</span>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={dismissAdvanceNotice}
                className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissAdvanceNotice();
                  goNextExercise();
                }}
                className="text-[10px] px-2 py-1 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center gap-0.5"
              >
                Next <ChevronRight size={11} />
              </button>
            </div>
          </div>
        )}

        {currentExercise && (
          <div key={currentExercise.exerciseId} className="animate-fadeIn">
            <ExerciseCard
              exerciseIndex={currentIndex}
              exerciseData={currentExercise}
              onAllSetsComplete={handleAllSetsComplete}
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
      {/* Hydration toast (subtle, non-intrusive) */}
      {hydrationToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slideUp pointer-events-none px-4">
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 px-4 py-2.5 shadow-2xl shadow-black/50">
            <Droplets size={16} className="text-cyan-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-white font-medium">
              Time to hydrate 💧 Take a few sips of water.
            </p>
          </div>
        </div>
      )}

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
