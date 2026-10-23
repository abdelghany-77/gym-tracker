import { useState, useMemo } from "react";
import {
  Droplets,
  Plus,
  Minus,
  Pill,
  Sparkles,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { haptics } from "../utils/haptics";

export default function ReminderWidget() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const userWeight = useWorkoutStore((s) => s.userProfile?.weight);
  const waterGoal = useMemo(() => {
    if (!userWeight) return 8;
    return Math.ceil((userWeight * 33) / 250);
  }, [userWeight]);
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const [animatingCup, setAnimatingCup] = useState(false);

  const waterCount = dailyChecklist.water || 0;
  const waterPercent = Math.min(100, Math.round((waterCount / waterGoal) * 100));
  const waterComplete = waterCount >= waterGoal;
  const vitaminTaken = dailyChecklist.vitamin || false;

  const handleAddCup = () => {
    incrementWater();
    haptics.medium();
    setAnimatingCup(true);
    setTimeout(() => setAnimatingCup(false), 500);
  };

  return (
    <div className="space-y-2.5">
      {/* Water Tracker Card */}
      <div className="glass-card p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Droplets size={14} className="text-teal-400" />
            Water Intake
          </h3>
          {waterComplete ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles size={9} /> Goal Reached!
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              Target: {waterGoal} cups
            </span>
          )}
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-3">
          {/* Circular Indicator */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-surface-elevated"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                className={`transition-all duration-500 ${
                  waterComplete ? "stroke-emerald-400" : "stroke-teal-400"
                }`}
                strokeWidth="4"
                fill="none"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - waterPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xs font-bold font-mono ${animatingCup ? "scale-110" : ""} transition-transform`}>
                {waterCount}
              </span>
              <span className="text-[8px] text-slate-400">/{waterGoal}</span>
            </div>
          </div>

          {/* Quick info & Actions */}
          <div className="flex-1 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">
                {waterCount * 250} ml
              </span>
              <span className="text-slate-400 font-mono">
                {waterPercent}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={decrementWater}
                disabled={waterCount <= 0}
                className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center text-slate-400 hover:text-white border border-border disabled:opacity-30 active:scale-95 transition-all"
                aria-label="Remove a cup of water"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={handleAddCup}
                className={`flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  waterComplete
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                }`}
                aria-label="Add a cup of water"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>+1 Cup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vitamin Tracker Card */}
      <button
        onClick={() => toggleChecklistItem("vitamin")}
        className={`w-full glass-card p-3 flex items-center gap-3 transition-all active:scale-[0.98] ${
          vitaminTaken
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "hover:border-slate-600"
        }`}
        aria-label={
          vitaminTaken
            ? "Unmark multivitamins as taken"
            : "Mark multivitamins as taken"
        }
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
            vitaminTaken
              ? "bg-emerald-500 text-slate-950"
              : "bg-surface-elevated text-slate-400 border border-border"
          }`}
        >
          <Pill size={16} />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p
            className={`text-xs font-semibold ${
              vitaminTaken ? "text-emerald-400" : "text-white"
            }`}
          >
            Daily Multivitamins
          </p>
          <p className="text-[10px] text-slate-400">1 Tablet daily with meal</p>
        </div>
        {vitaminTaken && (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Taken
          </span>
        )}
      </button>
    </div>
  );
}
