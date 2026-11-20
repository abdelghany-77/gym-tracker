import { useMemo, useState } from "react";
import {
  Utensils,
  Check,
  ChevronRight,
  Apple,
  Plus,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { calculateMacros } from "../store/nutritionSlice";
import MealPlanModal from "../components/MealPlanModal";
import NutritionCard from "../components/NutritionCard";
import ReminderWidget from "../components/ReminderWidget";

export default function Nutrition() {
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  const addQuickFood = useWorkoutStore((s) => s.addQuickFood);
  const removeQuickFood = useWorkoutStore((s) => s.removeQuickFood);
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const updateNutritionTargets = useWorkoutStore(
    (s) => s.updateNutritionTargets,
  );
  const userProfile = useWorkoutStore((s) => s.userProfile);

  const meals = useMemo(
    () => useWorkoutStore.getState().getMealPlan(nutritionTargets),
    [nutritionTargets],
  );

  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showEditTargets, setShowEditTargets] = useState(false);
  const [targetForm, setTargetForm] = useState(() => ({
    calories: nutritionTargets.calories,
    protein: nutritionTargets.protein,
    carbs: nutritionTargets.carbs,
    fat: nutritionTargets.fat,
  }));

  const [quickName, setQuickName] = useState("");
  const [quickCalories, setQuickCalories] = useState("");
  const [quickProtein, setQuickProtein] = useState("");

  const mealPlanFollowed = dailyChecklist?.mealPlanFollowed || false;
  const mealsEaten = dailyChecklist?.mealsEaten || [];
  const quickFoods = dailyChecklist?.quickFoods || [];

  const openEditTargets = () => {
    setTargetForm({
      calories: nutritionTargets.calories,
      protein: nutritionTargets.protein,
      carbs: nutritionTargets.carbs,
      fat: nutritionTargets.fat,
    });
    setShowEditTargets((prev) => !prev);
  };

  const handleSaveTargets = (e) => {
    e.preventDefault();
    updateNutritionTargets({
      calories: Number(targetForm.calories),
      protein: Number(targetForm.protein),
      carbs: Number(targetForm.carbs),
      fat: Number(targetForm.fat),
    });
    setShowEditTargets(false);
  };

  const handleRecalculateFromProfile = () => {
    const suggested = calculateMacros(userProfile);
    updateNutritionTargets(suggested);
    setTargetForm({
      calories: suggested.calories,
      protein: suggested.protein,
      carbs: suggested.carbs,
      fat: suggested.fat,
    });
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const cal = Number(quickCalories);
    if (!Number.isFinite(cal) || cal <= 0) return;
    addQuickFood({
      name: quickName.trim() || "Quick Snack",
      calories: cal,
      protein: Number(quickProtein) || 0,
    });
    setQuickName("");
    setQuickCalories("");
    setQuickProtein("");
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-3xl mx-auto space-y-4 animate-fadeIn">
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Apple size={18} className="text-emerald-400" />
            Nutrition &amp; Fuel
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={openEditTargets}
          aria-expanded={showEditTargets}
          className="min-h-11 px-3.5 rounded-xl border border-slate-800 bg-bg-surface text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <SlidersHorizontal size={14} />
          Edit Targets
        </button>
      </div>

      {/* ── Collapsible Edit Daily Targets Panel ── */}
      {showEditTargets && (
        <form
          onSubmit={handleSaveTargets}
          className="rounded-2xl border border-slate-800 bg-bg-surface p-4 space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-white">
              Daily Nutrition Targets
            </h2>
            <button
              type="button"
              onClick={handleRecalculateFromProfile}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Recalculate from Profile
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { key: "calories", label: "Calories (kcal)", min: 500 },
              { key: "protein", label: "Protein (g)", min: 0 },
              { key: "carbs", label: "Carbs (g)", min: 0 },
              { key: "fat", label: "Fat (g)", min: 0 },
            ].map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`target-${field.key}`}
                  className="block text-[11px] text-slate-400 mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={`target-${field.key}`}
                  type="number"
                  inputMode="numeric"
                  min={field.min}
                  value={targetForm[field.key]}
                  onChange={(e) =>
                    setTargetForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-bg-deep px-3 text-sm font-mono tabular-nums text-white focus:border-slate-400 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditTargets(false)}
              className="min-h-10 px-3.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-10 px-4 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white transition-colors"
            >
              Save Targets
            </button>
          </div>
        </form>
      )}

      {/* ── Macro Overview + Hydration/Vitamins (2-Col on Desktop) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <NutritionCard />
        <ReminderWidget />
      </div>

      {/* ── Quick Add Food / Snack ── */}
      <div className="bg-bg-surface rounded-2xl p-4 border border-slate-800 space-y-3">
        <div>
          <h2 className="text-xs font-bold text-white">
            Quick Add Food or Snack
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Log an off-plan snack, shake, or meal directly into today&apos;s
            calories
          </p>
        </div>

        <form
          onSubmit={handleQuickAdd}
          className="grid grid-cols-1 sm:grid-cols-[1fr_110px_110px_auto] gap-2"
        >
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Food name (e.g. Whey shake)"
            aria-label="Food name"
            className="min-h-11 rounded-xl border border-slate-700 bg-bg-deep px-3 text-xs text-white placeholder-slate-500 focus:border-slate-400 focus:outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={quickCalories}
            onChange={(e) => setQuickCalories(e.target.value)}
            placeholder="Calories"
            aria-label="Food calories"
            required
            className="min-h-11 rounded-xl border border-slate-700 bg-bg-deep px-3 text-xs font-mono tabular-nums text-white placeholder-slate-500 focus:border-slate-400 focus:outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={quickProtein}
            onChange={(e) => setQuickProtein(e.target.value)}
            placeholder="Protein (g)"
            aria-label="Food protein grams"
            className="min-h-11 rounded-xl border border-slate-700 bg-bg-deep px-3 text-xs font-mono tabular-nums text-white placeholder-slate-500 focus:border-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-11 px-4 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            Add
          </button>
        </form>

        {quickFoods.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            {quickFoods.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-bg-deep border border-slate-800 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                    +{item.calories} kcal
                    {item.protein > 0 ? ` · ${item.protein}g protein` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuickFood(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="min-w-9 min-h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Daily Meal Tracker ── */}
      <div className="bg-bg-surface rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Utensils size={14} className="text-sky-400" />
            Daily Meal Tracker
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors flex items-center gap-0.5"
            aria-label="View full meal plan"
          >
            Full Plan <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-2">
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i)}
                aria-pressed={isEaten}
                className={`w-full min-h-12 flex items-center gap-3 p-3 rounded-xl border transition-colors active:scale-[0.99] ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/35"
                    : "bg-bg-deep border-slate-800 hover:border-slate-700"
                }`}
                aria-label={`${isEaten ? "Unmark" : "Mark"} ${meal.name} as eaten — ${meal.calories} calories`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isEaten
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-900 border-2 border-slate-600 text-transparent"
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span
                    className={`text-xs font-semibold block truncate ${
                      isEaten ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {meal.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {meal.time}
                  </span>
                </div>
                <div className="text-right shrink-0 font-mono tabular-nums">
                  <span
                    className={`text-xs font-bold block ${
                      isEaten ? "text-emerald-400" : "text-slate-100"
                    }`}
                  >
                    {meal.calories} kcal
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {meal.protein}g P
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {mealPlanFollowed && (
          <div className="py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center">
            <p className="text-xs font-semibold text-emerald-400">
              All planned meals logged for today!
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
