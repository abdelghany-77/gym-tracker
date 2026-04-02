import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw, Plus, Minus, Settings } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Preset rest times in seconds
const PRESETS = [30, 45, 60, 90, 120, 180];

export default function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const restTimerTrigger = useWorkoutStore((s) => s.restTimerTrigger);
  const exerciseRestTimes = useWorkoutStore((s) => s.exerciseRestTimes);
  const setExerciseRestTime = useWorkoutStore((s) => s.setExerciseRestTime);
  const previousTriggerRef = useRef(0);
  const intervalRef = useRef(null);

  // Auto-start timer when a set is marked as done
  useEffect(() => {
    if (restTimerTrigger && restTimerTrigger > previousTriggerRef.current) {
      // Determine which exercise was just completed to get its rest time
      let restDuration = totalTime;
      if (activeWorkout?.exercises) {
        // Find the current exercise being worked on (last one with a done set)
        for (let i = activeWorkout.exercises.length - 1; i >= 0; i--) {
          const ex = activeWorkout.exercises[i];
          const hasDoneSet = ex.sets.some((s) => s.done);
          if (hasDoneSet) {
            const exerciseRest = exerciseRestTimes[ex.exerciseId];
            if (exerciseRest) restDuration = exerciseRest;
            break;
          }
        }
      }

      const timerId = setTimeout(() => {
        setTotalTime(restDuration);
        setIsOpen(true);
        setTimeLeft(restDuration);
        setIsRunning(true);
      }, 0);
      previousTriggerRef.current = restTimerTrigger;
      return () => clearTimeout(timerId);
    }
  }, [restTimerTrigger, totalTime, activeWorkout, exerciseRestTimes]);

  // Audio Context Ref
  const audioContextRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(
        440,
        ctx.currentTime + 0.5,
      ); // Drop to A4

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsRunning(false);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            playBeep();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, playBeep]);

  // Progress Offset
  const progress = timeLeft / totalTime;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Dynamic Color
  const getColor = () => {
    if (timeLeft === 0) return "stroke-emerald-500";
    if (timeLeft < 10) return "stroke-red-500";
    return "stroke-neon-blue";
  };

  if (!activeWorkout) return null;

  if (!isOpen) {
    // Mini Floating Button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-black/50 btn-press transition-all text-neon-blue"
        aria-label={
          isRunning ? `Rest timer: ${timeLeft} seconds left` : "Open rest timer"
        }
      >
        <div className="absolute inset-0 rounded-full border-2 border-neon-blue/20" />
        {isRunning ? (
          <span className="text-xs font-bold font-mono">{timeLeft}</span>
        ) : (
          <Play size={18} className="ml-0.5" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none pb-24 px-4">
      <div className="w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-3xl shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rest Timer
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsRunning(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Circular Timer & Controls */}
        <div className="flex items-center justify-between gap-6">
          {/* Adjustment Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const newTime = totalTime + 10;
                setTotalTime(newTime);
                if (isRunning) setTimeLeft((l) => l + 10);
                else setTimeLeft(newTime);
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white btn-press transition-all"
              aria-label="Add 10 seconds"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => {
                const newTime = Math.max(10, totalTime - 10);
                setTotalTime(newTime);
                if (isRunning) setTimeLeft((l) => Math.max(0, l - 10));
                else setTimeLeft(newTime);
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white btn-press transition-all"
              aria-label="Subtract 10 seconds"
            >
              <Minus size={18} />
            </button>
            {/* Preset selector (item 6) */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 btn-press transition-all hover:text-white"
              aria-label="Rest time presets"
            >
              <Settings size={14} />
            </button>
          </div>

          {/* Circle */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r={RADIUS}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r={RADIUS}
                className={`transition-all duration-1000 ease-linear ${getColor()}`}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>

            {/* Time Text */}
            <div
              className="relative z-10 text-center"
              role="timer"
              aria-live="assertive"
              aria-atomic="true"
            >
              <span className="text-3xl font-bold font-mono text-white block leading-none">
                {timeLeft}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">
                Seconds
              </span>
              <span className="sr-only">
                {timeLeft === 0
                  ? "Rest timer complete"
                  : `${timeLeft} seconds remaining`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all btn-press ${
                isRunning
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-neon-blue/10 text-neon-blue"
              }`}
              aria-label={isRunning ? "Pause rest timer" : "Start rest timer"}
            >
              {isRunning ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(totalTime);
              }}
              className="w-14 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center transition-all btn-press hover:text-white"
              aria-label="Reset rest timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Preset buttons (item 6) */}
        {showPresets && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">Quick Set</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setTotalTime(s);
                    setTimeLeft(s);
                    setIsRunning(false);
                    // Save for current exercise if one is active
                    if (activeWorkout?.exercises) {
                      for (let i = activeWorkout.exercises.length - 1; i >= 0; i--) {
                        if (activeWorkout.exercises[i].sets.some((st) => st.done)) {
                          setExerciseRestTime(activeWorkout.exercises[i].exerciseId, s);
                          break;
                        }
                      }
                    }
                    setShowPresets(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    totalTime === s
                      ? "bg-neon-blue text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {s >= 60 ? `${s / 60}m` : `${s}s`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
