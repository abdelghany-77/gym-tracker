import { useState } from "react";
import { User, Activity, Sun, Moon, Flame, Check } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { calculateMacros } from "../store/nutritionSlice";
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
  const updateNutritionTargets = useWorkoutStore(
    (s) => s.updateNutritionTargets,
  );
  const getWeeklyTrend = useWorkoutStore((s) => s.getWeeklyTrend);
  const getBMI = useWorkoutStore((s) => s.getBMI);
  const getSuggestedCalories = useWorkoutStore((s) => s.getSuggestedCalories);
  const theme = useWorkoutStore((s) => s.theme);
  const toggleTheme = useWorkoutStore((s) => s.toggleTheme);

  const [activeTab, setActiveTab] = useState("overview");
  const [appliedTargets, setAppliedTargets] = useState(false);

  const weeklyTrend = getWeeklyTrend() || [];
  const bmi = getBMI();
  const suggestedEnergy = getSuggestedCalories?.() || null;
  const suggestedMacros = suggestedEnergy ? calculateMacros(userProfile) : null;
  const maxTrend = Math.max(...weeklyTrend.map((w) => w.count), 1);

  const handleApplyTargets = () => {
    if (!suggestedMacros) return;
    updateNutritionTargets(suggestedMacros);
    setAppliedTargets(true);
    setTimeout(() => setAppliedTargets(false), 2000);
  };

  return (
    <div className="px-4 pt-5 pb-24 max-w-3xl mx-auto space-y-5 animate-fadeIn">
      {/* ── Header: User Avatar & Greeting ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-slate-800 flex items-center justify-center text-xl font-bold text-slate-100 shrink-0">
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
            aria-label="Your Name"
            className="text-xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 w-full focus:placeholder-slate-500"
          />
          <p className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
            {(history || []).length} workouts ·{" "}
            {Object.keys(personalRecords || {}).length} PRs
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="grid grid-cols-4 bg-bg-surface p-1 rounded-xl border border-slate-800 gap-1">
        {[
          { id: "overview", label: "Overview" },
          { id: "inbody", label: "InBody" },
          { id: "progress", label: "Progress" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-10 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-slate-100 text-slate-950"
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
          <div className="space-y-4">
            {/* User Stats */}
            <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Your Stats</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="profile-weight"
                    className="text-xs text-slate-400 mb-1 block"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    id="profile-weight"
                    min="0"
                    step="any"
                    value={userProfile.weight || ""}
                    onChange={(e) =>
                      updateUserProfile({ weight: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="min-h-11 w-full bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-height"
                    className="text-xs text-slate-400 mb-1 block"
                  >
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    id="profile-height"
                    min="0"
                    step="any"
                    value={userProfile.height || ""}
                    onChange={(e) =>
                      updateUserProfile({ height: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="min-h-11 w-full bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-age"
                    className="text-xs text-slate-400 mb-1 block"
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    id="profile-age"
                    min="0"
                    step="1"
                    value={userProfile.age || ""}
                    onChange={(e) =>
                      updateUserProfile({ age: Number(e.target.value) })
                    }
                    placeholder="24"
                    className="min-h-11 w-full bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {bmi && (
                <div className="flex items-center justify-between bg-bg-deep rounded-xl p-3.5 border border-slate-800">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                      BMI
                    </p>
                    <p
                      className={`text-lg font-bold font-mono tabular-nums ${bmi.color}`}
                    >
                      {bmi.value}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${bmi.color}`}>
                    {bmi.category}
                  </span>
                </div>
              )}

              {/* TDEE & Suggested Macros */}
              {suggestedEnergy && suggestedMacros && (
                <div className="bg-bg-deep rounded-xl p-3.5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-amber-400" />
                      <h3 className="text-xs font-semibold text-white">
                        Daily Energy &amp; Suggested Macros
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyTargets}
                      className="min-h-9 px-3 rounded-lg bg-slate-100 text-slate-950 text-[11px] font-bold hover:bg-white transition-colors inline-flex items-center gap-1"
                    >
                      {appliedTargets ? (
                        <>
                          <Check size={12} /> Applied
                        </>
                      ) : (
                        "Apply targets"
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-bg-surface border border-slate-800 py-2 px-1.5">
                      <p className="text-[10px] text-slate-400">BMR</p>
                      <p className="text-xs font-bold font-mono tabular-nums text-white mt-0.5">
                        {suggestedEnergy.bmr} kcal
                      </p>
                    </div>
                    <div className="rounded-lg bg-bg-surface border border-slate-800 py-2 px-1.5">
                      <p className="text-[10px] text-slate-400">Maintenance</p>
                      <p className="text-xs font-bold font-mono tabular-nums text-white mt-0.5">
                        {suggestedEnergy.tdee} kcal
                      </p>
                    </div>
                    <div className="rounded-lg bg-bg-surface border border-slate-800 py-2 px-1.5">
                      <p className="text-[10px] text-slate-400">Lean Bulk</p>
                      <p className="text-xs font-bold font-mono tabular-nums text-sky-400 mt-0.5">
                        {suggestedEnergy.surplus} kcal
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Suggested split: {suggestedMacros.protein}g P ·{" "}
                    {suggestedMacros.carbs}g C · {suggestedMacros.fat}g F
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Trend + Training Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800 space-y-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity size={14} className="text-sky-400" />
                  Weekly Trend
                </h2>
                <div className="flex items-end justify-between gap-2 h-24">
                  {weeklyTrend.map((week, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full flex items-end justify-center"
                        style={{ height: "72px" }}
                      >
                        <div
                          className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                            week.count > 0 ? "bg-sky-400/80" : "bg-slate-800"
                          }`}
                          style={{
                            height: `${Math.max(4, (week.count / maxTrend) * 72)}px`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {week.label}
                      </span>
                      {week.count > 0 && (
                        <span className="text-[10px] text-sky-400 font-mono tabular-nums font-bold">
                          {week.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Training Summary
                </h2>
                <div className="grid grid-cols-2 gap-4 text-center py-2">
                  <div className="rounded-xl bg-bg-deep border border-slate-800 py-3 px-2">
                    <p className="text-2xl font-bold font-mono tabular-nums text-white">
                      {history.length}
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">
                      Total Sessions
                    </p>
                  </div>
                  <div className="rounded-xl bg-bg-deep border border-slate-800 py-3 px-2">
                    <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                      {(history || []).reduce(
                        (acc, s) =>
                          acc +
                          (s.exercises || []).reduce(
                            (a, e) => a + (e.sets || []).length,
                            0,
                          ),
                        0,
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">
                      Total Sets
                    </p>
                  </div>
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

        {/* PROGRESS TAB (BodyMeasurementsTab intentionally lives only in InBody) */}
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
            <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800">
              <ProgramSelector />
            </div>

            {/* Theme Toggle */}
            <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon size={15} className="text-sky-400" />
                  ) : (
                    <Sun size={15} className="text-amber-400" />
                  )}
                  <h2 className="text-sm font-semibold text-white">
                    Appearance
                  </h2>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                    theme === "light" ? "bg-amber-400" : "bg-slate-700"
                  }`}
                  aria-label="Light theme"
                  role="switch"
                  aria-checked={theme === "light"}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      theme === "light" ? "left-[24px]" : "left-1"
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
