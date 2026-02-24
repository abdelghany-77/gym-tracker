import { useMemo, useState } from "react";
import {
  Utensils,
  Droplets,
  Pill,
  Flame,
  Check,
  ChevronRight,
  Apple,
  Target,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import MealPlanModal from "../components/MealPlanModal";
import NutritionCard from "../components/NutritionCard";

export default function Nutrition() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const waterGoal = useWorkoutStore((s) => s.getWaterGoal());
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const meals = useMemo(
    () => useWorkoutStore.getState().getMealPlan(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nutritionTargets?.calories],
  );
  const [showMealPlan, setShowMealPlan] = useState(false);

  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const mealPlanFollowed = dailyChecklist?.mealPlanFollowed || false;
  const mealsEaten = dailyChecklist?.mealsEaten || [];
  const calorieTarget = nutritionTargets.calories || 3500;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100));

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

      {/* Calorie ring + Daily Essentials */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Target size={16} className="text-orange-400" />
          Daily Progress
        </h2>

        {/* Calorie progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Calories consumed</span>
            <span className="text-neon-blue font-medium">
              {caloriesConsumed} / {calorieTarget} kcal
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90
                  ? "bg-gradient-to-r from-emerald-500 to-neon-green"
                  : "bg-gradient-to-r from-neon-blue to-neon-green"
              }`}
              style={{ width: `${caloriePercent}%` }}
              role="progressbar"
              aria-valuenow={caloriesConsumed}
              aria-valuemin={0}
              aria-valuemax={calorieTarget}
              aria-label={`${caloriesConsumed} of ${calorieTarget} calories consumed`}
            />
          </div>
        </div>

        {/* Vitamin */}
        <button
          onClick={() => toggleChecklistItem("vitamin")}
          aria-label={
            dailyChecklist.vitamin
              ? "Unmark multivitamins as taken"
              : "Mark multivitamins as taken"
          }
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] btn-press ${
            dailyChecklist.vitamin
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              dailyChecklist.vitamin
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            <Pill size={20} />
          </div>
          <div className="text-left">
            <span
              className={`text-sm font-semibold block ${
                dailyChecklist.vitamin ? "text-emerald-400" : "text-white"
              }`}
            >
              Multivitamins
            </span>
            <span className="text-[11px] text-slate-500">1 Tablet / Day</span>
          </div>
          {dailyChecklist.vitamin && (
            <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-set-complete">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </button>

        {/* Water Counter */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Droplets size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Water</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {(dailyChecklist.water * 0.25).toFixed(2)}L /{" "}
                {(waterGoal * 0.25).toFixed(2)}L Goal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={decrementWater}
              className="w-11 h-11 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-lg font-bold active:scale-90 transition-all btn-press"
              aria-label="Decrease water intake"
            >
              −
            </button>
            <span className="text-lg font-bold text-neon-blue w-6 text-center">
              {dailyChecklist.water}
            </span>
            <button
              onClick={incrementWater}
              className="w-11 h-11 rounded-lg bg-neon-blue/20 hover:bg-neon-blue/30 flex items-center justify-center text-neon-blue text-lg font-bold active:scale-90 transition-all btn-press"
              aria-label="Increase water intake"
            >
              +
            </button>
          </div>
          {/* Progress Bar */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-blue-500/50 transition-all duration-500"
            style={{
              width: `${Math.min(100, (dailyChecklist.water / waterGoal) * 100)}%`,
            }}
          />
        </div>
      </div>

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
