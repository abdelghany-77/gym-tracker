import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  TrendingUp,
  ArrowLeft,
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
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"

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
          <h1 className="text-xl font-bold text-white">Progress</h1>
          <p className="text-[10px] text-slate-500">
            {totalSessions} sessions · {totalSets} total sets
          </p>
        </div>
        {/* View mode toggle */}
        <div className="flex bg-bg-card rounded-lg p-0.5 border border-border-slate">
          <button
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === "calendar" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="glass-card p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-xs font-bold text-white">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="text-[9px] text-slate-600 text-center font-medium">
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
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-[11px] transition-all relative ${
                    cell.sessions.length > 0
                      ? "bg-accent/12 text-accent font-bold hover:bg-accent/20 cursor-pointer"
                      : cell.isToday
                        ? "bg-bg-card text-white font-medium ring-1 ring-accent/30"
                        : "text-slate-500 hover:bg-bg-card"
                  }`}
                  disabled={cell.sessions.length === 0}
                  aria-label={`${cell.date}${cell.sessions.length > 0 ? `, ${cell.sessions.length} workout(s)` : ""}`}
                >
                  <span>{cell.day}</span>
                  {cell.sessions.length > 0 && (
                    <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Selected Session Detail */}
      {selectedSession && (
        <div className="glass-card p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedSession.programName}</h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-2">
                <Calendar size={9} />
                {new Date(selectedSession.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                {formatDuration(selectedSession) && (
                  <>
                    <Clock size={9} />
                    {formatDuration(selectedSession)}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close details"
            >
              <X size={12} />
            </button>
          </div>

          {/* Exercises in that session */}
          <div className="space-y-1.5">
            {selectedSession.exercises.map((ex, i) => (
              <div key={i} className="bg-bg-card rounded-lg p-2.5 border border-border-slate">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-white">{getExerciseName(ex.exerciseId)}</p>
                  <span className="text-[9px] text-slate-500">{ex.sets.length} sets</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ex.sets.map((set, si) => (
                    <span key={si} className="text-[9px] bg-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded-full">
                      {set.weight}kg × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-card rounded-lg p-2.5 text-center border border-border-slate">
              <Dumbbell size={12} className="text-accent mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{selectedSession.exercises.length}</p>
              <p className="text-[9px] text-slate-500">Exercises</p>
            </div>
            <div className="bg-bg-card rounded-lg p-2.5 text-center border border-border-slate">
              <TrendingUp size={12} className="text-neon-emerald mx-auto mb-1" />
              <p className="text-sm font-bold text-white">
                {selectedSession.exercises.reduce((acc, e) => acc + e.sets.length, 0)}
              </p>
              <p className="text-[9px] text-slate-500">Total Sets</p>
            </div>
          </div>

          <button
            onClick={() => setReceiptSession(selectedSession)}
            className="w-full bg-bg-card hover:bg-slate-700 text-accent text-[11px] font-semibold py-2 rounded-lg border border-accent/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Share2 size={11} />
            View Receipt
          </button>
        </div>
      )}

      {/* Recent Sessions List — primary view */}
      <div className="glass-card p-4 space-y-2.5">
        <h2 className="text-xs font-semibold text-white flex items-center gap-2">
          <Clock size={13} className="text-slate-400" />
          Recent Sessions
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell size={20} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">No workouts yet</p>
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
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-bg-card border border-border-slate hover:border-slate-600 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-accent/8 flex items-center justify-center">
                      <Dumbbell size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{session.programName}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span>· {session.exercises.length} ex</span>
                        {formatDuration(session) && <span>· {formatDuration(session)}</span>}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 shrink-0" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Biomechanical Angle Analysis */}
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
