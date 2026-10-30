import { useState, useMemo } from "react";
import {
  User,
  Settings,
  ChevronRight,
  Target,
  Bell,
  Moon,
  Scale,
  Ruler,
  Percent,
  Activity,
  Check,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ScheduleEditor from "../components/ScheduleEditor";
import DataManagement from "../components/profile/DataManagement";

export default function Profile() {
  const userProfile = useWorkoutStore((s) => s.userProfile) || {};
  const updateUserProfile = useWorkoutStore((s) => s.updateUserProfile);
  const getBMI = useWorkoutStore((s) => s.getBMI);
  const theme = useWorkoutStore((s) => s.theme);
  const toggleTheme = useWorkoutStore((s) => s.toggleTheme);

  const [activeSubTab, setActiveSubTab] = useState("general"); // "general" | "schedule" | "backup"
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Compute BMI
  const bmiData = useMemo(() => {
    const weight = userProfile.weight || 78;
    const height = userProfile.height || 180;
    const heightM = height / 100;
    const val = (weight / (heightM * heightM)).toFixed(1);
    return val;
  }, [userProfile.weight, userProfile.height]);

  const userName = userProfile.name?.trim() || "Ahmed Mohamed";
  const userEmail = userProfile.email?.trim() || "";
  const userWeight = userProfile.weight || 78;
  const userHeight = userProfile.height || 180;
  const userBodyFat = userProfile.bodyFat || 14;

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER (Matches Reference Panel 9) ═══ */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Profile</h1>
        <button
          type="button"
          onClick={() => setActiveSubTab("general")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* ═══ USER CARD (Matches Reference Panel 9) ═══ */}
      <div className="rounded-3xl bg-[#142332] border border-[#223348] p-4 flex items-center gap-3.5 shadow-lg">
        {/* Avatar Circle */}
        <div className="w-14 h-14 rounded-full bg-[#192C3C] border-2 border-[#223348] overflow-hidden flex items-center justify-center text-[#C4E58A] font-bold text-lg shrink-0">
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={26} className="text-[#C4E58A]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={userProfile.name !== undefined ? userProfile.name : userName}
            onChange={(e) => updateUserProfile({ name: e.target.value })}
            placeholder="Ahmed Mohamed"
            className="text-base font-bold text-[#F1F5F7] bg-transparent border-none outline-none w-full focus:ring-1 focus:ring-[#73C8B4]/40 rounded px-1"
          />
          <p className="text-xs text-[#8E9FA5] px-1 truncate">{userEmail}</p>
        </div>
      </div>

      {/* ═══ SUB-TABS: [ General ] | [ Schedule ] | [ Backup ] ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "general", label: "General" },
          { id: "schedule", label: "Schedule" },
          { id: "backup", label: "Backup" },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-[#C4E58A] text-[#0D1723] font-bold border-[#C4E58A] shadow-[0_0_10px_rgba(196,229,138,0.3)]"
                  : "bg-[#142332] text-[#8E9FA5] border-[#223348] hover:text-[#F1F5F7]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === "general" && (
        <div className="space-y-4">
          {/* ═══ BODY METRICS 4-CARD GRID (Matches Reference Panel 9) ═══ */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#8E9FA5] uppercase tracking-wider px-1">
              Body Metrics
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Weight */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#8E9FA5]">
                  <Scale size={13} className="text-[#73C8B4]" />
                  <span>Weight</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    value={userWeight}
                    onChange={(e) => updateUserProfile({ weight: Number(e.target.value) })}
                    className="w-16 bg-transparent font-mono text-lg font-bold text-[#F1F5F7] outline-none"
                  />
                  <span className="text-xs text-[#8E9FA5]">kg</span>
                </div>
              </div>

              {/* Height */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#8E9FA5]">
                  <Ruler size={13} className="text-[#73C8B4]" />
                  <span>Height</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    value={userHeight}
                    onChange={(e) => updateUserProfile({ height: Number(e.target.value) })}
                    className="w-16 bg-transparent font-mono text-lg font-bold text-[#F1F5F7] outline-none"
                  />
                  <span className="text-xs text-[#8E9FA5]">cm</span>
                </div>
              </div>

              {/* Body Fat */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#8E9FA5]">
                  <Percent size={13} className="text-[#73C8B4]" />
                  <span>Body Fat</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    value={userBodyFat}
                    onChange={(e) => updateUserProfile({ bodyFat: Number(e.target.value) })}
                    className="w-16 bg-transparent font-mono text-lg font-bold text-[#F1F5F7] outline-none"
                  />
                  <span className="text-xs text-[#8E9FA5]">%</span>
                </div>
              </div>

              {/* BMI */}
              <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#8E9FA5]">
                  <Activity size={13} className="text-[#73C8B4]" />
                  <span>BMI</span>
                </div>
                <p className="font-mono text-lg font-bold text-[#F1F5F7]">{bmiData}</p>
              </div>
            </div>
          </div>

          {/* ═══ GOALS CARD (Matches Reference Panel 9) ═══ */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#8E9FA5] uppercase tracking-wider px-1">
              Goals
            </h2>
            <div className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#73C8B4]/15 text-[#73C8B4] flex items-center justify-center">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F1F5F7]">Build Muscle</h3>
                  <p className="text-[11px] text-[#8E9FA5]">Gain strength and muscle mass</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8E9FA5]" />
            </div>
          </div>

          {/* ═══ SETTINGS LIST (Matches Reference Panel 9) ═══ */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#8E9FA5] uppercase tracking-wider px-1">
              Settings
            </h2>

            <div className="rounded-2xl bg-[#142332] border border-[#223348] divide-y divide-[#223348]/60 overflow-hidden">
              {/* Notifications Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-[#8E9FA5]" />
                  <div>
                    <p className="text-xs font-bold text-[#F1F5F7]">Notifications</p>
                    <p className="text-[10px] text-[#8E9FA5]">Workout, nutrition reminders</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    notificationsEnabled ? "bg-[#C4E58A]" : "bg-[#192C3C]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#0D1723] transition-transform ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={18} className="text-[#8E9FA5]" />
                  <div>
                    <p className="text-xs font-bold text-[#F1F5F7]">Dark Mode</p>
                    <p className="text-[10px] text-[#8E9FA5]">Better for your eyes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    darkMode ? "bg-[#C4E58A]" : "bg-[#192C3C]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#0D1723] transition-transform ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Units */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scale size={18} className="text-[#8E9FA5]" />
                  <div>
                    <p className="text-xs font-bold text-[#F1F5F7]">Units</p>
                    <p className="text-[10px] text-[#8E9FA5]">Metric (kg, cm)</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#8E9FA5]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCHEDULE SUB-TAB ═══ */}
      {activeSubTab === "schedule" && (
        <div className="rounded-3xl bg-[#142332] border border-[#223348] p-4 shadow-lg space-y-3">
          <h2 className="text-sm font-bold text-[#F1F5F7]">Weekly Training Routine</h2>
          <ScheduleEditor />
        </div>
      )}

      {/* ═══ BACKUP SUB-TAB ═══ */}
      {activeSubTab === "backup" && (
        <div className="rounded-3xl bg-[#142332] border border-[#223348] p-4 shadow-lg space-y-3">
          <h2 className="text-sm font-bold text-[#F1F5F7]">Data Management & Backup</h2>
          <DataManagement />
        </div>
      )}
    </div>
  );
}
