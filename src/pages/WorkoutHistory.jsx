import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  ArrowLeft,
  X,
  Share2,
  PieChart,
  List,
  Search,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import AngleRadarChart from "../components/AngleRadarChart";
import ExerciseProgressionChart from "../components/ExerciseProgressionChart";
import { parseLocalDate } from "../utils/dateUtils";

function getSessionVolume(session) {
  return Math.round(
    (session.exercises || []).reduce(
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

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);

  const [activeTab, setActiveTab] = useState("sessions"); // "sessions" | "progression" | "calendar" | "angles"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [receiptSession, setReceiptSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  const exerciseById = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises],
  );

  const getExerciseName = (id) => exerciseById.get(id)?.name || id;

  // Map date -> count of PRs achieved on that date
  const prsByDate = useMemo(() => {
    const map = {};
    for (const pr of Object.values(personalRecords || {})) {
      if (pr?.date) {
        map[pr.date] = (map[pr.date] || 0) + 1;
      }
    }
    return map;
  }, [personalRecords]);

  // Unique program names for filter dropdown
  const programNames = useMemo(() => {
    const set = new Set();
    for (const s of history) {
      if (s.programName) set.add(s.programName);
    }
    return Array.from(set).sort();
  }, [history]);

  // Filtered sessions (newest first)
  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...history].reverse().filter((session) => {
      if (programFilter !== "all" && session.programName !== programFilter) {
        return false;
      }
      if (!q) return true;
      if (session.programName?.toLowerCase().includes(q)) return true;
      return (session.exercises || []).some((ex) =>
        getExerciseName(ex.exerciseId).toLowerCase().includes(q),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, searchQuery, programFilter, exerciseById]);

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

  const selectedDaySessions = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return history.filter((s) => s.date === selectedCalendarDate);
  }, [history, selectedCalendarDate]);

  const prevMonth = () => {
    setSelectedCalendarDate(null);
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };
  const nextMonth = () => {
    setSelectedCalendarDate(null);
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const formatDuration = (s) => {
    if (!s.startedAt || !s.finishedAt) return null;
    const ms = new Date(s.finishedAt) - new Date(s.startedAt);
    const mins = Math.round(ms / 60000);
    return mins > 0 ? `${mins}m` : "<1m";
  };

  const totalSessions = history.length;
  const totalSets = history.reduce(
    (acc, s) =>
      acc + (s.exercises || []).reduce((a, e) => a + (e.sets || []).length, 0),
    0,
  );
  const totalVolume = useMemo(
    () => history.reduce((acc, s) => acc + getSessionVolume(s), 0),
    [history],
  );

  return (
    <div className="px-4 pt-4 pb-24 max-w-3xl mx-auto space-y-4 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="min-w-11 min-h-11 rounded-xl bg-bg-surface border border-slate-800 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-colors text-slate-300"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Progress &amp; History
            </h1>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              {totalSessions} sessions · {totalSets} sets
              {totalVolume > 0
                ? ` · ${Math.round(totalVolume / 1000).toLocaleString()}t vol`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── 4-Tab Segmented Selector ── */}
      <div className="grid grid-cols-4 bg-bg-surface p-1 rounded-xl border border-slate-800 gap-1">
        {[
          { id: "sessions", label: "Sessions", icon: List },
          { id: "progression", label: "Strength", icon: TrendingUp },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "angles", label: "Angles", icon: PieChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 px-1.5 sm:px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={13} className="shrink-0" />
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SESSIONS LIST ── */}
      {activeTab === "sessions" && (
        <div className="space-y-3 animate-fadeIn">
          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by workout or exercise..."
                  aria-label="Search workout history"
                  className="min-h-11 w-full rounded-xl border border-slate-800 bg-bg-surface pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                />
              </div>
              {programNames.length > 1 && (
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  aria-label="Filter by workout program"
                  className="min-h-11 rounded-xl border border-slate-800 bg-bg-surface px-3 text-xs font-medium text-slate-200 focus:border-slate-500 focus:outline-none"
                >
                  <option value="all">All workouts</option>
                  {programNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-bg-surface border border-dashed border-slate-800">
              <Dumbbell size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-200 font-semibold">
                No workouts yet
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete your first workout to see records and receipts here.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-bg-surface border border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-slate-200">
                No matching sessions
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setProgramFilter("all");
                }}
                className="text-xs text-sky-400 hover:underline font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSessions.map((session) => {
                const volume = getSessionVolume(session);
                const setsCount = (session.exercises || []).reduce(
                  (acc, e) => acc + (e.sets || []).length,
                  0,
                );
                const prCount = prsByDate[session.date] || 0;
                const duration = formatDuration(session);
                return (
                  <div
                    key={session.id}
                    className="bg-bg-surface p-3.5 border border-slate-800 hover:border-slate-700 transition-colors rounded-2xl"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-bg-deep border border-slate-800 flex items-center justify-center shrink-0">
                          <Dumbbell size={16} className="text-slate-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">
                              {session.programName}
                            </p>
                            {prCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 shrink-0">
                                <Trophy size={11} aria-hidden="true" />
                                {prCount} PR
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                            <span>
                              {parseLocalDate(session.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {(session.exercises || []).length} exercises
                            </span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {setsCount} sets
                            </span>
                            {volume > 0 && (
                              <>
                                <span>·</span>
                                <span className="font-mono tabular-nums text-slate-300">
                                  {volume.toLocaleString()} kg
                                </span>
                              </>
                            )}
                            {duration && (
                              <>
                                <span>·</span>
                                <span className="font-mono tabular-nums">
                                  {duration}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="min-h-10 px-3 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setReceiptSession(session)}
                          className="min-w-10 min-h-10 rounded-xl bg-bg-deep border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center justify-center"
                          title="View Receipt"
                          aria-label="View Receipt"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: STRENGTH PROGRESSION CHART ── */}
      {activeTab === "progression" && (
        <div className="animate-fadeIn">
          <ExerciseProgressionChart />
        </div>
      )}

      {/* ── TAB 3: CALENDAR VIEW ── */}
      {activeTab === "calendar" && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-bg-surface p-4 border border-slate-800 rounded-2xl">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3.5">
              <button
                onClick={prevMonth}
                className="min-w-10 min-h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-white">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={nextMonth}
                className="min-w-10 min-h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-[11px] text-slate-500 text-center font-medium"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarData.map((cell, i) =>
                cell === null ? (
                  <div key={`empty-${i}`} className="aspect-square" />
                ) : (
                  <button
                    key={cell.date}
                    onClick={() => {
                      if (cell.sessions.length === 1) {
                        setSelectedCalendarDate(null);
                        setSelectedSession(cell.sessions[0]);
                      } else if (cell.sessions.length > 1) {
                        setSelectedCalendarDate(cell.date);
                      }
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-mono tabular-nums transition-colors relative ${
                      selectedCalendarDate === cell.date
                        ? "bg-slate-100 text-slate-950 font-bold"
                        : cell.sessions.length > 0
                          ? "bg-sky-500/15 text-sky-300 font-bold hover:bg-sky-500/25 cursor-pointer border border-sky-400/30"
                          : cell.isToday
                            ? "bg-slate-800 text-white font-semibold ring-1 ring-slate-500"
                            : "text-slate-500 hover:bg-slate-800/40"
                    }`}
                    disabled={cell.sessions.length === 0}
                    aria-label={`${cell.date}${cell.sessions.length > 0 ? `, ${cell.sessions.length} workout(s)` : ""}`}
                  >
                    <span>{cell.day}</span>
                    {cell.sessions.length > 0 && (
                      <div className="absolute bottom-1 flex items-center gap-0.5">
                        {cell.sessions.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              selectedCalendarDate === cell.date
                                ? "bg-slate-950"
                                : "bg-sky-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Multi-session day picker */}
          {selectedCalendarDate && selectedDaySessions.length > 0 && (
            <div className="bg-bg-surface p-4 border border-slate-800 rounded-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">
                  {parseLocalDate(selectedCalendarDate).toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" },
                  )}{" "}
                  · {selectedDaySessions.length} sessions
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              <div className="space-y-2">
                {selectedDaySessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className="w-full min-h-11 flex items-center justify-between rounded-xl border border-slate-800 bg-bg-deep px-3.5 py-2.5 text-left hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {session.programName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {(session.exercises || []).length} exercises ·{" "}
                        {getSessionVolume(session).toLocaleString()} kg
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: BIOMECHANICAL ANGLES ── */}
      {activeTab === "angles" && (
        <div className="space-y-3 animate-fadeIn">
          <AngleRadarChart />
        </div>
      )}

      {/* ── Selected Session Modal ── */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-bg-surface rounded-2xl w-full max-w-md border border-slate-700 overflow-hidden shadow-2xl p-4 space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {selectedSession.programName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {parseLocalDate(selectedSession.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                  {formatDuration(selectedSession) &&
                    ` · ${formatDuration(selectedSession)}`}
                  {getSessionVolume(selectedSession) > 0 &&
                    ` · ${getSessionVolume(selectedSession).toLocaleString()} kg`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                aria-label="Close session details"
                className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Exercises List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {(selectedSession.exercises || []).map((ex, i) => (
                <div
                  key={i}
                  className="bg-bg-deep rounded-xl p-3 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-white">
                      {getExerciseName(ex.exerciseId)}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {(ex.sets || []).length} sets
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(ex.sets || []).map((set, si) => (
                      <span
                        key={si}
                        className="text-[11px] bg-bg-surface text-slate-200 px-2 py-0.5 rounded-md border border-slate-800 font-mono tabular-nums"
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
              className="w-full min-h-11 bg-slate-100 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-white transition-colors"
            >
              <Share2 size={14} />
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
