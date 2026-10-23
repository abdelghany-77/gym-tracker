import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Flame,
  Edit2,
  X,
  Coffee,
  Moon,
  Target,
  Zap,
  Crown,
  HeartPulse,
  Play,
} from "lucide-react";
import ActivityChart from "../components/ActivityChart";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import ReminderWidget from "../components/ReminderWidget";
import { trainingPlans } from "../data/exercises";

export default function Dashboard() {
  const navigate = useNavigate();
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [activityDate, setActivityDate] = useState(new Date());
  const [showActivity, setShowActivity] = useState(false);

  const history = useWorkoutStore((s) => s.history);
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule);
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const activePlan = trainingPlans[activeProgram] || trainingPlans.ppl_upper;
  const heatmapData = useMemo(
    () => useWorkoutStore.getState().getHeatmapData(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history],
  );
  const nextWorkout = useMemo(
    () => useWorkoutStore.getState().getNextWorkout(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, weeklySchedule],
  );
  const lastSession = useMemo(() => {
    if (history.length === 0) return null;
    return history[history.length - 1];
  }, [history]);

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
      const dateStr = checkDate.toLocaleDateString("en-CA");
      if (heatmapData[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { totalSessions, thisWeek, streak };
  }, [history, heatmapData]);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto space-y-3.5 animate-fadeIn bg-background min-h-screen">
      {/* Header — compact & aligned */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl("icon.png")}
            alt="GymTracker Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Gym<span className="text-teal-400">Tracker</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full px-2.5 py-1 border border-border bg-surface-elevated text-[11px] font-medium text-slate-300">
            {activeProgram === 'ppl_upper' ? <Zap size={11} className="text-teal-400" /> : <Crown size={11} className="text-amber-400" />}
            {activePlan.name}
          </div>
          <div className="flex items-center gap-1 bg-surface-elevated rounded-full px-2.5 py-1 border border-border">
            <Flame size={12} className="text-amber-400" />
            <span className="text-xs font-bold text-white">{stats.streak}d</span>
          </div>
        </div>
      </div>

      {/* ── Resume Active Workout (Hero CTA) ── */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-teal-500/10 rounded-2xl p-4 border border-teal-500/30 hover:border-teal-500/50 transition-all text-left group active:scale-[0.99] btn-press"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <Play size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">In Progress</p>
                <p className="text-sm font-bold text-white mt-0.5">{activeWorkout.programName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-teal-400">
              Resume <ChevronRight size={16} />
            </div>
          </div>
        </button>
      )}

      {/* ── Quick Stats — Balanced and Cohesive ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "This Week", value: stats.thisWeek, icon: Calendar },
          { label: "Total Done", value: stats.totalSessions, icon: TrendingUp },
          { label: "Streak", value: stats.streak, icon: Flame },
        ].map(({ label, value, icon }) => {
          const Icon = icon;
          return (
            <div key={label} className="glass-card p-3 text-center">
              <div className="w-7 h-7 rounded-lg bg-surface-elevated flex items-center justify-center mx-auto mb-1.5 border border-border">
                <Icon size={14} className="text-teal-400" />
              </div>
              <p className="text-lg font-bold text-white leading-tight">{value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Empty State CTA ── */}
      {stats.totalSessions === 0 && !activeWorkout && (
        <div className="glass-card p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Target size={22} className="text-teal-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Start Your Journey</h3>
          <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Choose a workout routine to log your sets, reps, and track progressive overload.
          </p>
          <button
            onClick={() => navigate("/workout")}
            className="bg-teal-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-400 active:scale-95 transition-all inline-flex items-center gap-1.5 btn-press shadow-sm"
            aria-label="Start your first workout"
          >
            Start Workout <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Next Scheduled Workout Card ── */}
      {nextWorkout && !activeWorkout && (
        <div className="glass-card p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                nextWorkout.isRest
                  ? "bg-surface-elevated text-slate-400 border border-border"
                  : "bg-teal-500 text-slate-950"
              }`}>
                {nextWorkout.isRest ? <Coffee size={18} /> : <Dumbbell size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                  <Calendar size={10} className="text-teal-400" />
                  {nextWorkout.daysUntil === 0 ? "Today" : `In ${nextWorkout.daysUntil} day${nextWorkout.daysUntil > 1 ? "s" : ""}`}
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {nextWorkout.isRest ? "Rest Day" : nextWorkout.program?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {nextWorkout.isRest ? "Rest & Recovery" : nextWorkout.program?.muscles?.join(" · ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setEditingSchedule(true)}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Edit schedule"
                title="Change day target"
              >
                <Edit2 size={13} />
              </button>
              {!nextWorkout.isRest && (
                <button
                  onClick={() => {
                    useWorkoutStore.getState().startWorkout(nextWorkout.program.id);
                    navigate("/workout/active");
                  }}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1 btn-press"
                  aria-label={`Start ${nextWorkout.program?.name}`}
                >
                  Start <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setEditingSchedule(false)}
        >
          <div
            className="bg-surface-elevated rounded-2xl w-full max-w-sm border border-border overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Change today's schedule"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Change Today&apos;s Workout</h3>
              <button
                onClick={() => setEditingSchedule(false)}
                className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => {
                  const dayIndex = nextWorkout?.dayIndex;
                  if (dayIndex !== undefined) {
                    useWorkoutStore.getState().setSchedule(dayIndex, "rest");
                    setEditingSchedule(false);
                  }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  nextWorkout?.isRest
                    ? "bg-surface border-teal-500/40"
                    : "border-border hover:bg-surface"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-slate-300">
                  <Moon size={15} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xs font-semibold text-white">Rest Day</p>
                  <p className="text-[10px] text-slate-400">Take time to recover</p>
                </div>
              </button>

              {Object.values(useWorkoutStore.getState().getPrograms()).map((program) => {
                const isCurrent = !nextWorkout?.isRest && nextWorkout?.program?.id === program.id;
                return (
                  <button
                    key={program.id}
                    onClick={() => {
                      const dayIndex = nextWorkout?.dayIndex;
                      if (dayIndex !== undefined) {
                        useWorkoutStore.getState().setSchedule(dayIndex, program.id);
                        setEditingSchedule(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                      isCurrent ? "bg-teal-500/10 border-teal-500/40" : "border-border hover:bg-surface"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCurrent ? "bg-teal-500 text-slate-950 font-bold" : "bg-surface text-slate-400"
                    }`}>
                      <Dumbbell size={15} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? "text-teal-400" : "text-white"}`}>{program.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{program.muscles.join(", ")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Water & Vitamin Reminders */}
      <ReminderWidget />

      {/* Cardio Quick Access Row */}
      <button
        onClick={() => navigate("/cardio")}
        className="w-full glass-card p-3 flex items-center justify-between group active:scale-[0.99] transition-all"
        aria-label="Open Cardio & Conditioning"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-teal-400">
            <HeartPulse size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold text-white">Cardio & Conditioning</h3>
            <p className="text-[10px] text-slate-400">Aerobic targets, sessions & trends</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* Last Session Snapshot */}
      {lastSession && (
        <div className="glass-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} className="text-teal-400" />
              Last Session
            </h2>
            <span className="text-[10px] text-slate-400">
              {new Date(lastSession.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <p className="text-xs font-bold text-white">{lastSession.programName}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span>{lastSession.exercises.length} exercises</span>
              <span>{lastSession.exercises.reduce((acc, e) => acc + e.sets.length, 0)} sets</span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Heatmap — Collapsible */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="w-full p-3.5 flex items-center justify-between transition-colors hover:bg-surface-hover"
        >
          <h2 className="text-xs font-semibold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-teal-400" />
            Activity Heatmap
          </h2>
          <ChevronRight size={14} className={`text-slate-400 transition-transform ${showActivity ? "rotate-90" : ""}`} />
        </button>

        {showActivity && (
          <div className="p-4 pt-1 border-t border-border animate-fadeIn space-y-3">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-1 bg-surface-elevated rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() - 1, 1))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-[10px] font-semibold text-white min-w-[72px] text-center select-none">
                  {activityDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <button
                  onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() + 1, 1))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
            <ActivityChart data={heatmapData} currentDate={activityDate} />
          </div>
        )}
      </div>
    </div>
  );
}
