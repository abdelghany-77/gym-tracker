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
import { ConfirmDialog } from "../components/Modal";
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
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-4 animate-fadeIn bg-bg-deep min-h-screen">
      {/* Header — compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl("icon.png")}
            alt="GymTracker Logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              G<span className="text-accent">y</span>m
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 border text-[10px] font-semibold ${
            activeProgram === 'ppl_upper'
              ? 'bg-accent/8 border-accent/20 text-accent'
              : 'bg-vivid-purple/8 border-vivid-purple/20 text-vivid-purple'
          }`}>
            {activeProgram === 'ppl_upper' ? <Zap size={10} /> : <Crown size={10} />}
            {activePlan.name}
          </div>
          <div className="flex items-center gap-1 bg-bg-card rounded-full px-2.5 py-1 border border-border-slate">
            <Flame size={12} className="text-orange-500" />
            <span className="text-xs font-bold text-white">{stats.streak}</span>
          </div>
        </div>
      </div>

      {/* ── Resume Active Workout (highest priority) ── */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-accent/10 rounded-2xl p-4 border border-accent/25 hover:border-accent/40 transition-all text-left group active:scale-[0.99]"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-bg-deep">
                <Play size={20} />
              </div>
              <div>
                <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">Resume Workout</p>
                <p className="text-sm font-bold text-white mt-0.5">{activeWorkout.programName}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-accent" />
          </div>
        </button>
      )}

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "This Week", value: stats.thisWeek, icon: Calendar, color: "text-accent", bg: "bg-accent/8" },
          { label: "Total", value: stats.totalSessions, icon: TrendingUp, color: "text-neon-emerald", bg: "bg-neon-emerald/8" },
          { label: "Streak", value: `${stats.streak}d`, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/8" },
        ].map(({ label, value, icon, color, bg }) => {
          const Icon = icon;
          return (
            <div key={label} className="glass-card p-3">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-1.5`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-base font-bold text-white">{value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Empty State CTA ── */}
      {stats.totalSessions === 0 && !activeWorkout && (
        <div className="glass-card p-6 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
            <Target size={24} className="text-accent" />
          </div>
          <h3 className="text-sm font-bold text-white">Ready to Start?</h3>
          <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Your fitness journey begins here. Start your first workout!
          </p>
          <button
            onClick={() => navigate("/workout")}
            className="bg-accent text-bg-deep px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all inline-flex items-center gap-2 btn-press"
            aria-label="Start your first workout"
          >
            Start Workout <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* ── Next Workout Card ── */}
      {nextWorkout && !activeWorkout && (
        <div className={`w-full rounded-2xl p-4 border transition-all relative overflow-hidden ${
          nextWorkout.isRest
            ? "bg-bg-card border-border-slate"
            : "bg-bg-card border-border-slate hover:border-accent/25"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                nextWorkout.isRest
                  ? "bg-slate-800 text-slate-400"
                  : "bg-accent text-bg-deep"
              }`}>
                {nextWorkout.isRest ? <Coffee size={20} /> : <Dumbbell size={20} />}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mb-0.5">
                  {nextWorkout.daysUntil === 0 ? (
                    <>
                      <Calendar size={10} className={nextWorkout.isRest ? "text-slate-400" : "text-accent"} />
                      <span className={nextWorkout.isRest ? "text-slate-300" : "text-accent"}>Today</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={10} className="text-slate-500" />
                      <span>In {nextWorkout.daysUntil} day{nextWorkout.daysUntil > 1 ? "s" : ""}</span>
                    </>
                  )}
                </p>
                <p className="text-sm font-bold text-white">
                  {nextWorkout.isRest ? "Rest Day" : nextWorkout.program?.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {nextWorkout.isRest ? "Recover & Rehydrate" : nextWorkout.program?.muscles.join(" · ")}
                </p>
              </div>
            </div>

            {nextWorkout.daysUntil === 0 ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingSchedule(true); }}
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                  aria-label="Edit today's schedule"
                >
                  <Edit2 size={14} />
                </button>
                {!nextWorkout.isRest && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useWorkoutStore.getState().startWorkout(nextWorkout.program.id);
                      navigate("/workout/active");
                    }}
                    className="bg-accent text-bg-deep px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all flex items-center gap-1.5 btn-press"
                    aria-label={`Start ${nextWorkout.program?.name} workout`}
                  >
                    Start <ChevronRight size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/workout")}
                className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                aria-label="View workouts"
              >
                <ChevronRight size={16} className="text-slate-400" />
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
            className="bg-bg-card rounded-2xl w-full max-w-sm border border-border-slate overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Change today's schedule"
          >
            <div className="p-4 border-b border-border-slate flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Change Today&apos;s Goal</h3>
              <button
                onClick={() => setEditingSchedule(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => {
                  const dayIndex = nextWorkout.dayIndex;
                  if (dayIndex !== undefined) {
                    useWorkoutStore.getState().setSchedule(dayIndex, "rest");
                    setEditingSchedule(false);
                  }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  nextWorkout.isRest
                    ? "bg-slate-800 border-slate-700"
                    : "border-transparent hover:bg-slate-800/50"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  nextWorkout.isRest ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-500"
                }`}>
                  <Moon size={16} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${nextWorkout.isRest ? "text-white" : "text-slate-300"}`}>Rest Day</p>
                  <p className="text-[10px] text-slate-500">Recover & Sleep</p>
                </div>
                {nextWorkout.isRest && <div className="ml-auto text-[10px] font-bold text-slate-600">ACTIVE</div>}
              </button>

              <div className="h-px bg-border-slate my-1.5 mx-3" />

              {Object.values(useWorkoutStore.getState().getPrograms()).map((program) => {
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                      isCurrent ? "bg-accent/5 border-accent/20" : "border-transparent hover:bg-slate-800/50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isCurrent ? "bg-accent text-bg-deep" : "bg-slate-800 text-slate-500"
                    }`}>
                      <Dumbbell size={16} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-slate-300"}`}>{program.name}</p>
                      <p className="text-[10px] text-slate-500">{program.muscles.join(", ")}</p>
                    </div>
                    {isCurrent && <div className="ml-auto text-[10px] font-bold text-accent">ACTIVE</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Water & Vitamin Reminders — compact */}
      <ReminderWidget />

      {/* Cardio Quick Access — compact row */}
      <button
        onClick={() => navigate("/cardio")}
        className="w-full glass-card p-3 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-red-500/20"
        aria-label="Open Cardio & Conditioning"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            <HeartPulse size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Cardio</h3>
            <p className="text-[10px] text-slate-500">Track conditioning & aerobic activity</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
      </button>

      {/* Last Session — compact */}
      {lastSession && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />
              Last Session
            </h2>
            <span className="text-[10px] text-slate-500">
              {new Date(lastSession.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{lastSession.programName}</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Dumbbell size={10} /> {lastSession.exercises.length} ex
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <TrendingUp size={10} /> {lastSession.exercises.reduce((acc, e) => acc + e.sets.length, 0)} sets
              </span>
            </div>
          </div>
        </div>
      )}

      {!lastSession && stats.totalSessions === 0 && !activeWorkout && null}

      {/* Activity Chart — collapsible to reduce scroll */}
      <button
        onClick={() => setShowActivity(!showActivity)}
        className="w-full glass-card p-3.5 flex items-center justify-between group"
      >
        <h2 className="text-xs font-semibold text-white flex items-center gap-2">
          <TrendingUp size={14} className="text-vivid-purple" />
          Activity Heatmap
        </h2>
        <ChevronRight size={14} className={`text-slate-500 transition-transform ${showActivity ? "rotate-90" : ""}`} />
      </button>

      {showActivity && (
        <div className="glass-card p-4 animate-fadeIn">
          <div className="flex items-center justify-end mb-3">
            <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-border-slate p-1">
              <button
                onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() - 1, 1))}
                className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-[10px] font-semibold text-white min-w-[70px] text-center select-none">
                {activityDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
              <button
                onClick={() => setActivityDate(new Date(activityDate.getFullYear(), activityDate.getMonth() + 1, 1))}
                className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
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
  );
}
