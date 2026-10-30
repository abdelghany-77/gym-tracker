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
  Coffee,
  Moon,
  Target,
  Zap,
  Crown,
  Play,
  BarChart2,
} from "lucide-react";
import ActivityChart from "../components/ActivityChart";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import ReminderWidget from "../components/ReminderWidget";
import { trainingPlans } from "../data/exercises";
import AngleRadarChart from "../components/AngleRadarChart";
import Modal from "../components/Modal";
import { parseLocalDate } from "../utils/dateUtils";

export default function Dashboard() {
  const navigate = useNavigate();
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [activityDate, setActivityDate] = useState(new Date());
  const [showAnalytics, setShowAnalytics] = useState(false);

  const history = useWorkoutStore((s) => s.history);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule);
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const programs = useWorkoutStore((s) => s.programs);
  const activePlan = trainingPlans[activeProgram] || trainingPlans.ppl_upper;

  const heatmapData = useMemo(
    () => useWorkoutStore.getState().getHeatmapData(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history],
  );

  const nextWorkout = useMemo(
    () => useWorkoutStore.getState().getNextWorkout(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, weeklySchedule, programs, activeProgram],
  );

  const lastSession = useMemo(() => {
    if (history.length === 0) return null;
    return history[history.length - 1];
  }, [history]);

  const stats = useMemo(() => {
    const totalSessions = history.length;
    const thisWeek = history.filter((s) => {
      const d = parseLocalDate(s.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart && d <= now;
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
    <div className="px-4 pt-4 pb-20 max-w-lg mx-auto space-y-3.5 animate-fadeIn bg-bg-deep min-h-screen">
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={getImageUrl("icon.png")}
            alt="GymTracker Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Gym<span className="text-neon-cyan">Tracker</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider ${
              activeProgram === "ppl_upper"
                ? "bg-neon-cyan/10 border-neon-cyan/25 text-neon-cyan"
                : "bg-vivid-purple/10 border-vivid-purple/25 text-vivid-purple"
            }`}
          >
            {activeProgram === "ppl_upper" ? (
              <Zap size={10} />
            ) : (
              <Crown size={10} />
            )}
            {activePlan.name}
          </div>
          <div className="flex items-center gap-1 bg-slate-900 rounded-full px-2.5 py-1 border border-slate-800">
            <Flame size={13} className="text-orange-400 fill-orange-400/20" />
            <span className="text-xs font-bold text-white">
              {stats.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Workout Resume Card (Immediate Priority) ── */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-emerald-500/10 rounded-2xl p-3.5 border border-emerald-500/30 hover:border-emerald-500/50 transition-all text-left active:scale-[0.99] btn-press shadow-md"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-bg-deep flex items-center justify-center font-bold shrink-0">
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  In Progress
                </p>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {activeWorkout.programName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
              Resume <ChevronRight size={14} />
            </div>
          </div>
        </button>
      )}

      {/* ── Today / Next Workout Hero Card ── */}
      {nextWorkout && !activeWorkout && (
        <div
          className={`w-full rounded-2xl p-3.5 border transition-all text-left relative overflow-hidden ${
            nextWorkout.isRest
              ? "bg-slate-900/70 border-slate-800"
              : "bg-slate-900/90 border-border-slate hover:border-neon-cyan/40 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  nextWorkout.isRest
                    ? "bg-slate-800 text-slate-400"
                    : "bg-neon-cyan text-bg-deep font-bold"
                }`}
              >
                {nextWorkout.isRest ? (
                  <Coffee size={18} />
                ) : (
                  <Dumbbell size={18} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mb-0.5">
                  <Calendar
                    size={10}
                    className={
                      nextWorkout.isRest ? "text-slate-400" : "text-neon-cyan"
                    }
                  />
                  <span
                    className={
                      nextWorkout.daysUntil === 0
                        ? "text-neon-cyan font-bold"
                        : "text-slate-400"
                    }
                  >
                    {nextWorkout.daysUntil === 0
                      ? "Today's Target"
                      : `In ${nextWorkout.daysUntil} day${nextWorkout.daysUntil > 1 ? "s" : ""}`}
                  </span>
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {nextWorkout.isRest
                    ? "Rest & Recovery"
                    : nextWorkout.program?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {nextWorkout.isRest
                    ? "Muscle recovery and hydration"
                    : nextWorkout.program?.muscles?.join(" · ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSchedule(true);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Edit schedule"
                title="Change day target"
              >
                <Edit2 size={13} />
              </button>
              {!nextWorkout.isRest ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    useWorkoutStore
                      .getState()
                      .startWorkout(nextWorkout.program.id);
                    navigate("/workout/active");
                  }}
                  className="bg-neon-cyan text-bg-deep px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-neon-cyan/90 active:scale-95 transition-all flex items-center gap-1 btn-press shadow-sm"
                  aria-label={`Start ${nextWorkout.program?.name}`}
                >
                  Start <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/workout")}
                  aria-label="Choose a workout"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Stats: Compact 3-Column Row ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "This Week",
            value: stats.thisWeek,
            icon: Calendar,
            color: "text-neon-cyan",
          },
          {
            label: "Total Done",
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
              className="glass-card p-2.5 text-center border border-border-slate"
            >
              <div className="w-6 h-6 rounded-md bg-slate-800/60 flex items-center justify-center mx-auto mb-1">
                <Icon size={12} className={color} />
              </div>
              <p className="text-base font-bold text-white leading-tight">
                {value}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Quick Reminder Widget (Water & Vitamins) ── */}
      <ReminderWidget />

      {/* ── Last Completed Session (Compact 1-Row Summary) ── */}
      {lastSession && (
        <div className="glass-card p-3 border border-border-slate space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={11} className="text-neon-cyan" />
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
            <p className="text-xs font-bold text-white truncate max-w-[200px]">
              {lastSession.programName}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>{lastSession.exercises.length} exercises</span>
              <span>•</span>
              <span>
                {lastSession.exercises.reduce(
                  (acc, e) => acc + e.sets.length,
                  0,
                )}{" "}
                sets
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State CTA (When no sessions exist) ── */}
      {stats.totalSessions === 0 && !activeWorkout && (
        <div className="glass-card p-5 text-center space-y-2.5 border border-border-slate">
          <div className="w-11 h-11 mx-auto rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
            <Target size={20} className="text-neon-cyan" />
          </div>
          <h3 className="text-sm font-bold text-white">Start Your Journey</h3>
          <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Select a workout routine to log your sets, reps, and track
            progressive overload.
          </p>
          <button
            onClick={() => navigate("/workout")}
            className="bg-neon-cyan text-bg-deep px-4 py-2 rounded-xl text-xs font-bold hover:bg-neon-cyan/90 active:scale-95 transition-all inline-flex items-center gap-1.5 btn-press shadow-sm"
          >
            Start Workout <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Collapsible Analytics Section (Heatmap & Biomechanical Angles) ── */}
      <div className="glass-card overflow-hidden border border-border-slate">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          aria-expanded={showAnalytics}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={15} className="text-neon-cyan" />
            <div>
              <span className="text-xs font-bold text-white block">
                Activity Heatmap & Muscle Angles
              </span>
              <span className="text-[10px] text-slate-400">
                {showAnalytics
                  ? "Tap to collapse"
                  : "Tap to view charts & training coverage"}
              </span>
            </div>
          </div>
          <ChevronRight
            size={15}
            className={`text-slate-400 transition-transform duration-200 ${
              showAnalytics ? "rotate-90" : ""
            }`}
          />
        </button>

        {showAnalytics && (
          <div className="p-3.5 pt-1 border-t border-border-slate animate-fadeIn space-y-4">
            {/* Heatmap Month Picker */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Monthly Consistency
              </span>
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-800 p-0.5">
                <button
                  onClick={() =>
                    setActivityDate(
                      new Date(
                        activityDate.getFullYear(),
                        activityDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-[10px] font-semibold text-white min-w-[70px] text-center select-none">
                  {activityDate.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() =>
                    setActivityDate(
                      new Date(
                        activityDate.getFullYear(),
                        activityDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            <ActivityChart data={heatmapData} currentDate={activityDate} />

            <div className="h-px bg-border-slate/60" />

            {/* Biomechanical Radar Chart */}
            <AngleRadarChart showRecommendations={false} />
          </div>
        )}
      </div>

      {/* ── Edit Today's Schedule Modal ── */}
      <Modal
        isOpen={editingSchedule}
        onClose={() => setEditingSchedule(false)}
        title="Change day's workout"
      >
        <div className="p-2.5 space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => {
              const dayIndex = nextWorkout?.dayIndex;
              if (dayIndex !== undefined) {
                useWorkoutStore.getState().setSchedule(dayIndex, "rest");
                setEditingSchedule(false);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
              nextWorkout?.isRest
                ? "bg-slate-800 border-neon-cyan/40"
                : "border-slate-800 hover:bg-slate-800/50"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <Moon size={15} />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-semibold text-white">Rest Day</p>
              <p className="text-[10px] text-slate-400">Take time to recover</p>
            </div>
          </button>

          {Object.values(programs).map((program) => {
            const isCurrent =
              !nextWorkout?.isRest && nextWorkout?.program?.id === program.id;
            return (
              <button
                key={program.id}
                onClick={() => {
                  const dayIndex = nextWorkout?.dayIndex;
                  if (dayIndex !== undefined) {
                    useWorkoutStore
                      .getState()
                      .setSchedule(dayIndex, program.id);
                    setEditingSchedule(false);
                  }
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
                  isCurrent
                    ? "bg-neon-cyan/10 border-neon-cyan/40"
                    : "border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? "bg-neon-cyan text-bg-deep font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Dumbbell size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${isCurrent ? "text-neon-cyan" : "text-white"}`}
                  >
                    {program.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {program.muscles.join(", ")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
