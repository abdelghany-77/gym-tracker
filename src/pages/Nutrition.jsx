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
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Apple size={20} className="text-neon-emerald" />
          Nutrition
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
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
          <h2 className="text-xs font-semibold text-white flex items-center gap-2">
            <Utensils size={14} className="text-accent" />
            Meal Tracker
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-[10px] text-accent hover:text-accent-light font-medium transition-colors flex items-center gap-0.5"
            aria-label="View full meal plan"
          >
            Full Plan <ChevronRight size={10} />
          </button>
        </div>

        {/* Per-meal quick track */}
        <div className="space-y-1">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">
            Tap meals you&apos;ve eaten
          </p>
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all active:scale-[0.98] btn-press ${
                  isEaten
                    ? "bg-neon-emerald/8 border-neon-emerald/20"
                    : "bg-bg-card border-border-slate hover:border-slate-600"
                }`}
                aria-label={`${isEaten ? "Unmark" : "Mark"} ${meal.name} as eaten — ${meal.calories} calories`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isEaten
                      ? "bg-neon-emerald text-white animate-set-complete"
                      : "bg-slate-800 border-2 border-slate-600 text-transparent"
                  }`}
                >
                  <Check size={10} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-[11px] font-medium block truncate ${
                    isEaten ? "text-neon-emerald" : "text-white"
                  }`}>
                    {meal.name}
                  </span>
                  <span className="text-[9px] text-slate-500">{meal.time}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-medium block ${
                    isEaten ? "text-neon-emerald/70" : "text-orange-400"
                  }`}>
                    {meal.calories} kcal
                  </span>
                  <span className={`text-[9px] ${isEaten ? "text-neon-emerald/50" : "text-accent/70"}`}>
                    {meal.protein}g protein
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {mealPlanFollowed && (
          <div className="py-2 px-3 rounded-lg bg-neon-emerald/8 border border-neon-emerald/15 text-center animate-set-complete">
            <p className="text-[10px] font-semibold text-neon-emerald">
              All meals completed! Great job!
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
