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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);

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
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Workout History</h1>
          <p className="text-[11px] text-slate-500">
            {totalSessions} sessions · {totalSets} total sets
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 border border-slate-800">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-white">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-[10px] text-slate-500 text-center font-medium"
            >
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
                    ? "bg-neon-blue/15 text-neon-blue font-bold hover:bg-neon-blue/25 cursor-pointer"
                    : cell.isToday
                      ? "bg-slate-800 text-white font-medium ring-1 ring-neon-blue/40"
                      : "text-slate-500 hover:bg-slate-800/50"
                }`}
                disabled={cell.sessions.length === 0}
                aria-label={`${cell.date}${cell.sessions.length > 0 ? `, ${cell.sessions.length} workout(s)` : ""}`}
              >
                <span>{cell.day}</span>
                {cell.sessions.length > 0 && (
                  <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-neon-blue" />
                )}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Selected Session Detail */}
      {selectedSession && (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {selectedSession.programName}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <Calendar size={10} />
                {new Date(selectedSession.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                {formatDuration(selectedSession) && (
                  <>
                    <Clock size={10} />
                    {formatDuration(selectedSession)}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close details"
            >
              <X size={14} />
            </button>
          </div>

          {/* Exercises in that session */}
          <div className="space-y-2">
            {selectedSession.exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">
                    {getExerciseName(ex.exerciseId)}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {ex.sets.length} sets
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((set, si) => (
                    <span
                      key={si}
                      className="text-[10px] bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600/50"
                    >
                      {set.weight}kg × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
              <Dumbbell size={14} className="text-neon-blue mx-auto mb-1" />
              <p className="text-sm font-bold text-white">
                {selectedSession.exercises.length}
              </p>
              <p className="text-[10px] text-slate-500">Exercises</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
              <TrendingUp size={14} className="text-neon-green mx-auto mb-1" />
              <p className="text-sm font-bold text-white">
                {selectedSession.exercises.reduce(
                  (acc, e) => acc + e.sets.length,
                  0,
                )}
              </p>
              <p className="text-[10px] text-slate-500">Total Sets</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions List */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          Recent Sessions
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell size={22} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">No workouts yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...history]
              .reverse()
              .slice(0, 10)
              .map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                      <Dumbbell size={16} className="text-neon-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {session.programName}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span>
                          · {session.exercises.length} exercises
                        </span>
                        {formatDuration(session) && (
                          <span>· {formatDuration(session)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 shrink-0"
                  />
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
