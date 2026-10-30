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
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import WorkoutReceiptModal from "../components/WorkoutReceiptModal";
import AngleRadarChart from "../components/AngleRadarChart";

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const personalRecords = useWorkoutStore((s) => s.personalRecords) || {};
  const [activeTab, setActiveTab] = useState("progress"); // "progress" | "history"
  const [timeRange, setTimeRange] = useState("7D"); // "7D" | "30D" | "All"
  const [selectedSession, setSelectedSession] = useState(null);
  const [receiptSession, setReceiptSession] = useState(null);

  // PR records
  const benchPr = personalRecords["chest_bb_flat_bench"] || personalRecords["chest_barbell_bench"] || 100;
  const squatPr = personalRecords["leg_bb_back_squat"] || personalRecords["leg_squat"] || 120;
  const deadliftPr = personalRecords["leg_bb_rdl"] || personalRecords["leg_rdl"] || 140;

  // Weekly bar data
  const weekBarData = [
    { day: "Mon", height: "65%", active: true },
    { day: "Tue", height: "85%", active: true },
    { day: "Wed", height: "40%", active: true },
    { day: "Thu", height: "90%", active: true },
    { day: "Fri", height: "70%", active: true },
    { day: "Sat", height: "15%", active: false },
    { day: "Sun", height: "10%", active: false },
  ];

  // Recent workout sessions (using actual history or realistic reference defaults)
  const displaySessions = useMemo(() => {
    if (history.length > 0) {
      return [...history].reverse();
    }
    return [
      { id: "1", programName: "Upper Body Strength", date: "2026-04-24", duration: "45 min", exercises: Array(6).fill({}) },
      { id: "2", programName: "Push Day", date: "2026-04-22", duration: "50 min", exercises: Array(7).fill({}) },
      { id: "3", programName: "Leg Day", date: "2026-04-20", duration: "48 min", exercises: Array(6).fill({}) },
    ];
  }, [history]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER & SEGMENTED TABS (Matches Reference Panel 8) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Tab Switcher: [ Progress ] | [ History ] */}
        <div className="grid grid-cols-2 gap-1 bg-[#142332] p-1 rounded-2xl border border-[#223348] min-w-[200px]">
          <button
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === "progress"
                ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
                : "text-[#8E9FA5] hover:text-[#F1F5F7]"
            }`}
          >
            Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === "history"
                ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
                : "text-[#8E9FA5] hover:text-[#F1F5F7]"
            }`}
          >
            History
          </button>
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* ═══ TIME-RANGE CHIPS (Matches Reference Panel 8) ═══ */}
      <div className="flex items-center gap-2">
        {["7D", "30D", "All"].map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              timeRange === range
                ? "bg-[#C4E58A] text-[#0D1723] font-bold border-[#C4E58A] shadow-[0_0_10px_rgba(196,229,138,0.3)]"
                : "bg-[#142332] text-[#8E9FA5] border-[#223348] hover:text-[#F1F5F7]"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {activeTab === "progress" ? (
        <>
          {/* ═══ WEEKLY WORKOUT SUMMARY BAR CHART (Matches Reference Panel 8) ═══ */}
          <div className="rounded-3xl bg-[#142332] border border-[#223348] p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#F1F5F7]">Weekly Workout Summary</h2>
              <span className="text-xs font-bold text-[#C4E58A]">5 workouts</span>
            </div>

            {/* Mon-Sun Bar Chart Columns */}
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
              {weekBarData.map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center rounded-xl bg-[#192C3C] p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-700 ${
                        bar.active
                          ? "bg-gradient-to-t from-[#73C8B4] to-[#C4E58A] shadow-[0_0_10px_rgba(115,200,180,0.3)]"
                          : "bg-[#223348]"
                      }`}
                      style={{ height: bar.height }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#8E9FA5]">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ PERSONAL RECORDS ROW (Matches Reference Panel 8) ═══ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#F1F5F7]">Personal Records</h2>
              <span className="text-xs font-semibold text-[#8E9FA5] hover:text-[#F1F5F7] cursor-pointer">View All</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Bench Press */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3 text-center space-y-1">
                <p className="text-[10px] text-[#8E9FA5] font-medium truncate">Bench Press</p>
                <p className="text-base sm:text-lg font-bold font-mono text-[#F1F5F7]">{benchPr} <span className="text-[10px] text-[#8E9FA5]">kg</span></p>
              </div>

              {/* Squat */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3 text-center space-y-1">
                <p className="text-[10px] text-[#8E9FA5] font-medium truncate">Squat</p>
                <p className="text-base sm:text-lg font-bold font-mono text-[#F1F5F7]">{squatPr} <span className="text-[10px] text-[#8E9FA5]">kg</span></p>
              </div>

              {/* Deadlift */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3 text-center space-y-1">
                <p className="text-[10px] text-[#8E9FA5] font-medium truncate">Deadlift</p>
                <p className="text-base sm:text-lg font-bold font-mono text-[#F1F5F7]">{deadliftPr} <span className="text-[10px] text-[#8E9FA5]">kg</span></p>
              </div>
            </div>
          </div>

          {/* ═══ RECENT WORKOUTS LIST (Matches Reference Panel 8) ═══ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#F1F5F7]">Recent Workouts</h2>
              <span className="text-xs font-semibold text-[#8E9FA5] hover:text-[#F1F5F7] cursor-pointer">View All</span>
            </div>

            <div className="space-y-2">
              {displaySessions.map((sess) => {
                const exCount = sess.exercises?.length || 6;
                const formattedDate = new Date(sess.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={sess.id}
                    onClick={() => setReceiptSession(sess)}
                    className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 flex items-center justify-between hover:border-[#2B4660] cursor-pointer transition-all active:scale-[0.99] shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center shrink-0 p-1">
                        <img
                          src="/exercises/chest_bb_flat_bench.png"
                          alt="Session"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#F1F5F7] truncate">{sess.programName}</h3>
                        <p className="text-[11px] text-[#8E9FA5] truncate mt-0.5">
                          {formattedDate} • {sess.duration || "45 min"} • {exCount} exercises
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8E9FA5] shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* ═══ DETAILED SESSIONS / HISTORY TAB ═══ */
        <div className="space-y-3">
          <AngleRadarChart />

          <div className="space-y-2 pt-2">
            {displaySessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => setReceiptSession(sess)}
                className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 flex items-center justify-between hover:border-[#2B4660] cursor-pointer transition-all"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#F1F5F7]">{sess.programName}</h3>
                  <p className="text-[11px] text-[#8E9FA5] mt-0.5">
                    {new Date(sess.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C4E58A] font-bold">View Receipt</span>
                  <ChevronRight size={16} className="text-[#8E9FA5]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
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
