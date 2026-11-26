import { useState, useMemo } from "react";
import { Droplets, Plus, Minus, Pill, Check } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { haptics } from "../utils/haptics";

export default function ReminderWidget() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const userWeight = useWorkoutStore((s) => s.userProfile?.weight);
  const waterGoal = useMemo(() => {
    if (!Number.isFinite(userWeight) || userWeight <= 0) return 8;
    return Math.ceil((userWeight * 33) / 250);
  }, [userWeight]);
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const [animatingCup, setAnimatingCup] = useState(false);

  const waterCount = dailyChecklist?.water || 0;
  const waterPercent = Math.min(100, (waterCount / waterGoal) * 100);
  const waterComplete = waterCount >= waterGoal;
  const vitaminTaken = dailyChecklist?.vitamin || false;

  const handleAddCup = () => {
    incrementWater();
    haptics.medium();
    setAnimatingCup(true);
    setTimeout(() => setAnimatingCup(false), 400);
  };

  return (
    <div className="space-y-3">
      {/* Water Tracker Card */}
      <div className="rounded-2xl bg-bg-surface p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Droplets size={15} className="text-sky-400" aria-hidden="true" />
            Water Intake
          </h3>
          {waterComplete ? (
            <span className="text-xs font-semibold text-emerald-400">
              Goal reached
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {waterGoal - waterCount} cups left
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Compact Water Meter */}
          <div className="shrink-0">
            <div
              className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
                waterComplete
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-slate-700 bg-bg-deep"
              }`}
            >
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  height: `${waterPercent}%`,
                  background: waterComplete
                    ? "rgba(16, 185, 129, 0.22)"
                    : "rgba(56, 189, 248, 0.2)",
                }}
              />
              <span
                className={`text-lg font-bold font-mono tabular-nums relative z-10 transition-transform ${
                  animatingCup ? "scale-110" : "scale-100"
                } ${waterComplete ? "text-emerald-400" : "text-sky-400"}`}
              >
                {waterCount}
              </span>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums relative z-10">
                /{waterGoal}
              </span>
            </div>
          </div>

          {/* Progress bar + controls */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                <span>
                  {(waterCount * 0.25).toFixed(2)}L /{" "}
                  {(waterGoal * 0.25).toFixed(2)}L
                </span>
                <span>{Math.round(waterPercent)}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Water intake"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(waterPercent)}
                aria-valuetext={`${waterCount} of ${waterGoal} cups`}
                className="h-2 bg-slate-800 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    waterComplete ? "bg-emerald-400" : "bg-sky-400"
                  }`}
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decrementWater}
                disabled={waterCount === 0}
                className="flex-1 flex items-center justify-center min-h-10 rounded-xl bg-bg-deep border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
                aria-label="Remove a cup of water"
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                onClick={handleAddCup}
                className={`flex-[2] flex items-center justify-center gap-1.5 min-h-10 rounded-xl text-xs font-bold transition-colors active:scale-95 ${
                  waterComplete
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/25"
                    : "bg-slate-100 text-slate-950 hover:bg-white"
                }`}
                aria-label="Add a cup of water"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add Cup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vitamin Tracker Card */}
      <button
        type="button"
        onClick={() => toggleChecklistItem("vitamin")}
        className={`w-full rounded-2xl p-3.5 border transition-colors active:scale-[0.99] text-left ${
          vitaminTaken
            ? "border-emerald-500/35 bg-emerald-500/10"
            : "border-slate-800 bg-bg-surface hover:border-slate-700"
        }`}
        aria-pressed={vitaminTaken}
        aria-label={
          vitaminTaken
            ? "Unmark multivitamins as taken"
            : "Mark multivitamins as taken"
        }
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              vitaminTaken
                ? "bg-emerald-500 text-slate-950"
                : "bg-bg-deep border border-slate-800 text-slate-300"
            }`}
          >
            <Pill size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold ${
                vitaminTaken ? "text-emerald-300" : "text-white"
              }`}
            >
              Multivitamins
            </p>
            <p className="text-xs text-slate-400">1 Tablet / Day</p>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              vitaminTaken
                ? "bg-emerald-500 text-slate-950"
                : "border-2 border-slate-600 text-transparent"
            }`}
            aria-hidden="true"
          >
            <Check size={12} strokeWidth={3} />
          </div>
        </div>
      </button>
    </div>
  );
}
