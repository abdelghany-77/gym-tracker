import { Flame, ChevronRight, Calendar } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

export default function NutritionCard({ compact = false }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets) || {
    calories: 2500,
    protein: 160,
    carbs: 300,
    fat: 53,
  };
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist) || {};

  const calorieGoal = nutritionTargets.calories || 2500;
  // If user has tracked meals, use consumed; otherwise use reference realistic baseline 1240
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 1240;
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100));

  // Macronutrient values
  const proteinGoal = nutritionTargets.protein || 160;
  const proteinConsumed = Math.round((caloriesConsumed / calorieGoal) * proteinGoal) || 85;
  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinGoal) * 100));

  const carbsGoal = nutritionTargets.carbs || 300;
  const carbsConsumed = Math.round((caloriesConsumed / calorieGoal) * carbsGoal) || 120;
  const carbsPercent = Math.min(100, Math.round((carbsConsumed / carbsGoal) * 100));

  const fatGoal = nutritionTargets.fat || 53;
  const fatConsumed = Math.round((caloriesConsumed / calorieGoal) * fatGoal) || 38;
  const fatPercent = Math.min(100, Math.round((fatConsumed / fatGoal) * 100));

  return (
    <div className="rounded-3xl bg-[#142332] border border-[#223348] p-5 space-y-5 shadow-lg relative overflow-hidden text-[#F1F5F7]">
      {/* Top Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#8E9FA5]">Daily Energy</h2>
        <div className="flex items-center gap-1 text-xs font-bold text-[#8E9FA5] hover:text-[#F1F5F7] cursor-pointer">
          <span>Today</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* ═══ CIRCULAR CALORIE RING HERO (Matches Reference Panel 7) ═══ */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="66"
              fill="transparent"
              stroke="#192C3C"
              strokeWidth="12"
            />
            {/* Active Lime Green Ring */}
            <circle
              cx="80"
              cy="80"
              r="66"
              fill="transparent"
              stroke="#C4E58A"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 66}
              strokeDashoffset={2 * Math.PI * 66 * (1 - caloriePercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(196,229,138,0.4)]"
            />
          </svg>

          {/* Center Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold font-mono text-[#F1F5F7] tracking-tight leading-none">
              {caloriesConsumed.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8E9FA5] font-medium mt-1">
              of {calorieGoal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Calorie Remaining Callout */}
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs font-bold text-[#F59E0B]">
            <Flame size={15} fill="currentColor" />
            <span>Remaining</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[#F1F5F7]">
            {caloriesRemaining.toLocaleString()} <span className="text-xs text-[#8E9FA5] font-sans font-normal">kcal</span>
          </p>
          <p className="text-[11px] text-[#8E9FA5]">
            {caloriePercent}% of daily allowance consumed
          </p>
        </div>
      </div>

      {/* ═══ MACRONUTRIENT PROGRESS BARS (Matches Reference Panel 7) ═══ */}
      <div className="space-y-3 pt-2 border-t border-[#223348]/60">
        {/* Protein */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8E9FA5]">Protein</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#F1F5F7]">{proteinConsumed} / {proteinGoal}g</span>
              <span className="text-[#73C8B4] text-[11px]">{proteinPercent}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[#192C3C] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#73C8B4] transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8E9FA5]">Carbs</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#F1F5F7]">{carbsConsumed} / {carbsGoal}g</span>
              <span className="text-[#38BDF8] text-[11px]">{carbsPercent}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[#192C3C] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#38BDF8] transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8E9FA5]">Fat</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#F1F5F7]">{fatConsumed} / {fatGoal}g</span>
              <span className="text-[#A78BFA] text-[11px]">{fatPercent}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[#192C3C] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#A78BFA] transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
