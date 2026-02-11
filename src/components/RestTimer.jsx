import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(60); // Default 60s
  const [isRunning, setIsRunning] = useState(false);
  
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const restTimerTrigger = useWorkoutStore((s) => s.restTimerTrigger);
  const previousTriggerRef = useRef(0);
  const intervalRef = useRef(null);

  // Auto-start timer when a set is marked as done (trigger updates)
  useEffect(() => {
    if (restTimerTrigger && restTimerTrigger > previousTriggerRef.current) {
      // Use setTimeout to avoid synchronous state update warning
      const timerId = setTimeout(() => {
        setIsOpen(true);
        setTimeLeft(totalTime);
        setIsRunning(true);
      }, 0);
      previousTriggerRef.current = restTimerTrigger;
      return () => clearTimeout(timerId);
    }
  }, [restTimerTrigger, totalTime]);

  // Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsRunning(false);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

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
        className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-black/50 active:scale-90 transition-all text-neon-blue"
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rest Timer</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsOpen(false); setIsRunning(false); }}
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
                 if (isRunning) setTimeLeft(l => l + 10);
                 else setTimeLeft(newTime);
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <Plus size={18} />
            </button>
             <button 
              onClick={() => {
                 const newTime = Math.max(10, totalTime - 10);
                 setTotalTime(newTime);
                 if (isRunning) setTimeLeft(l => Math.max(0, l - 10));
                 else setTimeLeft(newTime);
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <Minus size={18} />
            </button>
          </div>

          {/* Circle */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%" cy="50%" r={RADIUS}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50%" cy="50%" r={RADIUS}
                className={`transition-all duration-1000 ease-linear ${getColor()}`}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            
            {/* Time Text */}
            <div className="relative z-10 text-center">
               <span className="text-3xl font-bold font-mono text-white block leading-none">
                 {timeLeft}
               </span>
               <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">
                 Seconds
               </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
             <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isRunning ? 'bg-amber-500/10 text-amber-500' : 'bg-neon-blue/10 text-neon-blue'
              }`}
            >
              {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
             <button 
               onClick={() => {
                 setIsRunning(false);
                 setTimeLeft(totalTime);
               }}
               className="w-14 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center transition-all active:scale-95 hover:text-white"
             >
               <RotateCcw size={18} />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
