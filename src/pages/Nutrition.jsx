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
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Apple size={22} className="text-neon-green" />
          Nutrition
        </h1>
        <p className="text-sm text-slate-500 mt-1">
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
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Utensils size={16} className="text-neon-blue" />
            Meal Tracker
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-[11px] text-neon-blue hover:text-neon-blue/80 font-medium transition-colors flex items-center gap-0.5"
            aria-label="View full meal plan"
          >
            Full Plan <ChevronRight size={12} />
          </button>
        </div>

        {/* Per-meal quick track */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
            Tap meals you&apos;ve eaten
          </p>
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] btn-press ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                }`}
                aria-label={`${isEaten ? "Unmark" : "Mark"} ${meal.name} as eaten — ${meal.calories} calories`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isEaten
                      ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-set-complete"
                      : "bg-slate-800 border-2 border-slate-600 text-transparent"
                  }`}
                >
                  <Check size={12} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span
                    className={`text-[11px] font-semibold block truncate ${
                      isEaten ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {meal.name}
                  </span>
                  <span className="text-[9px] text-slate-500">{meal.time}</span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-medium block ${
                      isEaten ? "text-emerald-400/70" : "text-orange-400"
                    }`}
                  >
                    {meal.calories} kcal
                  </span>
                  <span
                    className={`text-[9px] ${
                      isEaten ? "text-emerald-400/50" : "text-neon-blue/70"
                    }`}
                  >
                    {meal.protein}g protein
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {mealPlanFollowed && (
          <div className="py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-set-complete">
            <p className="text-[11px] font-semibold text-emerald-400">
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
