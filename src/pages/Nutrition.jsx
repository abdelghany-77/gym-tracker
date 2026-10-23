import { useMemo, useState } from "react";
import {
  Utensils,
  Check,
  ChevronRight,
  Apple,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import MealPlanModal from "../components/MealPlanModal";
import NutritionCard from "../components/NutritionCard";

export default function Nutrition() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const meals = useMemo(
    () => useWorkoutStore.getState().getMealPlan(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nutritionTargets?.calories],
  );
  const [showMealPlan, setShowMealPlan] = useState(false);

  const mealPlanFollowed = dailyChecklist?.mealPlanFollowed || false;
  const mealsEaten = dailyChecklist?.mealsEaten || [];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Apple size={20} className="text-teal-400" />
          Nutrition & Fuel
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Macro overview card */}
      <NutritionCard />

      {/* Meal Tracker */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Utensils size={14} className="text-teal-400" />
            Daily Meal Tracker
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-0.5"
            aria-label="View full meal plan"
          >
            Full Plan <ChevronRight size={12} />
          </button>
        </div>

        {/* Per-meal quick track */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Tap meals you&apos;ve logged today
          </p>
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.99] btn-press ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-surface hover:bg-surface-hover border-border"
                }`}
                aria-label={`${isEaten ? "Unmark" : "Mark"} ${meal.name} as eaten — ${meal.calories} calories`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isEaten
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-surface-elevated border border-border text-transparent"
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-xs font-semibold block truncate ${
                    isEaten ? "text-emerald-400" : "text-white"
                  }`}>
                    {meal.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{meal.time}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-white block">
                    {meal.calories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                  </span>
                  <span className="text-[10px] text-teal-400 font-medium">
                    {meal.protein}g protein
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {mealPlanFollowed && (
          <div className="py-2.5 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-fadeIn">
            <p className="text-xs font-bold text-emerald-400">
              All daily meals recorded! Great consistency!
            </p>
          </div>
        )}
      </div>

      {/* Meal Plan Modal */}
      <MealPlanModal
        isOpen={showMealPlan}
        onClose={() => setShowMealPlan(false)}
      />
    </div>
  );
}
