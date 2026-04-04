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
  const progress = timeLeft / totalTime;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Dynamic Color
  const getColor = () => {
    if (timeLeft === 0) return "stroke-emerald-500";
    if (timeLeft < 10) return "stroke-red-500";
    return "stroke-neon-blue";
  };

  const getTextColor = () => {
    if (timeLeft === 0) return "text-emerald-400";
    if (timeLeft < 10) return "text-red-400";
    return "text-neon-blue";
  };

  if (!activeWorkout) return null;

  // ═══ INLINE VERSION (embedded in page flow) ═══
  if (inline) {
    if (!isOpen && !isRunning) {
      // Collapsed inline bar
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/60 hover:border-slate-700 transition-all active:scale-[0.98]"
          aria-label="Open rest timer"
        >
          <div className="w-9 h-9 rounded-xl bg-neon-blue/10 flex items-center justify-center shrink-0">
            <Timer size={16} className="text-neon-blue" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs text-slate-400 font-medium">Rest Timer</p>
            <p className="text-[10px] text-slate-500">Tap to set up</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{totalTime}s</span>
        </button>
      );
    }

    // Expanded inline timer
    return (
      <div className="w-full bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden animate-fadeIn">
        {/* Compact header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <Timer size={13} className="text-neon-blue" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rest Timer
            </span>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsRunning(false);
              setTimeLeft(0);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
            aria-label="Close rest timer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Timer body - horizontal layout */}
        <div className="flex items-center gap-4 p-4">
          {/* Circle */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r={RADIUS}
                className="stroke-slate-800"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r={RADIUS}
                className={`transition-all duration-1000 ease-linear ${getColor()}`}
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div
              className="relative z-10 text-center"
              role="timer"
              aria-live="assertive"
              aria-atomic="true"
            >
              <span className={`text-2xl font-bold font-mono block leading-none ${getTextColor()}`}>
                {timeLeft}
              </span>
              <span className="text-[8px] text-slate-500 font-medium uppercase">
                sec
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Play/Pause + Reset row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!isRunning && timeLeft === 0) setTimeLeft(totalTime);
                  setIsRunning(!isRunning);
                }}
                className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all btn-press text-sm font-medium ${
                  isRunning
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-neon-blue/15 text-neon-blue border border-neon-blue/30"
                }`}
                aria-label={isRunning ? "Pause" : "Start"}
              >
                {isRunning ? (
                  <><Pause size={14} fill="currentColor" /> Pause</>
                ) : (
                  <><Play size={14} fill="currentColor" /> {timeLeft === 0 ? "Start" : "Resume"}</>
                )}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(totalTime);
                }}
                className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center transition-all btn-press hover:text-white border border-slate-700/50"
                aria-label="Reset"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* +/- buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const newTime = Math.max(10, totalTime - 10);
                  setTotalTime(newTime);
                  if (isRunning) setTimeLeft((l) => Math.max(0, l - 10));
                  else setTimeLeft(newTime);
                }}
                className="flex-1 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 btn-press text-xs gap-1 border border-slate-700/30 hover:text-white transition-colors"
              >
                <Minus size={12} /> 10s
              </button>
              <button
                onClick={() => {
                  const newTime = totalTime + 10;
                  setTotalTime(newTime);
                  if (isRunning) setTimeLeft((l) => l + 10);
                  else setTimeLeft(newTime);
                }}
                className="flex-1 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 btn-press text-xs gap-1 border border-slate-700/30 hover:text-white transition-colors"
              >
                <Plus size={12} /> 10s
              </button>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 btn-press border border-slate-700/30 hover:text-white transition-colors"
                aria-label="Presets"
              >
                <Settings size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        {showPresets && (
          <div className="px-4 pb-3 pt-1 border-t border-slate-800/40">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setTotalTime(s);
                    setTimeLeft(s);
                    setIsRunning(false);
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
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white btn-press transition-all"
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
