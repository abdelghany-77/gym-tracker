import { useState, useMemo } from "react";
import { User, Activity, Sun, Moon } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ReminderSettings from "../components/ReminderSettings";
import ScheduleEditor from "../components/ScheduleEditor";
import AchievementsList from "../components/profile/AchievementsList";
import PersonalRecordsTab from "../components/profile/PersonalRecordsTab";
import DataManagement from "../components/profile/DataManagement";
import BodyMeasurementsTab from "../components/profile/BodyMeasurementsTab";
import ProgramSelector from "../components/ProgramSelector";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bmi = useMemo(() => getBMI(), [getBMI, userProfile.weight, userProfile.height]);
  const maxTrend = Math.max(...weeklyTrend.map((w) => w.count), 1);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* ── Header: User Avatar & Greeting ── */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-border-slate flex items-center justify-center text-xl font-bold text-accent shrink-0">
          {userProfile.name ? (
            userProfile.name.charAt(0).toUpperCase()
          ) : (
            <User size={24} className="text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={userProfile.name || ""}
            onChange={(e) => updateUserProfile({ name: e.target.value })}
            placeholder="Your Name"
            className="text-lg font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 w-full focus:placeholder-slate-500"
          />
          <p className="text-[10px] text-slate-500">
            {history.length} workouts • {Object.keys(personalRecords).length} PRs
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex bg-bg-card p-0.5 rounded-lg border border-border-slate">
        {[
          { id: "overview", label: "Overview" },
          { id: "inbody", label: "InBody" },
          { id: "progress", label: "Progress" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-slate-700 text-accent"
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
          <div className="space-y-4">
            {/* User Stats */}
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-xs font-semibold text-white">Your Stats</h2>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.weight || ""}
                    onChange={(e) => updateUserProfile({ weight: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-bg-card text-white rounded-lg px-2.5 py-2 text-sm border border-border-slate focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.height || ""}
                    onChange={(e) => updateUserProfile({ height: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-bg-card text-white rounded-lg px-2.5 py-2 text-sm border border-border-slate focus:border-neon-emerald focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={userProfile.age || ""}
                    onChange={(e) => updateUserProfile({ age: Number(e.target.value) })}
                    placeholder="24"
                    className="w-full bg-bg-card text-white rounded-lg px-2.5 py-2 text-sm border border-border-slate focus:border-vivid-purple focus:outline-none focus:ring-1 focus:ring-vivid-purple/30 transition-colors"
                  />
                </div>
              </div>

              {bmi && (
                <div className="flex items-center justify-between bg-bg-card rounded-lg p-2.5 border border-border-slate">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">BMI</p>
                    <p className={`text-base font-bold ${bmi.color}`}>{bmi.value}</p>
                  </div>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${bmi.color} bg-white/5`}>
                    {bmi.category}
                  </span>
                </div>
              )}
            </div>

            {/* Weekly Trend Chart */}
            <div className="glass-card p-4 space-y-2">
              <h2 className="text-xs font-semibold text-white flex items-center gap-2">
                <Activity size={12} className="text-accent" />
                Weekly Trend
              </h2>
              <div className="flex items-end justify-between gap-1.5 h-20">
                {weeklyTrend.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex items-end justify-center" style={{ height: "60px" }}>
                      <div
                        className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${
                          week.count > 0 ? "bg-gradient-to-t from-accent/40 to-accent/80" : "bg-slate-800"
                        }`}
                        style={{ height: `${Math.max(4, (week.count / maxTrend) * 60)}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">{week.label}</span>
                    {week.count > 0 && <span className="text-[9px] text-accent font-bold">{week.count}</span>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Training Summary */}
            <div className="glass-card p-4 space-y-2">
              <h2 className="text-xs font-semibold text-white">Training Summary</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-accent">{history.length}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Sessions</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-neon-emerald">
                    {history.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Sets</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INBODY TAB */}
        {activeTab === "inbody" && (
          <div className="space-y-4">
            <BodyMeasurementsTab />
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <ScheduleEditor />
            <PersonalRecordsTab />
            <AchievementsList />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* Program Selector */}
            <div className="glass-card p-4">
              <ProgramSelector />
            </div>

            {/* Theme Toggle */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-amber-400" />}
                  <h2 className="text-xs font-semibold text-white">Appearance</h2>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                    theme === "light" ? "bg-amber-400" : "bg-slate-700"
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
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
