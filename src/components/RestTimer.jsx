import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "120s", seconds: 120 },
];

export default function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = useCallback((seconds) => {
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setIsRunning(true);
    setIsOpen(true);
  }, []);

  const togglePause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(0);
    setIsRunning(false);
    setTotalTime(0);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Vibrate on completion if supported
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isComplete = totalTime > 0 && timeLeft === 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-neon-blue/20 text-neon-blue rounded-full p-3.5 shadow-lg border border-neon-blue/30 active:scale-95 transition-transform"
      >
        <Timer size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-56">
      <div
        className={`rounded-2xl p-4 shadow-2xl border transition-all duration-300 ${
          isComplete
            ? "bg-emerald-950/90 border-emerald-500/50 animate-pulse-neon"
            : isRunning
              ? "bg-slate-900/95 border-neon-blue/40 animate-pulse-neon"
              : "bg-slate-900/95 border-slate-700"
        } backdrop-blur-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Rest Timer
          </span>
          <button
            onClick={() => {
              setIsOpen(false);
              resetTimer();
            }}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Timer display */}
        <div className="text-center mb-3">
          <div
            className={`text-4xl font-mono font-bold tracking-wider ${
              isComplete
                ? "text-emerald-400"
                : timeLeft <= 10 && isRunning
                  ? "text-red-400"
                  : "text-white"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
          {isComplete && (
            <p className="text-emerald-400 text-xs mt-1 font-medium">GO! 💪</p>
          )}
        </div>

        {/* Progress bar */}
        {totalTime > 0 && (
          <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isComplete ? "bg-emerald-400" : "bg-neon-blue"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Controls */}
        {totalTime > 0 ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={togglePause}
              className="bg-slate-800 hover:bg-slate-700 rounded-full p-2.5 transition-colors active:scale-95"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={resetTimer}
              className="bg-slate-800 hover:bg-slate-700 rounded-full p-2.5 transition-colors active:scale-95"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.map(({ label, seconds }) => (
              <button
                key={label}
                onClick={() => startTimer(seconds)}
                className="bg-neon-blue/15 text-neon-blue text-sm font-semibold px-4 py-2 rounded-xl border border-neon-blue/30 hover:bg-neon-blue/25 active:scale-95 transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
