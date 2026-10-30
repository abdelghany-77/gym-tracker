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
  PieChart,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import AngleRadarChart from "../components/AngleRadarChart";

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [activeTab, setActiveTab] = useState("sessions"); // "sessions" | "calendar" | "angles"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [receiptSession, setReceiptSession] = useState(null);

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
    <div className="page-shell pt-4 pb-24 space-y-3.5 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all text-slate-300"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Progress & History
            </h1>
            <p className="text-[11px] text-slate-400">
              {totalSessions} sessions · {totalSets} logged sets
            </p>
          </div>
        </div>
      </div>

      {/* ── Segmented Tab Selector (Prevents Endless Scrolling) ── */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        {[
          { id: "sessions", label: "Sessions", icon: List },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "angles", label: "Muscle Angles", icon: PieChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 flex-1 py-1.5 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                isActive
                  ? "bg-neon-cyan text-bg-deep shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SESSIONS LIST (FOCUSED & SCROLL-EFFICIENT) ── */}
      {activeTab === "sessions" && (
        <div className="space-y-2.5 animate-fadeIn">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl glass-card border-dashed">
              <Dumbbell size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-300 font-medium">No workouts yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your first workout to see records and receipts here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...history]
                .reverse()
                .map((session) => (
                  <div
                    key={session.id}
                    className="glass-card p-3 border border-border-slate hover:border-slate-700 transition-all rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0">
                          <Dumbbell size={15} className="text-neon-blue" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {session.programName}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span>
                              {new Date(session.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span>{session.exercises.length} exercises</span>
                            {formatDuration(session) && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(session)}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setReceiptSession(session)}
                          className="p-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
                          title="View Receipt"
                          aria-label="View Receipt"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CALENDAR VIEW ── */}
      {activeTab === "calendar" && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="glass-card p-3.5 border border-border-slate rounded-2xl">
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
            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-[9px] text-slate-500 text-center font-semibold"
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
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-all relative ${
                      cell.sessions.length > 0
                        ? "bg-neon-cyan/20 text-neon-cyan font-bold hover:bg-neon-cyan/30 cursor-pointer"
                        : cell.isToday
                          ? "bg-slate-800 text-white font-medium ring-1 ring-neon-cyan/50"
                          : "text-slate-500 hover:bg-slate-800/40"
                    }`}
                    disabled={cell.sessions.length === 0}
                    aria-label={`${cell.date}${cell.sessions.length > 0 ? `, ${cell.sessions.length} workout(s)` : ""}`}
                  >
                    <span>{cell.day}</span>
                    {cell.sessions.length > 0 && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: BIOMECHANICAL ANGLES ── */}
      {activeTab === "angles" && (
        <div className="space-y-3 animate-fadeIn">
          <AngleRadarChart />
        </div>
      )}

      {/* ── Selected Session Modal ── */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-700 overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {selectedSession.programName}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {new Date(selectedSession.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {formatDuration(selectedSession) && ` • ${formatDuration(selectedSession)}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Exercises List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {selectedSession.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-white">
                      {getExerciseName(ex.exerciseId)}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ex.sets.length} sets
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ex.sets.map((set, si) => (
                      <span
                        key={si}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50 font-mono"
                      >
                        {set.weight}kg × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const s = selectedSession;
                setSelectedSession(null);
                setReceiptSession(s);
              }}
              className="w-full bg-neon-cyan text-bg-deep text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] btn-press"
            >
              <Share2 size={13} />
              View Workout Receipt
            </button>
          </div>
        </div>
      )}

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
