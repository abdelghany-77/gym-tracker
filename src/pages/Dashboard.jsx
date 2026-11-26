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
  Play,
  BarChart2,
  Check,
  Receipt,
} from "lucide-react";
import ActivityChart from "../components/ActivityChart";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import ReminderWidget from "../components/ReminderWidget";
import { trainingPlans } from "../data/exercises";
import AngleRadarChart from "../components/AngleRadarChart";
import Modal from "../components/Modal";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import { parseLocalDate } from "../utils/dateUtils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function computeSessionVolume(session) {
  if (!session?.exercises) return 0;
  return Math.round(
    session.exercises.reduce(
      (sum, ex) =>
        sum +
        (ex.sets || []).reduce(
          (setSum, s) =>
            s.type === "W"
              ? setSum
              : setSum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
          0,
        ),
      0,
    ),
  );
}

function formatDuration(session) {
  if (!session?.startedAt || !session?.finishedAt) return null;
  const mins = Math.round(
    (new Date(session.finishedAt) - new Date(session.startedAt)) / 60000,
  );
  return mins > 0 ? `${mins}m` : "<1m";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [activityDate, setActivityDate] = useState(new Date());
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [receiptSession, setReceiptSession] = useState(null);

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
    if (!Array.isArray(history) || history.length === 0) return null;
    return history[history.length - 1];
  }, [history]);

  const lastSessionMetrics = useMemo(() => {
    if (!lastSession) return null;
    return {
      volume: computeSessionVolume(lastSession),
      sets: (lastSession.exercises || []).reduce(
        (acc, e) => acc + (e.sets || []).length,
        0,
      ),
      duration: formatDuration(lastSession),
    };
  }, [lastSession]);

  const weekStrip = useMemo(() => {
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - todayIndex);
    monday.setHours(0, 0, 0, 0);

    return WEEK_DAYS.map((label, idx) => {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + idx);
      const dateStr = dateObj.toLocaleDateString("en-CA");
      const schedId = weeklySchedule?.[idx];
      const isRest = !schedId || schedId === "rest";
      const program = !isRest ? programs?.[schedId] : null;
      return {
        idx,
        label,
        dayNum: dateObj.getDate(),
        dateStr,
        isToday: idx === todayIndex,
        completed: Boolean(heatmapData?.[dateStr]),
        isRest: isRest || !program,
        shortLabel: program ? (program.name || "Workout").split(" ")[0] : "Rest",
        fullLabel: program ? program.name || "Workout" : "Rest Day",
      };
    });
  }, [weeklySchedule, programs, heatmapData]);

  const weeklyTargetDays = useMemo(() => {
    const scheduleValues = Array.isArray(weeklySchedule)
      ? weeklySchedule
      : Object.values(weeklySchedule || {});
    const active = scheduleValues.filter(
      (id) => id && id !== "rest" && programs?.[id],
    ).length;
    return active > 0 ? active : 4;
  }, [weeklySchedule, programs]);

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

  const editingProgramId =
    editingDayIndex !== null ? weeklySchedule?.[editingDayIndex] : null;

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-24 lg:pb-8 max-w-6xl mx-auto space-y-5 bg-bg-deep min-h-screen">
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={getImageUrl("icon.png")}
            alt="GymTracker Logo"
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              GymTracker
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1 truncate">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              · {activePlan.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-bg-surface px-3 py-1.5 border border-slate-800 shrink-0">
          <Flame size={14} className="text-amber-400" aria-hidden="true" />
          <span className="text-xs font-bold font-mono tabular-nums text-white">
            {stats.streak}d
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            streak
          </span>
        </div>
      </div>

      {/* ── Responsive 2-Column Desktop Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT COLUMN (7 cols): Primary Workout Action, Week Strip & Activity Heatmap ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Workout Resume Card (Immediate Priority) */}
          {activeWorkout && (
            <button
              onClick={() => navigate("/workout/active")}
              className="w-full bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/35 hover:border-emerald-500/60 transition-all text-left active:scale-[0.99] min-h-11"
              aria-label={`Resume ${activeWorkout.programName} workout`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                      In Progress
                    </p>
                    <p className="text-sm font-bold text-white truncate mt-0.5">
                      {activeWorkout.programName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                  Resume <ChevronRight size={15} />
                </div>
              </div>
            </button>
          )}

          {/* Today / Next Workout Hero Card */}
          {nextWorkout && !activeWorkout && (
            <div className="w-full rounded-2xl p-4 border border-slate-800 bg-bg-surface transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      nextWorkout.isRest
                        ? "bg-slate-800/80 border-slate-700 text-slate-400"
                        : "bg-slate-100 border-slate-100 text-slate-950"
                    }`}
                  >
                    {nextWorkout.isRest ? (
                      <Coffee size={19} />
                    ) : (
                      <Dumbbell size={19} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      <span
                        className={
                          nextWorkout.daysUntil === 0
                            ? "text-sky-400 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {nextWorkout.daysUntil === 0
                          ? "Today's Target"
                          : `In ${nextWorkout.daysUntil} day${nextWorkout.daysUntil > 1 ? "s" : ""}`}
                      </span>
                    </p>
                    <p className="text-base font-bold text-white truncate mt-0.5">
                      {nextWorkout.isRest
                        ? "Rest & Recovery"
                        : nextWorkout.program?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {nextWorkout.isRest
                        ? "Muscle recovery and hydration"
                        : nextWorkout.program?.muscles?.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingDayIndex(nextWorkout.dayIndex ?? 0)}
                    className="min-w-11 min-h-11 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Edit schedule"
                    title="Change day target"
                  >
                    <Edit2 size={15} />
                  </button>
                  {!nextWorkout.isRest && nextWorkout.program ? (
                    <button
                      onClick={() => {
                        useWorkoutStore
                          .getState()
                          .startWorkout(nextWorkout.program.id);
                        navigate("/workout/active");
                      }}
                      className="min-h-11 bg-slate-100 text-slate-950 px-4 rounded-xl text-xs font-bold hover:bg-white active:scale-[0.98] transition-all flex items-center gap-1"
                      aria-label={`Start ${nextWorkout.program?.name}`}
                    >
                      Start <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/workout")}
                      aria-label="Choose a workout"
                      className="min-h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      Browse <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Interactive Week Strip (Mon–Sun) */}
          <div className="rounded-2xl border border-slate-800 bg-bg-surface p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300">This Week</h2>
              <span className="text-[11px] text-slate-500">
                Tap any day to adjust schedule
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {weekStrip.map((day) => (
                <button
                  key={day.idx}
                  type="button"
                  onClick={() => setEditingDayIndex(day.idx)}
                  aria-label={`${day.label}: ${day.fullLabel}${day.completed ? ", completed" : ""}`}
                  className={`min-h-14 rounded-xl border px-0.5 sm:px-1.5 py-2 flex flex-col items-center justify-between transition-colors ${
                    day.isToday
                      ? "border-sky-400/60 bg-sky-500/10 text-white"
                      : day.completed
                        ? "border-emerald-500/30 bg-emerald-500/5 text-slate-200 hover:border-emerald-500/50"
                        : "border-slate-800 bg-bg-deep/70 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[10px] font-medium text-slate-400">
                    {day.label}
                  </span>
                  <span className="text-xs font-bold font-mono tabular-nums">
                    {day.completed ? (
                      <Check
                        size={13}
                        className="text-emerald-400 mx-auto"
                        aria-hidden="true"
                      />
                    ) : (
                      day.dayNum
                    )}
                  </span>
                  <span
                    className={`text-[9px] truncate max-w-full px-0.5 ${
                      day.isRest ? "text-slate-500" : "text-slate-300 font-medium"
                    }`}
                  >
                    {day.shortLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Activity Heatmap Card */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-bg-surface">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full min-h-12 p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
              aria-expanded={showAnalytics}
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 size={16} className="text-slate-300" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Activity Heatmap &amp; Consistency
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {showAnalytics
                      ? "Tap to collapse"
                      : "Monthly consistency progress"}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  showAnalytics ? "rotate-90" : ""
                }`}
              />
            </button>

            {showAnalytics && (
              <div className="p-4 pt-2 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Monthly Consistency
                  </span>
                  <div className="flex items-center gap-1 bg-bg-deep rounded-xl border border-slate-800 p-0.5">
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-semibold text-white min-w-[78px] text-center select-none">
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <ActivityChart
                  data={heatmapData}
                  currentDate={activityDate}
                  weeklyTargetDays={weeklyTargetDays}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 cols): Quick Stats, Last Session, Reminders & Muscle Angles ── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Stats: Clean 3-Column Row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: "This Week",
                value: stats.thisWeek,
                icon: Calendar,
                color: "text-sky-400",
              },
              {
                label: "Sessions",
                value: stats.totalSessions,
                icon: TrendingUp,
                color: "text-emerald-400",
              },
              {
                label: "Streak",
                value: `${stats.streak}d`,
                icon: Flame,
                color: "text-amber-400",
              },
            ].map(({ label, value, icon, color }) => {
              const Icon = icon;
              return (
                <div
                  key={label}
                  className="rounded-2xl bg-bg-surface p-3 border border-slate-800 flex flex-col items-center text-center"
                >
                  <Icon
                    size={14}
                    className={`${color} mb-1.5`}
                    aria-hidden="true"
                  />
                  <p className="text-lg font-bold font-mono tabular-nums text-white leading-tight">
                    {value}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Last Completed Session (or Start Journey CTA) */}
          {lastSession && lastSessionMetrics ? (
            <button
              type="button"
              onClick={() => setReceiptSession(lastSession)}
              className="w-full text-left rounded-2xl bg-bg-surface p-4 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 min-h-11"
              aria-label={`View receipt for ${lastSession.programName}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Receipt size={13} className="text-slate-400" />
                  Last Session
                </span>
                <span className="text-xs text-slate-400">
                  {parseLocalDate(lastSession.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white truncate">
                  {lastSession.programName}
                </p>
                <span className="text-xs text-sky-400 font-medium flex items-center gap-0.5 shrink-0">
                  Receipt <ChevronRight size={13} />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 font-mono tabular-nums pt-1 border-t border-slate-800/80">
                <span>{(lastSession.exercises || []).length} exercises</span>
                <span>·</span>
                <span>{lastSessionMetrics.sets} sets</span>
                {lastSessionMetrics.volume > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-slate-200 font-semibold">
                      {lastSessionMetrics.volume.toLocaleString()} kg
                    </span>
                  </>
                )}
                {lastSessionMetrics.duration && (
                  <>
                    <span>·</span>
                    <span>{lastSessionMetrics.duration}</span>
                  </>
                )}
              </div>
            </button>
          ) : (
            !activeWorkout && (
              <div className="rounded-2xl bg-bg-surface p-5 text-center space-y-2.5 border border-slate-800">
                <div className="w-11 h-11 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Target size={20} className="text-sky-400" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Start Your Journey
                </h3>
                <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                  Select a workout routine to log your sets, reps, and track
                  progressive overload.
                </p>
                <button
                  onClick={() => navigate("/workout")}
                  className="min-h-11 bg-slate-100 text-slate-950 px-4 rounded-xl text-xs font-bold hover:bg-white active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                >
                  Start Workout <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            )
          )}

          {/* Water & Vitamins */}
          <ReminderWidget />

          {/* Muscle Angle Coverage */}
          {showAnalytics && (
            <div className="rounded-2xl border border-slate-800 bg-bg-surface p-4">
              <AngleRadarChart showRecommendations={false} />
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Day's Schedule Modal ── */}
      <Modal
        isOpen={editingDayIndex !== null}
        onClose={() => setEditingDayIndex(null)}
        title={
          editingDayIndex !== null
            ? `Change ${WEEK_DAYS[editingDayIndex]}'s workout`
            : "Change day's workout"
        }
      >
        <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => {
              if (editingDayIndex !== null) {
                useWorkoutStore
                  .getState()
                  .setSchedule(editingDayIndex, "rest");
                setEditingDayIndex(null);
              }
            }}
            className={`w-full min-h-12 flex items-center gap-3 p-3 rounded-xl transition-colors border ${
              !editingProgramId || editingProgramId === "rest"
                ? "bg-slate-800 border-sky-400/50"
                : "border-slate-800 hover:bg-slate-800/50"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <Moon size={16} />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-semibold text-white">Rest Day</p>
              <p className="text-[11px] text-slate-400">
                Take time to recover
              </p>
            </div>
          </button>

          {Object.values(programs || {}).map((program) => {
            const isCurrent = editingProgramId === program.id;
            return (
              <button
                key={program.id}
                onClick={() => {
                  if (editingDayIndex !== null) {
                    useWorkoutStore
                      .getState()
                      .setSchedule(editingDayIndex, program.id);
                    setEditingDayIndex(null);
                  }
                }}
                className={`w-full min-h-12 flex items-center gap-3 p-3 rounded-xl transition-colors border ${
                  isCurrent
                    ? "bg-sky-500/10 border-sky-400/50"
                    : "border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? "bg-slate-100 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Dumbbell size={16} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white">
                    {program.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {(program.muscles || []).join(" · ")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* ── Shareable Receipt Modal ── */}
      {receiptSession && (
        <WorkoutReceiptModal
          isOpen={Boolean(receiptSession)}
          session={receiptSession}
          onClose={() => setReceiptSession(null)}
        />
      )}
    </div>
  );
}
