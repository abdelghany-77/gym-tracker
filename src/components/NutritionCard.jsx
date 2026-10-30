import { Flame, Beef, Wheat, Droplets, Leaf, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const macroConfig = [
  {
    key: "protein",
    label: "Protein",
    unit: "g",
    icon: Beef,
    color: "text-neon-blue",
    bg: "bg-neon-blue/10",
    border: "border-neon-blue/20",
    barColor: "bg-neon-blue",
    hex: "#3b82f6",
  },
  {
    key: "carbs",
    label: "Carbs",
    unit: "g",
    icon: Wheat,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    barColor: "bg-amber-400",
    hex: "#fbbf24",
  },
  {
    key: "fat",
    label: "Fat",
    unit: "g",
    icon: Droplets,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    barColor: "bg-rose-400",
    hex: "#fb7185",
  },
  {
    key: "fiber",
    label: "Fiber",
    unit: "g",
    icon: Leaf,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    barColor: "bg-emerald-400",
    hex: "#34d399",
  },
  {
    key: "calcium",
    label: "Calcium",
    unit: "mg",
    icon: Pill,
    color: "text-slate-300",
    bg: "bg-slate-700/50",
    border: "border-slate-600",
    barColor: "bg-slate-400",
    hex: "#cbd5e1",
  },
];

export default function NutritionCard({ compact = false }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const calorieGoal = nutritionTargets.calories;
  const caloriePercent =
    calorieGoal > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100)),
        )
      : 0;

  if (compact) {
    return (
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Flame size={13} className="text-orange-400" />
            Daily Nutrition
          </h3>
          <span className="text-[10px] text-slate-400">
            {caloriesConsumed} / {calorieGoal} kcal
          </span>
        </div>

        {/* Calorie progress bar */}
        <div className="space-y-1">
          <div
            role="progressbar"
            aria-label="Daily calories"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={caloriePercent}
            aria-valuetext={`${caloriesConsumed} of ${calorieGoal} kcal`}
            className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90
                  ? "bg-gradient-to-r from-neon-green to-emerald-400"
                  : "bg-gradient-to-r from-orange-500 to-amber-400"
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 text-right">
            {caloriePercent}% of daily goal
          </p>
        </div>

        {/* Quick macros */}
        <div className="grid grid-cols-3 gap-1.5">
          {macroConfig.slice(0, 3).map((m) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.key}
                className={`p-2 rounded-xl ${m.bg} border ${m.border} text-center`}
              >
                <IconComp size={12} className={`${m.color} mx-auto mb-0.5`} />
                <p className={`text-xs font-bold ${m.color}`}>
                  {nutritionTargets[m.key]}
                  <span className="text-[8px] font-normal ml-0.5">
                    {m.unit}
                  </span>
                </p>
                <p className="text-[9px] text-slate-400">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full version (Nutrition / Profile page) — Clean, compact, essential info
  return (
    <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Flame size={14} className="text-orange-400" />
          Nutrition Targets
        </h2>
        <span className="text-[10px] text-slate-400 font-medium">
          {caloriePercent}% of daily goal
        </span>
      </div>

      {/* Calorie goal */}
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-xl p-3 border border-orange-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <p className="text-[10px] text-orange-400/80 uppercase tracking-wider font-semibold">
            Daily Calories
          </p>
          <p className="text-xl font-bold text-orange-400">
            {calorieGoal}
            <span className="text-xs font-normal ml-1">kcal</span>
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Daily calories"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={caloriePercent}
          aria-valuetext={`${caloriesConsumed} of ${calorieGoal} kcal`}
          className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-slate-800/50 relative z-10"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              caloriePercent >= 90
                ? "bg-gradient-to-r from-neon-green to-emerald-400"
                : "bg-gradient-to-r from-orange-500 to-amber-400"
            }`}
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium relative z-10">
          {caloriesConsumed} consumed today
        </p>
      </div>

      {/* Quick Macros 3-Col */}
      <div className="grid grid-cols-3 gap-2">
        {macroConfig.slice(0, 3).map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.key}
              className={`p-2.5 rounded-xl ${m.bg} border ${m.border} text-center`}
            >
              <IconComp size={13} className={`${m.color} mx-auto mb-1`} />
              <p className={`text-sm font-bold ${m.color}`}>
                {nutritionTargets[m.key]}
                <span className="text-[9px] font-normal ml-0.5">{m.unit}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {m.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Micro targets (Fiber & Calcium) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {macroConfig.slice(3).map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.key}
              className={`p-2.5 rounded-xl ${m.bg} border ${m.border} flex items-center justify-between`}
            >
              <div className="flex items-center gap-1.5">
                <IconComp size={13} className={m.color} />
                <span className="text-[10px] text-slate-400 font-medium">
                  {m.label}
                </span>
              </div>
              <span className={`text-xs font-bold ${m.color}`}>
                {nutritionTargets[m.key]}{" "}
                <span className="text-[8px] font-normal">{m.unit}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
