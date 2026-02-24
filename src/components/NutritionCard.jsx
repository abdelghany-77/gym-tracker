import { Flame, Beef, Wheat, Droplets, Leaf, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const macroConfig = [
  { key: "protein", label: "Protein", unit: "g", icon: Beef, color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/20", barColor: "bg-neon-blue" },
  { key: "carbs", label: "Carbs", unit: "g", icon: Wheat, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", barColor: "bg-amber-400" },
  { key: "fat", label: "Fat", unit: "g", icon: Droplets, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", barColor: "bg-rose-400" },
  { key: "fiber", label: "Fiber", unit: "g", icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", barColor: "bg-emerald-400" },
  { key: "calcium", label: "Calcium", unit: "mg", icon: Pill, color: "text-slate-300", bg: "bg-slate-700/50", border: "border-slate-600", barColor: "bg-slate-400" },
];

export default function NutritionCard({ compact = false }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const calorieGoal = nutritionTargets.calories;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100));

  if (compact) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            Daily Nutrition
          </h3>
          <span className="text-[11px] text-slate-500">
            {caloriesConsumed} / {calorieGoal} kcal
          </span>
        </div>

        {/* Calorie progress bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90
                  ? "bg-gradient-to-r from-neon-green to-emerald-400"
                  : "bg-gradient-to-r from-orange-500 to-amber-400"
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right">
            {caloriePercent}% of daily goal
          </p>
        </div>

        {/* Quick macros */}
        <div className="grid grid-cols-3 gap-2">
          {macroConfig.slice(0, 3).map((m) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.key}
                className={`p-2 rounded-xl ${m.bg} border ${m.border} text-center`}
              >
                <IconComp size={14} className={`${m.color} mx-auto mb-1`} />
                <p className={`text-sm font-bold ${m.color}`}>
                  {nutritionTargets[m.key]}
                  <span className="text-[9px] font-normal ml-0.5">{m.unit}</span>
                </p>
                <p className="text-[9px] text-slate-500">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full version (Profile page)
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Flame size={14} className="text-orange-400" />
        Nutrition Targets
      </h2>

      {/* Calorie goal — prominent */}
      <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-4 border border-orange-500/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-orange-400 uppercase tracking-wider font-medium">
            Daily Calories
          </p>
          <p className="text-2xl font-bold text-orange-400">
            {calorieGoal}
            <span className="text-xs font-normal ml-1">kcal</span>
          </p>
        </div>
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              caloriePercent >= 90
                ? "bg-gradient-to-r from-neon-green to-emerald-400"
                : "bg-gradient-to-r from-orange-500 to-amber-400"
            }`}
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5">
          {caloriesConsumed} consumed today ({caloriePercent}%)
        </p>
      </div>

      {/* Macro grid */}
      <div className="grid grid-cols-3 gap-2">
        {macroConfig.map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.key}
              className={`p-3 rounded-xl ${m.bg} border ${m.border} text-center transition-all hover:scale-[1.02]`}
            >
              <IconComp size={16} className={`${m.color} mx-auto mb-1.5`} />
              <p className={`text-lg font-bold ${m.color} leading-none`}>
                {nutritionTargets[m.key]}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {m.unit} · {m.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
