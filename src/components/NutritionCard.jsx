import { Flame, Beef, Wheat, Droplets, Leaf, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const macroConfig = [
  {
    key: "protein",
    label: "Protein",
    unit: "g",
    icon: Beef,
    color: "text-sky-400",
  },
  {
    key: "carbs",
    label: "Carbs",
    unit: "g",
    icon: Wheat,
    color: "text-amber-400",
  },
  {
    key: "fat",
    label: "Fat",
    unit: "g",
    icon: Droplets,
    color: "text-rose-400",
  },
  {
    key: "fiber",
    label: "Fiber",
    unit: "g",
    icon: Leaf,
    color: "text-emerald-400",
  },
  {
    key: "calcium",
    label: "Calcium",
    unit: "mg",
    icon: Pill,
    color: "text-slate-300",
  },
];

export default function NutritionCard({ compact = false }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const calorieGoal = nutritionTargets.calories || 0;
  const remaining = Math.max(0, calorieGoal - caloriesConsumed);
  const caloriePercent =
    calorieGoal > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100)),
        )
      : 0;

  if (compact) {
    return (
      <div className="bg-bg-surface rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Flame size={13} className="text-amber-400" />
            Daily Nutrition
          </h3>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            {caloriesConsumed} / {calorieGoal} kcal
          </span>
        </div>

        <div className="space-y-1">
          <div
            role="progressbar"
            aria-label="Daily calories"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={caloriePercent}
            aria-valuetext={`${caloriesConsumed} of ${calorieGoal} kcal`}
            className="w-full h-2 bg-bg-deep rounded-full overflow-hidden border border-slate-800"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90 ? "bg-emerald-400" : "bg-sky-400"
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right font-mono tabular-nums">
            {caloriePercent}% of daily goal
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {macroConfig.slice(0, 3).map((m) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.key}
                className="p-2 rounded-xl bg-bg-deep border border-slate-800 text-center"
              >
                <IconComp size={12} className={`${m.color} mx-auto mb-0.5`} />
                <p className="text-xs font-bold font-mono tabular-nums text-white">
                  {nutritionTargets[m.key]}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">
                    {m.unit}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-2xl p-4 border border-slate-800 space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Flame size={14} className="text-amber-400" />
          Nutrition Targets
        </h2>
        <span className="text-xs text-slate-400 font-mono tabular-nums">
          {caloriePercent}% of goal
        </span>
      </div>

      {/* Calorie progress block */}
      <div className="bg-bg-deep rounded-xl p-3.5 border border-slate-800 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">
              Daily Calories
            </p>
            <p className="text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
              {caloriesConsumed.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {calorieGoal.toLocaleString()} kcal
              </span>
            </p>
          </div>
          <span
            className={`text-xs font-mono tabular-nums font-semibold ${
              remaining === 0 ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            {remaining === 0
              ? "Target hit"
              : `${remaining.toLocaleString()} left`}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Daily calories"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={caloriePercent}
          aria-valuetext={`${caloriesConsumed} of ${calorieGoal} kcal`}
          className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              caloriePercent >= 90 ? "bg-emerald-400" : "bg-sky-400"
            }`}
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
      </div>

      {/* Primary Macros 3-Col */}
      <div className="grid grid-cols-3 gap-2">
        {macroConfig.slice(0, 3).map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.key}
              className="p-2.5 rounded-xl bg-bg-deep border border-slate-800 text-center"
            >
              <IconComp size={13} className={`${m.color} mx-auto mb-1`} />
              <p className="text-sm font-bold font-mono tabular-nums text-white">
                {nutritionTargets[m.key]}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                  {m.unit}
                </span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {m.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Micro targets (Fiber & Calcium) */}
      <div className="grid grid-cols-2 gap-2">
        {macroConfig.slice(3).map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.key}
              className="px-3 py-2.5 rounded-xl bg-bg-deep border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <IconComp size={13} className={m.color} />
                <span className="text-xs text-slate-400 font-medium">
                  {m.label}
                </span>
              </div>
              <span className="text-xs font-bold font-mono tabular-nums text-white">
                {nutritionTargets[m.key]}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                  {m.unit}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
