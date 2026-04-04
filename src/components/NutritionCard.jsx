import { Flame, Beef, Wheat, Droplets, Leaf, Pill } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const macroConfig = [
  { key: "protein", label: "Protein", unit: "g", icon: Beef, color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/20", barColor: "bg-neon-blue", hex: "#3b82f6" },
  { key: "carbs", label: "Carbs", unit: "g", icon: Wheat, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", barColor: "bg-amber-400", hex: "#fbbf24" },
  { key: "fat", label: "Fat", unit: "g", icon: Droplets, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", barColor: "bg-rose-400", hex: "#fb7185" },
  { key: "fiber", label: "Fiber", unit: "g", icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", barColor: "bg-emerald-400", hex: "#34d399" },
  { key: "calcium", label: "Calcium", unit: "mg", icon: Pill, color: "text-slate-300", bg: "bg-slate-700/50", border: "border-slate-600", barColor: "bg-slate-400", hex: "#cbd5e1" },
];

export default function NutritionCard({ compact = false }) {
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const calorieGoal = nutritionTargets.calories;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100));

  if (compact) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            Daily Nutrition
          </h3>
          <span className="text-[11px] text-slate-500">
            {caloriesConsumed} / {calorieGoal} kcal
          </span>
        </div>

        {/* Calorie progress bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90
                  ? "bg-gradient-to-r from-neon-green to-emerald-400"
                  : "bg-gradient-to-r from-orange-500 to-amber-400"
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right">
            {caloriePercent}% of daily goal
          </p>
        </div>

        {/* Quick macros */}
        <div className="grid grid-cols-3 gap-2">
          {macroConfig.slice(0, 3).map((m) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.key}
                className={`p-2 rounded-xl ${m.bg} border ${m.border} text-center`}
              >
                <IconComp size={14} className={`${m.color} mx-auto mb-1`} />
                <p className={`text-sm font-bold ${m.color}`}>
                  {nutritionTargets[m.key]}
                  <span className="text-[9px] font-normal ml-0.5">{m.unit}</span>
                </p>
                <p className="text-[9px] text-slate-500">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Derived data for the PieChart
  const chartData = [
    { name: "Protein", value: nutritionTargets.protein || 0, color: macroConfig[0].hex },
    { name: "Carbs", value: nutritionTargets.carbs || 0, color: macroConfig[1].hex },
    { name: "Fat", value: nutritionTargets.fat || 0, color: macroConfig[2].hex }
  ];

  // Full version (Nutrition / Profile page)
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-5">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Flame size={14} className="text-orange-400" />
        Nutrition Targets
      </h2>

      {/* Calorie goal — prominent */}
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-xl p-4 border border-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <p className="text-[11px] text-orange-400/80 uppercase tracking-wider font-medium">
            Daily Calories
          </p>
          <p className="text-2xl font-bold text-orange-400 drop-shadow-md">
            {calorieGoal}
            <span className="text-xs font-normal ml-1">kcal</span>
          </p>
        </div>
        <div className="w-full h-2.5 bg-slate-950/50 rounded-full overflow-hidden border border-slate-800/50 relative z-10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              caloriePercent >= 90
                ? "bg-gradient-to-r from-neon-green to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
            }`}
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium relative z-10">
          {caloriesConsumed} consumed today ({caloriePercent}%)
        </p>
      </div>

      {/* Macros Distribution Chart & List */}
      <div className="bg-slate-950/30 rounded-xl border border-slate-800/60 p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Macros Distribution</h3>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-300 text-sm">
              %
            </div>
          </div>

          <div className="flex-1 space-y-3">
             {chartData.map((macro, idx) => {
               const config = macroConfig[idx];
               const IconComp = config.icon;
               return (
                 <div key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center`}>
                       <IconComp size={10} className={config.color} />
                     </div>
                     <span className="text-xs text-slate-300 font-medium">{macro.name}</span>
                   </div>
                   <span className={`text-sm font-bold ${config.color}`}>
                     {macro.value} <span className="text-[10px] text-slate-500">{config.unit}</span>
                   </span>
                 </div>
               )
             })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
         {macroConfig.slice(3).map((m) => {
           const IconComp = m.icon;
           return (
             <div key={m.key} className={`p-3 rounded-xl ${m.bg} border ${m.border} text-center flex items-center justify-between`}>
               <div className="flex items-center gap-2">
                 <IconComp size={14} className={m.color} />
                 <p className="text-[10px] text-slate-400">{m.label}</p>
               </div>
               <p className={`text-sm font-bold ${m.color}`}>
                 {nutritionTargets[m.key]} <span className="text-[8px] font-normal">{m.unit}</span>
               </p>
             </div>
           );
         })}
      </div>
    </div>
  );
}
