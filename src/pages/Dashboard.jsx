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
  Flame,
  Edit2,
  X
} from "lucide-react";
import Heatmap from "../components/Heatmap";
import useWorkoutStore from "../store/workoutStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [editingSchedule, setEditingSchedule] = useState(false);
  const history = useWorkoutStore((s) => s.history);
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule); // Subscribe to schedule changes allows re-render on edit
  const heatmapData = useMemo(() => useWorkoutStore.getState().getHeatmapData(), [history]);
  // Re-calculate next workout when history or schedule changes
  const nextWorkout = useMemo(() => useWorkoutStore.getState().getNextWorkout(), [history, weeklySchedule]);
  const lastSession = useWorkoutStore((s) => s.getLastSession());
  const dailyChecklist = useWorkoutStore((s) => s.dailyChecklist);
  const toggleChecklistItem = useWorkoutStore((s) => s.toggleChecklistItem);
  const incrementWater = useWorkoutStore((s) => s.incrementWater);
  const decrementWater = useWorkoutStore((s) => s.decrementWater);
  const waterGoal = useWorkoutStore((s) => s.getWaterGoal());

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

    // Current streak
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
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/gym-tracker/icon.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              Gym<span className="text-neon-blue">Tracker</span>
            </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
          <Flame size={14} className="text-orange-400" />
          <span className="text-sm font-bold text-orange-400">
            {stats.streak}
          </span>
          <span className="text-[10px] text-slate-500">streak</span>
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
          },
          {
            label: "Total",
            value: stats.totalSessions,
            icon: TrendingUp,
            color: "text-neon-green",
          },
          {
            label: "Streak",
            value: `${stats.streak}d`,
            icon: Flame,
            color: "text-orange-400",
          },
        ].map(({ label, value, icon, color }) => {
          const Icon = icon;
          return (
            <div
              key={label}
              className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center"
            >
              <Icon size={16} className={`${color} mx-auto mb-1.5`} />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {label}
              </p>
            </div>
          );
        })}
      </div>

        {/* Next Workout Card */}
      {nextWorkout && (
        <div className="w-full bg-linear-to-r from-neon-blue/10 to-neon-purple/10 rounded-2xl p-4 border border-neon-blue/20 hover:border-neon-blue/40 transition-all text-left group relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/15 flex items-center justify-center">
                <Dumbbell size={20} className="text-neon-blue" />
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  {nextWorkout.daysUntil === 0 ? (
                    <>
                      <Flame size={12} className="text-orange-400" />
                      <span className="text-orange-400 font-medium">Today&rsquo;s Workout</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={12} className="text-slate-500" />
                      <span>In {nextWorkout.daysUntil} day{nextWorkout.daysUntil > 1 ? "s" : ""}</span>
                    </>
                  )}
                </p>
                <p className="text-base font-semibold text-white">
                  {nextWorkout.program.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {nextWorkout.program.muscles.join(" · ")}
                </p>
              </div>
            </div>
            
            {nextWorkout.daysUntil === 0 ? (
               <div className="flex items-center gap-2">
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Simple prompt for now, could be a better modal
                    // For a better UI, we should add a state for "isEditingSchedule"
                    // and show a proper modal. Let's do that.
                    setEditingSchedule(true);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                 >
                   <Edit2 size={14} />
                 </button>
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    useWorkoutStore.getState().startWorkout(nextWorkout.program.id);
                    navigate("/workout/active");
                  }}
                  className="bg-neon-blue text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20"
                >
                  Start
                </button>
               </div>
            ) : (
              <button 
                onClick={() => navigate("/workout")}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors"
                >
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setEditingSchedule(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-700 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">Change Today's Workout</h3>
              <button onClick={() => setEditingSchedule(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
               {Object.values(useWorkoutStore.getState().getPrograms()).map(program => (
                 <button
                   key={program.id}
                   onClick={() => {
                     // We need the day index. getNextWorkout returns it now.
                     // But we didn't update the component to receive it yet.
                     // We need to re-fetch nextWorkout to get dayIndex.
                     const dayIndex = nextWorkout.dayIndex;
                     if (dayIndex !== undefined) {
                        useWorkoutStore.getState().setSchedule(dayIndex, program.id);
                        setEditingSchedule(false);
                     }
                   }}
                   className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                     nextWorkout.program.id === program.id 
                       ? "bg-neon-blue/10 text-neon-blue" 
                       : "hover:bg-slate-800 text-slate-300"
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      nextWorkout.program.id === program.id ? "bg-neon-blue/20" : "bg-slate-800"
                   }`}>
                      <Dumbbell size={14} />
                   </div>
                   <div className="text-left">
                     <p className="text-sm font-medium">{program.name}</p>
                     <p className="text-[10px] text-slate-500">{program.muscles.join(", ")}</p>
                   </div>
                   {nextWorkout.program.id === program.id && <div className="ml-auto text-xs font-bold">Current</div>}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Session */}
      {lastSession && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-xs text-slate-500 mb-1">Last Session</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {lastSession.programName}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(lastSession.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">
                {lastSession.exercises.length} exercises
              </p>
              <p className="text-xs text-slate-500">
                {lastSession.exercises.reduce(
                  (acc, e) => acc + e.sets.length,
                  0,
                )}{" "}
                sets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Heatmap */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-neon-green" />
          Activity
        </h2>
        <Heatmap data={heatmapData} />
      </div>

      {/* Daily Checklist */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          Daily Checklist
        </h2>

        {/* Vitamin */}
        <button
          onClick={() => toggleChecklistItem("vitamin")}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
            dailyChecklist.vitamin
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
          }`}
        >
          <Pill
            size={18}
            className={
              dailyChecklist.vitamin ? "text-emerald-400" : "text-slate-500"
            }
          />
          <span
            className={`text-sm ${dailyChecklist.vitamin ? "text-emerald-400 line-through" : "text-white"}`}
          >
            Centrum Vitamin
          </span>
          {dailyChecklist.vitamin && (
            <span className="ml-auto text-emerald-400 text-xs">✓</span>
          )}
        </button>



        {/* Water Counter */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3">
            <Droplets size={18} className="text-blue-400" />
            <div>
              <p className="text-sm text-white">Water</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {(dailyChecklist.water * 0.25).toFixed(2)}L <span className="text-slate-600">/</span> {(waterGoal * 0.25).toFixed(2)}L
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementWater}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white active:scale-90 transition-all"
            >
              −
            </button>
            <span className="text-lg font-bold text-neon-blue w-8 text-center">
              {dailyChecklist.water}
            </span>
            <button
              onClick={incrementWater}
              className="w-8 h-8 rounded-lg bg-neon-blue/20 hover:bg-neon-blue/30 flex items-center justify-center text-neon-blue active:scale-90 transition-all"
            >
              +
            </button>
          </div>
          {/* Mini progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 hidden">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{
                width: `${Math.min(100, (dailyChecklist.water / waterGoal) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
