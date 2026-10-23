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
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* ── Header: User Avatar & Name ── */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-lg font-bold text-teal-400 shrink-0">
          {userProfile.name ? (
            userProfile.name.charAt(0).toUpperCase()
          ) : (
            <User size={20} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={userProfile.name || ""}
            onChange={(e) => updateUserProfile({ name: e.target.value })}
            placeholder="Athlete Name"
            className="text-base font-bold text-white bg-transparent border-none outline-none placeholder-slate-500 w-full focus:placeholder-slate-400 tracking-tight"
          />
          <p className="text-[11px] text-slate-400">
            {history.length} completed sessions · {Object.keys(personalRecords).length} personal records
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex bg-surface-elevated p-1 rounded-xl border border-border">
        {[
          { id: "overview", label: "Overview" },
          { id: "inbody", label: "InBody" },
          { id: "progress", label: "Goals" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-teal-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Contents ── */}
      <div className="animate-fadeIn">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-3.5">
            {/* User Stats Card */}
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-xs font-semibold text-white">Body Statistics</h2>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.weight || ""}
                    onChange={(e) => updateUserProfile({ weight: Number(e.target.value) })}
                    placeholder="—"
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 text-xs border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Height (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userProfile.height || ""}
                    onChange={(e) => updateUserProfile({ height: Number(e.target.value) })}
                    placeholder="—"
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 text-xs border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={userProfile.age || ""}
                    onChange={(e) => updateUserProfile({ age: Number(e.target.value) })}
                    placeholder="—"
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 text-xs border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors"
                  />
                </div>
              </div>

              {bmi && (
                <div className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Body Mass Index (BMI)</p>
                    <p className={`text-base font-bold ${bmi.color}`}>{bmi.value}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${bmi.color} bg-surface-elevated border border-border`}>
                    {bmi.category}
                  </span>
                </div>
              )}
            </div>

            {/* Weekly Consistency Trend */}
            <div className="glass-card p-4 space-y-2.5">
              <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Activity size={13} className="text-teal-400" />
                8-Week Frequency Trend
              </h2>
              <div className="flex items-end justify-between gap-1.5 h-20 pt-1">
                {weeklyTrend.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: "54px" }}>
                      <div
                        className={`w-full max-w-[20px] rounded-t-md transition-all duration-500 ${
                          week.count > 0 ? "bg-teal-400" : "bg-surface-elevated"
                        }`}
                        style={{ height: `${Math.max(4, (week.count / maxTrend) * 54)}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{week.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Training Summary Numbers */}
            <div className="glass-card p-4 space-y-2">
              <h2 className="text-xs font-semibold text-white">All-Time Totals</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-surface rounded-xl p-3 border border-border">
                  <p className="text-xl font-bold text-white">{history.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Workouts Completed</p>
                </div>
                <div className="bg-surface rounded-xl p-3 border border-border">
                  <p className="text-xl font-bold text-teal-400">
                    {history.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Total Sets Logged</p>
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

        {/* GOALS / PROGRESS TAB */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <ScheduleEditor />
            <PersonalRecordsTab />
            <AchievementsList />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-3.5">
            {/* Program Selector */}
            <div className="glass-card p-4">
              <ProgramSelector />
            </div>

            {/* Theme Toggle */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon size={15} className="text-teal-400" /> : <Sun size={15} className="text-amber-400" />}
                  <div>
                    <h2 className="text-xs font-semibold text-white">Color Mode</h2>
                    <p className="text-[10px] text-slate-400">Dark / Light appearance</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 border border-border ${
                    theme === "light" ? "bg-amber-400" : "bg-surface-elevated"
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      theme === "light" ? "left-[22px]" : "left-1"
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
