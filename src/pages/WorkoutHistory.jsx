import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  TrendingUp,
  X,
  Share2,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import AngleRadarChart from "../components/AngleRadarChart";

export default function WorkoutHistory() {
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [receiptSession, setReceiptSession] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const getExerciseName = (id) =>
    exercises.find((e) => e.id === id)?.name || id;

  // Build calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-start

    const sessionsByDate = {};
    history.forEach((s) => {
      if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
      sessionsByDate[s.date].push(s);
    });

    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        date: dateStr,
        sessions: sessionsByDate[dateStr] || [],
        isToday: dateStr === new Date().toLocaleDateString("en-CA"),
      });
    }
    return days;
  }, [currentDate, history]);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const formatDuration = (s) => {
    if (!s.startedAt || !s.finishedAt) return null;
    const ms = new Date(s.finishedAt) - new Date(s.startedAt);
    const mins = Math.round(ms / 60000);
    return mins > 0 ? `${mins}m` : "<1m";
  };

  const totalSessions = history.length;
  const totalSets = history.reduce(
    (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
    0,
  );

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Progress</h1>
          <p className="text-xs text-slate-400">
            {totalSessions} total sessions · {totalSets} logged sets
          </p>
        </div>
        {/* View mode toggle */}
        <div className="flex bg-surface-elevated rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-md text-xs transition-all ${
              viewMode === "list"
                ? "bg-teal-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1 rounded-md text-xs transition-all ${
              viewMode === "calendar"
                ? "bg-teal-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="glass-card p-4 space-y-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-xs font-bold text-white tracking-wide">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="text-[10px] text-slate-400 text-center font-semibold">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((cell, i) =>
              cell === null ? (
                <div key={`empty-${i}`} className="aspect-square" />
              ) : (
                <button
                  key={cell.date}
                  onClick={() =>
                    cell.sessions.length > 0 &&
                    setSelectedSession(cell.sessions[0])
                  }
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all relative ${
                    cell.sessions.length > 0
                      ? "bg-teal-500/15 text-teal-400 font-bold hover:bg-teal-500/25 cursor-pointer border border-teal-500/30"
                      : cell.isToday
                        ? "bg-surface-elevated text-white font-bold ring-1 ring-teal-400/50"
                        : "text-slate-400 hover:bg-surface-elevated"
                  }`}
                  disabled={cell.sessions.length === 0}
                  aria-label={`${cell.date}${cell.sessions.length > 0 ? `, ${cell.sessions.length} workout(s)` : ""}`}
                >
                  <span>{cell.day}</span>
                  {cell.sessions.length > 0 && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400" />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Selected Session Detail Card */}
      {selectedSession && (
        <div className="glass-card p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedSession.programName}</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar size={11} className="text-teal-400" />
                {new Date(selectedSession.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {formatDuration(selectedSession) && (
                  <>
                    <span>·</span>
                    <Clock size={11} className="text-teal-400" />
                    {formatDuration(selectedSession)}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close details"
            >
              <X size={13} />
            </button>
          </div>

          {/* Exercises in that session */}
          <div className="space-y-1.5">
            {selectedSession.exercises.map((ex, i) => (
              <div key={i} className="bg-surface rounded-xl p-2.5 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-white">{getExerciseName(ex.exerciseId)}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{ex.sets.length} sets</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ex.sets.map((set, si) => (
                    <span key={si} className="text-[10px] bg-surface-elevated border border-border text-slate-300 px-2 py-0.5 rounded-md font-mono">
                      {set.weight}kg × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setReceiptSession(selectedSession)}
              className="w-full bg-surface-elevated hover:bg-surface-hover text-teal-400 text-xs font-semibold py-2.5 rounded-xl border border-border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Share2 size={13} />
              View Workout Summary
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions List */}
      <div className="glass-card p-4 space-y-2.5">
        <h2 className="text-xs font-semibold text-white flex items-center gap-2">
          <Clock size={13} className="text-teal-400" />
          Recent Sessions
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Dumbbell size={22} className="mx-auto text-slate-500 mb-2" />
            <p className="text-xs">No workout sessions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...history]
              .reverse()
              .slice(0, 15)
              .map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-slate-500 transition-all text-left active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                      <Dumbbell size={15} className="text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">{session.programName}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span>· {session.exercises.length} ex</span>
                        {formatDuration(session) && <span>· {formatDuration(session)}</span>}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-slate-400 group-hover:text-white shrink-0" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Biomechanical Angle Analysis Radar */}
      <AngleRadarChart />

      {/* Shareable Receipt Modal */}
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
