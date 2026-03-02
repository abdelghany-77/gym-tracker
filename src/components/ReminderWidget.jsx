import { useState } from "react";
import {
  Droplets,
  Plus,
  Minus,
  Pill,
  Sparkles,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

export default function ReminderWidget() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const waterGoal = useWorkoutStore((s) => s.getWaterGoal());
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const [animatingCup, setAnimatingCup] = useState(false);

  const waterCount = dailyChecklist.water || 0;
  const waterPercent = Math.min(100, (waterCount / waterGoal) * 100);
  const waterComplete = waterCount >= waterGoal;
  const vitaminTaken = dailyChecklist.vitamin || false;

  const handleAddCup = () => {
    incrementWater();
    setAnimatingCup(true);
    setTimeout(() => setAnimatingCup(false), 500);
  };

  return (
    <div className="space-y-3">
      {/* Water Tracker Card */}
      <div className="relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/8 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplets size={16} className="text-cyan-400" />
              Water Intake
            </h3>
            {waterComplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                <Sparkles size={10} /> Goal Reached!
              </span>
            )}
          </div>

          {/* Progress Section */}
          <div className="flex items-center gap-4">
            {/* Water Display */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
                  waterComplete
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-cyan-400/30 bg-slate-800/80"
                }`}
              >
                {/* Water fill animation */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                  style={{
                    height: `${waterPercent}%`,
                    background: waterComplete
                      ? "linear-gradient(to top, rgba(52,211,153,0.25), rgba(52,211,153,0.1))"
                      : "linear-gradient(to top, rgba(0,212,255,0.25), rgba(0,212,255,0.05))",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-wave" />
                </div>

                <span
                  className={`text-xl font-bold relative z-10 transition-all ${animatingCup ? "scale-125" : "scale-100"} ${
                    waterComplete ? "text-emerald-400" : "text-cyan-400"
                  }`}
                >
                  {waterCount}
                </span>
                <span className="text-[10px] text-slate-500 font-medium relative z-10">
                  / {waterGoal} cups
                </span>
              </div>
            </div>

            {/* Progress bar + controls */}
            <div className="flex-1 space-y-3">
              {/* Info */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>
                    {(waterCount * 0.25).toFixed(2)}L /{" "}
                    {(waterGoal * 0.25).toFixed(2)}L
                  </span>
                  <span>
                    {waterGoal - waterCount > 0
                      ? `${waterGoal - waterCount} left`
                      : "Done!"}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out animate-fillProgress ${
                      waterComplete
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                    }`}
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>

              {/* Add/Remove Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementWater}
                  disabled={waterCount === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 btn-press"
                  aria-label="Remove a cup of water"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={handleAddCup}
                  className={`flex-[2] flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-bold transition-all active:scale-95 btn-press ${
                    waterComplete
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-500/30"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                  }`}
                  aria-label="Add a cup of water"
                >
                  <Plus size={14} strokeWidth={3} />
                  <span>Add Cup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitamin Tracker Card */}
      <button
        onClick={() => toggleChecklistItem("vitamin")}
        className={`w-full relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 border overflow-hidden transition-all active:scale-[0.98] btn-press ${
          vitaminTaken
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-slate-800 hover:border-slate-700"
        }`}
        aria-label={
          vitaminTaken
            ? "Unmark multivitamins as taken"
            : "Mark multivitamins as taken"
        }
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/8 rounded-full blur-3xl -translate-y-16 -translate-x-8 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              vitaminTaken
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-vitamin-check"
                : "bg-slate-800 text-violet-400"
            }`}
          >
            <Pill size={22} />
          </div>
          <div className="text-left flex-1">
            <p
              className={`text-sm font-semibold ${vitaminTaken ? "text-emerald-400" : "text-white"}`}
            >
              Multivitamins
            </p>
            <p className="text-[11px] text-slate-500">1 Tablet / Day</p>
          </div>
          {vitaminTaken && (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center animate-set-complete">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
