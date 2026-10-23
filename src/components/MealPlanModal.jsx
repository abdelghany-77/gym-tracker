import { useMemo } from "react";
import { X, Utensils, Clock, Check } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

export default function MealPlanModal({ isOpen, onClose }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const meals = useMemo(() => useWorkoutStore.getState().getMealPlan(), [nutritionTargets?.calories]);

  if (!isOpen) return null;

  const mealsEaten = dailyChecklist?.mealsEaten || [];
  const totalCals = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const eatenCals = mealsEaten.reduce((acc, idx) => acc + (meals[idx]?.calories || 0), 0);
  const eatenProtein = mealsEaten.reduce((acc, idx) => acc + (meals[idx]?.protein || 0), 0);
  const progressPercent = Math.min(100, Math.round((eatenCals / totalCals) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-surface-elevated rounded-2xl border border-border w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Utensils size={15} className="text-teal-400" />
              Custom Meal Plan
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Target: {totalCals.toLocaleString()} kcal · {totalProtein}g protein
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-hover text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="px-4 py-3 bg-surface/60 border-b border-border shrink-0 space-y-2.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-white">{eatenCals}<span className="text-[10px] font-normal text-slate-400 ml-0.5">/{totalCals}</span></p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Calories</p>
            </div>
            <div>
              <p className="text-base font-bold text-teal-400">{eatenProtein}g<span className="text-[10px] font-normal text-slate-400 ml-0.5">/{totalProtein}g</span></p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Protein</p>
            </div>
            <div>
              <p className="text-base font-bold text-emerald-400">{mealsEaten.length}<span className="text-[10px] font-normal text-slate-400 ml-0.5">/{meals.length}</span></p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Logged</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border">
            <div
              className="h-full rounded-full transition-all duration-500 bg-teal-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meal list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full text-left rounded-xl p-3 border transition-all active:scale-[0.99] ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-surface border-border hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isEaten
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-surface-elevated border border-border text-transparent"
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={9} />
                          {meal.time}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold truncate ${isEaten ? "text-emerald-400" : "text-white"}`}>
                        {meal.name}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white block">
                      {meal.calories} kcal
                    </span>
                    <span className="text-[10px] text-teal-400 font-medium">
                      {meal.protein}g protein
                    </span>
                  </div>
                </div>

                {/* Items in meal */}
                {meal.items && meal.items.length > 0 && (
                  <p className="text-[10px] text-slate-400 pl-8 truncate">
                    {meal.items.join(" · ")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
