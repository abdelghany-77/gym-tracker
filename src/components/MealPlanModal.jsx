import { useMemo } from "react";
import { X, Utensils, Clock, Flame, Check } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md max-h-[85vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Utensils size={16} className="text-orange-400" />
              Your Meal Plan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalCals.toLocaleString()} kcal · Based on your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Progress summary */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 shrink-0 space-y-2">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-400">{eatenCals}<span className="text-[9px] font-normal text-slate-500 ml-0.5">/{totalCals}</span></p>
              <p className="text-[9px] text-slate-500 uppercase">Calories</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <p className="text-lg font-bold text-neon-blue">{eatenProtein}g<span className="text-[9px] font-normal text-slate-500 ml-0.5">/{totalProtein}g</span></p>
              <p className="text-[9px] text-slate-500 uppercase">Protein</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{mealsEaten.length}<span className="text-[9px] font-normal text-slate-500 ml-0.5">/{meals.length}</span></p>
              <p className="text-[9px] text-slate-500 uppercase">Meals</p>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 90
                  ? "bg-gradient-to-r from-emerald-500 to-neon-green"
                  : "bg-gradient-to-r from-orange-500 to-amber-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-center">{progressPercent}% of daily goal completed</p>
        </div>

        {/* Meal list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-hide">
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full text-left rounded-xl p-3.5 border transition-all active:scale-[0.98] ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Checkmark circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isEaten
                        ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "bg-slate-800 border-2 border-slate-600 text-transparent"
                    }`}>
                      <Check size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Clock size={9} />
                          {meal.time}
                        </span>
                      </div>
                      <h4 className={`text-sm font-semibold leading-tight ${isEaten ? "text-emerald-400" : "text-white"}`}>
                        {meal.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isEaten ? "text-emerald-400" : "text-orange-400"}`}>
                      <Flame size={10} />
                      {meal.calories}
                    </span>
                    <span className={`text-[10px] font-medium ${isEaten ? "text-emerald-400/70" : "text-neon-blue"}`}>
                      {meal.protein}g P
                    </span>
                  </div>
                </div>
                
                {/* Food items */}
                <ul className="ml-11 space-y-0.5">
                  {meal.items.map((item, j) => (
                    <li
                      key={j}
                      className={`text-[11px] flex items-start gap-1.5 transition-colors ${
                        isEaten ? "text-emerald-500/60 line-through" : "text-slate-400"
                      }`}
                    >
                      <span className={`mt-1 ${isEaten ? "text-emerald-600" : "text-slate-600"}`}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          {mealsEaten.length === meals.length ? (
            <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center">
              <p className="text-sm font-semibold text-emerald-400">🎉 All meals completed!</p>
              <p className="text-[10px] text-emerald-500/60 mt-0.5">Great job following your meal plan today</p>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm active:scale-[0.98]"
            >
              Close · {meals.length - mealsEaten.length} meals remaining
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
