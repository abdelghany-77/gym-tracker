import { useState, useMemo } from "react";
import { User, Activity, Sun, Moon } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ReminderSettings from "../components/ReminderSettings";
import ScheduleEditor from "../components/ScheduleEditor";
import AchievementsList from "../components/profile/AchievementsList";
import PersonalRecordsTab from "../components/profile/PersonalRecordsTab";
import DataManagement from "../components/profile/DataManagement";
import BodyMeasurementsTab from "../components/profile/BodyMeasurementsTab";

export default function Profile() {
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const userProfile = useWorkoutStore((s) => s.userProfile);
  const updateUserProfile = useWorkoutStore((s) => s.updateUserProfile);
  const getWeeklyTrend = useWorkoutStore((s) => s.getWeeklyTrend);
  const getBMI = useWorkoutStore((s) => s.getBMI);
  const theme = useWorkoutStore((s) => s.theme);
  const toggleTheme = useWorkoutStore((s) => s.toggleTheme);

  const [activeTab, setActiveTab] = useState("overview");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weeklyTrend = useMemo(() => getWeeklyTrend(), [getWeeklyTrend, history]);
  const bmi = useMemo(() => getBMI(), [getBMI, userProfile.weight, userProfile.height]);
  const maxTrend = Math.max(...weeklyTrend.map((w) => w.count), 1);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* ── Header: User Avatar & Greeting ── */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-slate-700 flex items-center justify-center text-2xl font-bold text-neon-blue shrink-0">
          {userProfile.name ? (
            userProfile.name.charAt(0).toUpperCase()
          ) : (
            <User size={28} className="text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={userProfile.name || ""}
            onChange={(e) => updateUserProfile({ name: e.target.value })}
            placeholder="Your Name"
            className="text-xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 w-full focus:placeholder-slate-500"
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            {history.length} workouts • {Object.keys(personalRecords).length} PRs
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {[
          { id: "overview", label: "Overview" },
          { id: "progress", label: "Progress" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-slate-800 text-neon-blue shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Contents ── */}
      <div className="animate-slideUp">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* User Stats */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Your Stats</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.weight || ""}
                    onChange={(e) => updateUserProfile({ weight: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.height || ""}
                    onChange={(e) => updateUserProfile({ height: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={userProfile.age || ""}
                    onChange={(e) => updateUserProfile({ age: Number(e.target.value) })}
                    placeholder="24"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/30 transition-colors"
                  />
                </div>
              </div>

              {bmi && (
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">BMI</p>
                    <p className={`text-lg font-bold ${bmi.color}`}>{bmi.value}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bmi.color} bg-white/5`}>
                    {bmi.category}
                  </span>
                </div>
              )}
            </div>

            {/* Weekly Trend Chart */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity size={14} className="text-neon-blue" />
                Weekly Trend
              </h2>
              <div className="flex items-end justify-between gap-2 h-24">
                {weeklyTrend.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                      <div
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                          week.count > 0 ? "bg-gradient-to-t from-neon-blue/40 to-neon-blue/80" : "bg-slate-800"
                        }`}
                        style={{ height: `${Math.max(4, (week.count / maxTrend) * 72)}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{week.label}</span>
                    {week.count > 0 && <span className="text-[10px] text-neon-blue font-bold">{week.count}</span>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-white">Training Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-neon-blue">{history.length}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Total Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-green">
                    {history.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0)}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Total Sets</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <div className="space-y-5">
            <ScheduleEditor />
            <BodyMeasurementsTab />
            <PersonalRecordsTab />
            <AchievementsList />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-5">
            {/* Theme Toggle */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon size={14} className="text-neon-blue" /> : <Sun size={14} className="text-amber-400" />}
                  <h2 className="text-sm font-semibold text-white">Appearance</h2>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    theme === "light" ? "bg-amber-400 shadow-md shadow-amber-400/30" : "bg-slate-700"
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      theme === "light" ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <ReminderSettings />
            <DataManagement />
          </div>
        )}
      </div>

    </div>
  );
}
