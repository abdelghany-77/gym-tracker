import { useMemo, useState } from "react";
import {
  Utensils,
  Check,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Plus,
  Coffee,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import NutritionCard from "../components/NutritionCard";
import MealPlanModal from "../components/MealPlanModal";

const defaultMeals = [
  { id: 1, name: "Breakfast", items: "Oats • Banana • Almonds", calories: 420, icon: "🥣" },
  { id: 2, name: "Lunch", items: "Chicken • Rice • Vegetables", calories: 650, icon: "🍗" },
  { id: 3, name: "Dinner", items: "Salmon • Quinoa • Broccoli", calories: 580, icon: "🐟" },
];

export default function Nutrition() {
  const navigate = useNavigate();
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  const mealsEaten = dailyChecklist?.mealsEaten || [];

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER (Matches Reference Panel 7) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Nutrition</h1>

        <button
          type="button"
          onClick={() => setShowMealPlan(true)}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Calendar view"
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* ═══ CALORIE RING & MACROS HERO CARD (Matches Reference Panel 7) ═══ */}
      <NutritionCard />

      {/* ═══ TODAY'S MEALS LIST (Matches Reference Panel 7) ═══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#F1F5F7]">Today's Meals</h2>
          <button
            type="button"
            onClick={() => setShowMealPlan(true)}
            className="text-xs font-semibold text-[#8E9FA5] hover:text-[#F1F5F7] transition-colors"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {defaultMeals.map((meal, index) => {
            const isEaten = mealsEaten.includes(index);
            return (
              <div
                key={meal.id}
                onClick={() => toggleMealEaten(index, meal.calories)}
                className={`rounded-2xl p-3.5 flex items-center justify-between border cursor-pointer transition-all active:scale-[0.99] shadow-sm ${
                  isEaten
                    ? "bg-[#C4E58A]/[0.08] border-[#C4E58A]/40"
                    : "bg-[#142332] border border-[#223348] hover:border-[#2B4660]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#192C3C] border border-[#223348] flex items-center justify-center text-xl shrink-0">
                    {meal.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#F1F5F7] truncate">{meal.name}</h3>
                    <p className="text-[11px] text-[#8E9FA5] truncate mt-0.5">{meal.items}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#73C8B4]">
                    {meal.calories} kcal
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isEaten
                        ? "bg-[#C4E58A] text-[#0D1723] font-bold"
                        : "bg-[#192C3C] border border-[#223348] text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ PRIMARY CTA: + Add Meal (Matches Reference Panel 7) ═══ */}
        <button
          type="button"
          onClick={() => setShowAddMealModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold text-xs sm:text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(196,229,138,0.25)]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Meal</span>
        </button>
      </div>

      {/* ── Add Meal Modal ── */}
      {showAddMealModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowAddMealModal(false)}
        >
          <div
            className="bg-[#142332] rounded-3xl w-full max-w-sm border border-[#223348] p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#223348] pb-3">
              <h3 className="font-bold text-sm text-[#F1F5F7]">Log a Meal</h3>
              <button
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="text-[#8E9FA5] hover:text-[#F1F5F7]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Meal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Snack, Protein Shake"
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7]"
                />
              </div>
              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Calories</label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7] font-mono"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMealModal(false)}
              className="w-full py-3 bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold rounded-xl text-xs transition-all active:scale-95"
            >
              Add to Diary
            </button>
          </div>
        </div>
      )}

      {/* Meal Plan Modal */}
      {showMealPlan && <MealPlanModal onClose={() => setShowMealPlan(false)} />}
    </div>
  );
}
