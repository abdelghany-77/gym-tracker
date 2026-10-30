import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw, Plus, Minus, Settings, Timer } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Preset rest times in seconds
const PRESETS = [30, 45, 60, 90, 120, 180];

export default function RestTimer({ inline = false }) {
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
      let restDuration = totalTime;
      if (activeWorkout?.exercises) {
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
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        440,
        ctx.currentTime + 0.5,
      );

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
  const progress = timeLeft / Math.max(1, totalTime);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Dynamic Color
  const getColor = () => {
    if (timeLeft === 0) return "stroke-emerald-500";
    if (timeLeft < 10) return "stroke-red-500";
    return "stroke-neon-cyan";
  };

  const getTextColor = () => {
    if (timeLeft === 0) return "text-emerald-400";
    if (timeLeft < 10) return "text-red-400";
    return "text-neon-cyan";
  };

  if (!activeWorkout) return null;

  // ═══ COMPACT HIGH-TECH INLINE REST TIMER ═══
  if (inline) {
    if (!isOpen && !isRunning) {
      // Sleek collapsed 34px trigger pill
      return (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeLeft(totalTime);
            setIsRunning(true);
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/80 transition-all active:scale-[0.99] text-xs select-none"
          aria-label="Start rest timer"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-neon-cyan/10 flex items-center justify-center shrink-0">
              <Timer size={12} className="text-neon-cyan" />
            </div>
            <span className="font-semibold text-slate-300 text-[11px]">Rest Timer:</span>
            <span className="font-mono text-neon-cyan font-bold text-[11px]">{totalTime}s</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
            Start Rest →
          </span>
        </button>
      );
    }

    // High-density active timer bar (~52px height)
    return (
      <div className="w-full bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-2 shadow-lg animate-fadeIn flex flex-col gap-1.5 select-none shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mini countdown badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs sm:text-sm border flex items-center gap-1.5 ${
                timeLeft < 10
                  ? "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse"
                  : "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30"
              }`}
            >
              <Timer size={13} className={isRunning ? "animate-pulse" : ""} />
              <span>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden min-[360px]:inline">
              {isRunning ? "Resting" : "Paused"}
            </span>
          </div>

          {/* Center: Quick adjust buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const newTime = Math.max(10, totalTime - 15);
                setTotalTime(newTime);
                if (isRunning) setTimeLeft((l) => Math.max(0, l - 15));
                else setTimeLeft(newTime);
              }}
              className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[10px] sm:text-[11px] font-mono transition-all active:scale-95"
              title="-15 seconds"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => {
                const newTime = totalTime + 15;
                setTotalTime(newTime);
                if (isRunning) setTimeLeft((l) => l + 15);
                else setTimeLeft(newTime);
              }}
              className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[10px] sm:text-[11px] font-mono transition-all active:scale-95"
              title="+15 seconds"
            >
              +15s
            </button>
          </div>

          {/* Right: Pause/Resume + Presets + Close */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!isRunning && timeLeft === 0) setTimeLeft(totalTime);
                setIsRunning(!isRunning);
              }}
              className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
                isRunning
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
              }`}
              aria-label={isRunning ? "Pause timer" : "Resume timer"}
            >
              {isRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
              title="Quick Presets"
            >
              <Settings size={12} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRunning(false);
                setTimeLeft(0);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-all active:scale-95"
              title="Stop timer"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft < 10 ? "bg-red-500" : "bg-gradient-to-r from-neon-cyan to-neon-green"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, (timeLeft / (totalTime || 60)) * 100))}%` }}
          />
        </div>

        {/* Presets dropdown */}
        {showPresets && (
          <div className="pt-1.5 mt-0.5 border-t border-slate-800/80 flex flex-wrap gap-1 justify-center animate-fadeIn">
            {PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTotalTime(s);
                  setTimeLeft(s);
                  setIsRunning(true);
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
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                  totalTime === s
                    ? "bg-neon-cyan text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══ FLOATING VERSION (legacy fallback) ═══
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 z-40 w-12 h-12 bg-slate-900/95 border border-slate-700/80 rounded-full flex items-center justify-center shadow-xl shadow-black/40 btn-press transition-all text-neon-blue hover:scale-105"
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
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center pointer-events-none px-4 pb-1">
      <div className="w-full max-w-sm bg-slate-900/98 backdrop-blur-2xl border border-slate-700/60 p-4 rounded-3xl shadow-2xl shadow-black/60 pointer-events-auto animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rest Timer
          </span>
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

        <div className="flex items-center justify-between gap-6">
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
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 btn-press transition-all hover:text-white"
              aria-label="Subtract 10 seconds"
            >
              <Minus size={18} />
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 btn-press transition-all hover:text-white"
              aria-label="Rest time presets"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r={RADIUS} className="stroke-slate-800" strokeWidth="6" fill="none" />
              <circle
                cx="50%" cy="50%" r={RADIUS}
                className={`transition-all duration-1000 ease-linear ${getColor()}`}
                strokeWidth="6" fill="none" strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="relative z-10 text-center" role="timer" aria-live="assertive" aria-atomic="true">
              <span className="text-3xl font-bold font-mono text-white block leading-none">{timeLeft}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">Seconds</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all btn-press ${
                isRunning ? "bg-amber-500/10 text-amber-500" : "bg-neon-blue/10 text-neon-blue"
              }`}
              aria-label={isRunning ? "Pause" : "Start"}
            >
              {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button
              onClick={() => { setIsRunning(false); setTimeLeft(totalTime); }}
              className="w-14 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center transition-all btn-press hover:text-white"
              aria-label="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {showPresets && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">Quick Set</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setTotalTime(s); setTimeLeft(s); setIsRunning(false);
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
                    totalTime === s ? "bg-neon-blue text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
