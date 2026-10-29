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
    <div className="px-4 pt-4 pb-20 max-w-lg mx-auto space-y-3.5 animate-fadeIn">
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Apple size={18} className="text-neon-green" />
            Nutrition & Fuel
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Macro overview card */}
      <NutritionCard />

      {/* Meal Tracker */}
      <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Utensils size={14} className="text-neon-blue" />
            Daily Meal Tracker
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-[11px] text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors flex items-center gap-0.5"
            aria-label="View full meal plan"
          >
            Full Plan <ChevronRight size={12} />
          </button>
        </div>

        {/* Per-meal quick track */}
        <div className="space-y-1.5">
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all active:scale-[0.98] btn-press ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                }`}
                aria-label={`${isEaten ? "Unmark" : "Mark"} ${meal.name} as eaten — ${meal.calories} calories`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isEaten
                      ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-set-complete"
                      : "bg-slate-800 border-2 border-slate-600 text-transparent"
                  }`}
                >
                  <Check size={11} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span
                    className={`text-xs font-semibold block truncate ${
                      isEaten ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {meal.name}
                  </span>
                  <span className="text-[9px] text-slate-400">{meal.time}</span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold block ${
                      isEaten ? "text-emerald-400" : "text-orange-400"
                    }`}
                  >
                    {meal.calories} kcal
                  </span>
                  <span
                    className={`text-[9px] font-medium ${
                      isEaten ? "text-emerald-400/60" : "text-neon-blue"
                    }`}
                  >
                    {meal.protein}g P
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {mealPlanFollowed && (
          <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-set-complete">
            <p className="text-[11px] font-semibold text-emerald-400">
              All meals logged for today!
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
