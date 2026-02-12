import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  Droplets,
  Pill,
  Zap,
  ChevronRight,
  ChevronLeft,
  Flame,
  Edit2,
  X,
  Coffee,
  Moon,
  Target,
  Utensils,
  Check
} from "lucide-react";
import ActivityChart from "../components/ActivityChart";

import MealPlanModal from "../components/MealPlanModal";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";

export default function Dashboard() {
  const navigate = useNavigate();
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [activityDate, setActivityDate] = useState(new Date());
  const history = useWorkoutStore((s) => s.history);
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule);
  const heatmapData = useMemo(() => useWorkoutStore.getState().getHeatmapData(), [history]);
  const nextWorkout = useMemo(() => useWorkoutStore.getState().getNextWorkout(), [history, weeklySchedule]);
  const lastSession = useWorkoutStore((s) => s.getLastSession());
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const waterGoal = useWorkoutStore((s) => s.getWaterGoal());
  const toggleMealEaten = useWorkoutStore((s) => s.toggleMealEaten);
  const nutritionTargets = useWorkoutStore((s) => s.nutritionTargets);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const meals = useMemo(() => useWorkoutStore.getState().getMealPlan(), [nutritionTargets?.calories]);
  const [showMealPlan, setShowMealPlan] = useState(false);

  // Derived values from dailyChecklist
  const caloriesConsumed = dailyChecklist?.caloriesConsumed || 0;
  const mealPlanFollowed = dailyChecklist?.mealPlanFollowed || false;
  const mealsEaten = dailyChecklist?.mealsEaten || [];

  const stats = useMemo(() => {
    const totalSessions = history.length;
    const thisWeek = history.filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart;
    }).length;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (heatmapData[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { totalSessions, thisWeek, streak };
  }, [history, heatmapData]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={getImageUrl("icon.png")} alt="GymTracker Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Gym<span className="text-neon-blue">Tracker</span>
            </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-1.5 border border-slate-800 shadow-sm">
          <Flame size={14} className="text-orange-500 fill-orange-500/20" />
          <span className="text-sm font-bold text-white">
            {stats.streak}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">STREAK</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "This Week",
            value: stats.thisWeek,
            icon: Calendar,
            color: "text-neon-blue",
            bg: "bg-neon-blue/10",
            border: "border-neon-blue/20",
            glow: "shadow-neon-blue/5"
          },
          {
            label: "Total Workouts",
            value: stats.totalSessions,
            icon: TrendingUp,
            color: "text-neon-green",
            bg: "bg-neon-green/10",
            border: "border-neon-green/20",
            glow: "shadow-neon-green/5"
          },
          {
            label: "Active Streak",
            value: `${stats.streak}d`,
            icon: Flame,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            glow: "shadow-orange-500/5"
          },
        ].map(({ label, value, icon, color, bg, border, glow }) => {
          const Icon = icon;
          return (
            <div
              key={label}
              className={`relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 border border-slate-800 hover:border-slate-700 transition-all group overflow-hidden shadow-lg ${glow}`}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className={`w-8 h-8 rounded-lg ${bg} ${border} border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform relative z-10`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-lg font-bold text-white relative z-10">{value}</p>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider relative z-10">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty State CTA — when no workouts yet */}
      {stats.totalSessions === 0 && (
        <div className="relative bg-gradient-to-br from-neon-blue/5 via-slate-900/80 to-neon-purple/5 rounded-2xl p-6 border border-neon-blue/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
          <div className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Target size={28} className="text-neon-blue" />
            </div>
            <h3 className="text-base font-bold text-white">Ready to Start?</h3>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Your fitness journey begins here. Start your first workout and watch your progress grow!
            </p>
            <button
              onClick={() => navigate("/workout")}
              className="bg-neon-blue text-slate-950 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20 inline-flex items-center gap-2"
              aria-label="Start your first workout"
            >
              Start First Workout <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Next Workout Card */}
      {nextWorkout && (
        <div className={`w-full rounded-2xl p-5 border transition-all text-left relative overflow-hidden ${
           nextWorkout.isRest 
             ? "bg-slate-900/80 border-slate-800" 
             : "bg-linear-to-br from-slate-900 via-slate-900 to-neon-blue/5 border-slate-800 hover:border-neon-blue/30"
        }`}>
           {/* Background Glow */}
           {!nextWorkout.isRest && <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />}

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                 nextWorkout.isRest ? "bg-slate-800 text-slate-400" : "bg-neon-blue text-slate-950"
              }`}>
                {nextWorkout.isRest ? <Coffee size={24} /> : <Dumbbell size={24} />}
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mb-0.5">
                  {nextWorkout.daysUntil === 0 ? (
                    <>
                      <Calendar size={12} className={nextWorkout.isRest ? "text-slate-400" : "text-neon-blue"} />
                      <span className={nextWorkout.isRest ? "text-slate-200" : "text-neon-blue"}>Today</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={12} className="text-slate-500" />
                      <span>In {nextWorkout.daysUntil} day{nextWorkout.daysUntil > 1 ? "s" : ""}</span>
                    </>
                  )}
                </p>
                <p className="text-lg font-bold text-white">
                  {nextWorkout.isRest ? "Rest Day" : nextWorkout.program?.name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {nextWorkout.isRest ? "Recover & Rehydrate" : nextWorkout.program?.muscles.join(" · ")}
                </p>
              </div>
            </div>
            
            {nextWorkout.daysUntil === 0 ? (
               <div className="flex items-center gap-2">
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSchedule(true);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-400 hover:text-white border border-slate-700/50 focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
                  aria-label="Edit today's schedule"
                 >
                   <Edit2 size={16} />
                 </button>
                 {!nextWorkout.isRest && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        useWorkoutStore.getState().startWorkout(nextWorkout.program.id);
                        navigate("/workout/active");
                      }}
                      className="bg-neon-blue text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
                      aria-label={`Start ${nextWorkout.program?.name} workout`}
                    >
                      Start <ChevronRight size={14} strokeWidth={3} />
                    </button>
                 )}
               </div>
            ) : (
              <button 
                onClick={() => navigate("/workout")}
                className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
                aria-label="View workouts"
                >
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setEditingSchedule(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-700 overflow-hidden shadow-2xl scale-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Change Today's Goal</h3>
              <button onClick={() => setEditingSchedule(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none" aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {/* Rest Day Option */}
               <button
                  onClick={() => {
                     const dayIndex = nextWorkout.dayIndex;
                     if (dayIndex !== undefined) {
                        useWorkoutStore.getState().setSchedule(dayIndex, "rest");
                        setEditingSchedule(false);
                     }
                  }}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all border ${
                     nextWorkout.isRest
                       ? "bg-slate-800 border-slate-700"
                       : "border-transparent hover:bg-slate-800/50"
                  }`}
               >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                     nextWorkout.isRest ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-500"
                  }`}>
                     <Moon size={18} />
                  </div>
                  <div className="text-left">
                     <p className={`text-sm font-semibold ${nextWorkout.isRest ? "text-white" : "text-slate-300"}`}>Rest Day</p>
                     <p className="text-[11px] text-slate-500">Recover & Sleep</p>
                  </div>
                  {nextWorkout.isRest && <div className="ml-auto text-xs font-bold text-slate-500/20">ACTIVE</div>}
               </button>

               <div className="h-px bg-slate-800/50 my-2 mx-4" />

               {Object.values(useWorkoutStore.getState().getPrograms()).map(program => {
                 const isCurrent = !nextWorkout.isRest && nextWorkout.program?.id === program.id;
                 return (
                 <button
                   key={program.id}
                   onClick={() => {
                     const dayIndex = nextWorkout.dayIndex;
                     if (dayIndex !== undefined) {
                        useWorkoutStore.getState().setSchedule(dayIndex, program.id);
                        setEditingSchedule(false);
                     }
                   }}
                   className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all border ${
                     isCurrent
                       ? "bg-neon-blue/5 border-neon-blue/20" 
                       : "border-transparent hover:bg-slate-800/50"
                   }`}
                 >
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCurrent ? "bg-neon-blue text-slate-950" : "bg-slate-800 text-slate-500"
                   }`}>
                      <Dumbbell size={18} />
                   </div>
                   <div className="text-left">
                     <p className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-slate-300"}`}>{program.name}</p>
                     <p className="text-[11px] text-slate-500">{program.muscles.join(", ")}</p>
                   </div>
                   {isCurrent && <div className="ml-auto text-xs font-bold text-neon-blue">ACTIVE</div>}
                 </button>
               )})}
            </div>
          </div>
        </div>
      )}

      {/* Activity Chart */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-sm font-bold text-white flex items-center gap-2">
             <TrendingUp size={16} className="text-neon-purple" />
             Activity
           </h2>
           
           {/* Month Navigator */}
           <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-800 p-1">
             <button
               onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() - 1, 1))}
               className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
               aria-label="Previous month"
             >
               <ChevronLeft size={14} />
             </button>
             <span className="text-[11px] font-semibold text-white min-w-[80px] text-center select-none">
               {activityDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
             </span>
             <button
               onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() + 1, 1))}
               className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
               aria-label="Next month"
             >
               <ChevronRight size={14} />
             </button>
           </div>
        </div>
        <ActivityChart data={heatmapData} currentDate={activityDate} />
      </div>

      {/* Last Session — either show data or motivational empty state */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800">
        {lastSession ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                Last Session
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                 {new Date(lastSession.date).toLocaleDateString("en-US", {
                   weekday: "short",
                   month: "short",
                   day: "numeric",
                 })}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-4 border border-slate-800/50">
              <div>
                <p className="text-sm font-semibold text-white">
                  {lastSession.programName}
                </p>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Dumbbell size={12} /> {lastSession.exercises.length} Exercises
                   </span>
                   <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <TrendingUp size={12} /> {lastSession.exercises.reduce((acc, e) => acc + e.sets.length, 0)} Sets
                   </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center">
              <Calendar size={22} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 font-medium">No sessions yet</p>
            <p className="text-[11px] text-slate-600">Complete a workout to see your history here</p>
          </div>
        )}
      </div>

      {/* Daily Checklist */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          Daily Essentials
        </h2>

        {/* Vitamin */}
        <button
          onClick={() => toggleChecklistItem("vitamin")}
          aria-label={dailyChecklist.vitamin ? "Unmark multivitamins as taken" : "Mark multivitamins as taken"}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none ${
            dailyChecklist.vitamin
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
             dailyChecklist.vitamin ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
          }`}>
             <Pill size={20} />
          </div>
          <div className="text-left">
             <span className={`text-sm font-semibold block ${dailyChecklist.vitamin ? "text-emerald-400" : "text-white"}`}>
               Multivitamins
             </span>
             <span className="text-[11px] text-slate-500">1 Tablet / Day</span>
          </div>
          {dailyChecklist.vitamin && (
            <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
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
                {(dailyChecklist.water * 0.25).toFixed(2)}L / {(waterGoal * 0.25).toFixed(2)}L Goal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={decrementWater}
              className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white active:scale-90 transition-all focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
              aria-label="Decrease water intake"
            >
              −
            </button>
            <span className="text-lg font-bold text-neon-blue w-6 text-center">
              {dailyChecklist.water}
            </span>
            <button
              onClick={incrementWater}
              className="w-10 h-10 rounded-lg bg-neon-blue/20 hover:bg-neon-blue/30 flex items-center justify-center text-neon-blue active:scale-90 transition-all focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
              aria-label="Increase water intake"
            >
              +
            </button>
          </div>
          
          {/* Progress Bar Background */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-blue-500/50 transition-all duration-500"
            style={{ width: `${Math.min(100, (dailyChecklist.water / waterGoal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Daily Nutrition Checklist */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Utensils size={16} className="text-neon-blue" />
            Daily Nutrition
          </h2>
          <button
            onClick={() => setShowMealPlan(true)}
            className="text-[11px] text-neon-blue hover:text-neon-blue/80 font-medium transition-colors"
          >
            Full Meal Plan →
          </button>
        </div>

        {/* Calorie Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Calories consumed</span>
            <span className="text-neon-blue font-medium">
              {caloriesConsumed} / {nutritionTargets.calories || 3500} kcal
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriesConsumed >= (nutritionTargets.calories || 3500) * 0.9
                  ? "bg-gradient-to-r from-emerald-500 to-neon-green"
                  : "bg-gradient-to-r from-neon-blue to-neon-green"
              }`}
              style={{ width: `${Math.min(100, (caloriesConsumed / (nutritionTargets.calories || 3500)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Per-meal quick track */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
            Tap meals you've eaten
          </p>
          {meals.map((meal, i) => {
            const isEaten = mealsEaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleMealEaten(i, meal.calories)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                  isEaten
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                }`}
              >
                {/* Checkmark */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isEaten
                    ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-slate-800 border-2 border-slate-600 text-transparent"
                }`}>
                  <Check size={12} />
                </div>
                {/* Meal info */}
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-[11px] font-semibold block truncate ${isEaten ? "text-emerald-400" : "text-white"}`}>
                    {meal.name}
                  </span>
                  <span className="text-[9px] text-slate-500">{meal.time}</span>
                </div>
                {/* Cals */}
                <span className={`text-[10px] font-medium shrink-0 ${isEaten ? "text-emerald-400/70" : "text-orange-400"}`}>
                  {meal.calories} kcal
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress summary */}
        {mealPlanFollowed && (
          <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[11px] font-semibold text-emerald-400">🎉 All meals completed!</p>
          </div>
        )}
      </div>

      {/* Meal Plan Modal */}
      <MealPlanModal isOpen={showMealPlan} onClose={() => setShowMealPlan(false)} />
    </div>
  );
}
