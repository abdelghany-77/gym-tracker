import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Clock,
  Plus,
  ChevronRight,
  X,
  Play,
  Check,
} from "lucide-react";
import { loadFromStorage, saveToStorage } from "../store/helpers";

const defaultSessions = [
  { id: "1", type: "Running", icon: "🏃", duration: 40, date: "Apr 22", intensity: "Moderate", calories: 340 },
  { id: "2", type: "Cycling", icon: "🚴", duration: 30, date: "Apr 20", intensity: "Moderate", calories: 260 },
  { id: "3", type: "Walking", icon: "🚶", duration: 45, date: "Apr 18", intensity: "Light", calories: 180 },
];

export default function Cardio() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(() =>
    loadFromStorage("gym_cardio_sessions", defaultSessions)
  );
  const [weeklyGoal, setWeeklyGoal] = useState(() =>
    loadFromStorage("gym_cardio_goal", 150)
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [newSession, setNewSession] = useState({
    type: "Running",
    duration: 30,
    intensity: "Moderate",
    calories: 250,
  });

  const totalMin = useMemo(
    () => sessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0),
    [sessions]
  );

  const remainingMin = Math.max(0, weeklyGoal - totalMin);
  const progressPercent = Math.min(100, Math.round((totalMin / weeklyGoal) * 100));

  const handleSaveSession = () => {
    const session = {
      id: Date.now().toString(),
      type: newSession.type,
      icon: newSession.type === "Running" ? "🏃" : newSession.type === "Cycling" ? "🚴" : "🚶",
      duration: Number(newSession.duration) || 30,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      intensity: newSession.intensity,
      calories: Number(newSession.calories) || 200,
    };
    const updated = [session, ...sessions];
    setSessions(updated);
    saveToStorage("gym_cardio_sessions", updated);
    setShowLogModal(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER (Matches Reference Panel 6) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Cardio</h1>

        <div className="w-10 h-10" />
      </div>

      {/* ═══ CIRCULAR PROGRESS GOAL HERO CARD (Matches Reference Panel 6) ═══ */}
      <div className="rounded-3xl bg-[#142332] border border-[#223348] p-6 text-center space-y-5 shadow-lg relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C4E58A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="transparent"
              stroke="#192C3C"
              strokeWidth="12"
            />
            {/* Active Lime Green Ring */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="transparent"
              stroke="#C4E58A"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 68}
              strokeDashoffset={2 * Math.PI * 68 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(196,229,138,0.4)]"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl select-none mb-1">🏃</span>
            <p className="text-[11px] text-[#8E9FA5] font-semibold uppercase tracking-wider">Weekly Goal</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#F1F5F7] tracking-tight">
              {totalMin} <span className="text-xs text-[#8E9FA5] font-sans font-normal">/ {weeklyGoal} min</span>
            </p>
            <p className="text-[10px] text-[#C4E58A] font-semibold mt-1 flex items-center gap-1">
              <Clock size={10} /> {remainingMin} min remaining
            </p>
          </div>
        </div>

        {/* Primary CTA Button: Log Cardio Session */}
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold text-xs sm:text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(196,229,138,0.25)]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Log Cardio Session</span>
        </button>
      </div>

      {/* ═══ RECENT SESSIONS LIST (Matches Reference Panel 6) ═══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#F1F5F7]">Recent Sessions</h3>
          <span className="text-xs font-semibold text-[#8E9FA5] hover:text-[#F1F5F7] cursor-pointer">View All</span>
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 flex items-center justify-between hover:border-[#2B4660] transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#192C3C] border border-[#223348] flex items-center justify-center text-xl shrink-0">
                  {sess.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F7]">{sess.type}</h4>
                  <p className="text-[11px] text-[#8E9FA5] mt-0.5">
                    {sess.date} • {sess.duration} min • {sess.intensity}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8E9FA5]" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ LOG CARDIO SESSION MODAL ═══ */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="bg-[#142332] rounded-3xl w-full max-w-sm border border-[#223348] p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#223348] pb-3">
              <h3 className="font-bold text-sm text-[#F1F5F7]">Log Cardio Activity</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-[#8E9FA5] hover:text-[#F1F5F7]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Running", "Cycling", "Walking"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewSession({ ...newSession, type: t })}
                      className={`py-2 rounded-xl border text-center font-bold ${
                        newSession.type === t
                          ? "bg-[#C4E58A] text-[#0D1723] border-[#C4E58A]"
                          : "bg-[#0D1723] text-[#8E9FA5] border-[#223348]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-3 text-[#F1F5F7] font-bold text-center font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Intensity</label>
                <select
                  value={newSession.intensity}
                  onChange={(e) => setNewSession({ ...newSession, intensity: e.target.value })}
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7]"
                >
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High (HIIT)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSession}
              className="w-full py-3 bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold rounded-xl text-xs transition-all active:scale-95"
            >
              Save Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

