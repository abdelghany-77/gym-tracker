import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Clock,
  Flame,
  TrendingUp,
  Activity,
  ChevronDown,
  X,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  Target,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { cardioActivities, intensityLevels, beginnerPrograms, safetyDisclaimer, warmupCooldownTips } from "../data/cardio";
import { ConfirmDialog } from "../components/Modal";

const intensityColors = {
  light: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  moderate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  vigorous: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
};

const defaultForm = {
  date: new Date().toLocaleDateString("en-CA"),
  activityId: "brisk_walking",
  duration: "",
  distance: "",
  intensity: "moderate",
  rpe: "",
  heartRate: "",
  estimatedCalories: "",
  incline: "",
  notes: "",
};

export default function Cardio() {
  const navigate = useNavigate();
  const cardioHistory = useWorkoutStore((s) => s.cardioHistory);
  const cardioGoal = useWorkoutStore((s) => s.cardioGoal);
  const addCardioSession = useWorkoutStore((s) => s.addCardioSession);
  const updateCardioSession = useWorkoutStore((s) => s.updateCardioSession);
  const deleteCardioSession = useWorkoutStore((s) => s.deleteCardioSession);
  const setCardioGoal = useWorkoutStore((s) => s.setCardioGoal);

  const weeklyStats = useMemo(
    () => useWorkoutStore.getState().getCardioWeeklyStats(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardioHistory]
  );
  const trend = useMemo(
    () => useWorkoutStore.getState().getCardioTrend(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardioHistory]
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPrograms, setShowPrograms] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(cardioGoal?.moderateMinutes || 150);

  const selectedActivity = cardioActivities.find((a) => a.id === form.activityId);
  const goalMinutes = cardioGoal?.moderateMinutes || 150;
  const goalProgress = Math.min(100, Math.round((weeklyStats.totalModerateEquiv / goalMinutes) * 100));

  // Recent sessions (newest first)
  const recentSessions = useMemo(() => {
    return [...cardioHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cardioHistory]);

  const maxTrend = Math.max(...trend.map((w) => w.minutes), 1);

  const resetForm = () => {
    setForm({ ...defaultForm, date: new Date().toLocaleDateString("en-CA") });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.duration || Number(form.duration) <= 0) return;
    const activity = cardioActivities.find((a) => a.id === form.activityId);
    const sessionData = {
      ...form,
      activityName: activity?.name || "",
      activityNameAr: activity?.nameAr || "",
      duration: Number(form.duration),
      distance: form.distance ? Number(form.distance) : null,
      rpe: form.rpe ? Number(form.rpe) : null,
      heartRate: form.heartRate ? Number(form.heartRate) : null,
      estimatedCalories: form.estimatedCalories ? Number(form.estimatedCalories) : null,
      incline: form.incline ? Number(form.incline) : null,
    };

    if (editingId) {
      updateCardioSession(editingId, sessionData);
    } else {
      addCardioSession(sessionData);
    }
    resetForm();
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setForm({
      date: session.date || defaultForm.date,
      activityId: session.activityId || "brisk_walking",
      duration: session.duration?.toString() || "",
      distance: session.distance?.toString() || "",
      intensity: session.intensity || "moderate",
      rpe: session.rpe?.toString() || "",
      heartRate: session.heartRate?.toString() || "",
      estimatedCalories: session.estimatedCalories?.toString() || "",
      incline: session.incline?.toString() || "",
      notes: session.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteCardioSession(id);
    setDeleteConfirm(null);
  };

  const handleSaveGoal = () => {
    const val = Number(goalInput);
    if (val > 0 && val <= 1000) {
      setCardioGoal({ moderateMinutes: val });
    }
    setShowGoalEdit(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Cardio</h1>
          <p className="text-[11px] text-slate-500">Track aerobic activity & progress</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neon-cyan/10 text-neon-cyan text-xs font-semibold border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-all active:scale-95"
        >
          <Plus size={14} />
          Log
        </button>
      </div>

      {/* ── Weekly Progress Card ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target size={16} className="text-neon-cyan" />
            Weekly Progress
          </h2>
          <button
            onClick={() => { setGoalInput(goalMinutes); setShowGoalEdit(true); }}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Goal: {goalMinutes} min ✎
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {weeklyStats.totalModerateEquiv} / {goalMinutes} moderate-equiv min
            </span>
            <span className={`font-bold ${goalProgress >= 100 ? "text-neon-green" : "text-neon-cyan"}`}>
              {goalProgress}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                goalProgress >= 100
                  ? "bg-gradient-to-r from-neon-green to-emerald-400"
                  : "bg-gradient-to-r from-neon-cyan to-neon-blue"
              }`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-slate-900/60 rounded-xl">
            <p className="text-lg font-bold text-white">{weeklyStats.sessions}</p>
            <p className="text-[10px] text-slate-500 uppercase">Sessions</p>
          </div>
          <div className="text-center p-2 bg-slate-900/60 rounded-xl">
            <p className="text-lg font-bold text-white">{weeklyStats.totalDuration}</p>
            <p className="text-[10px] text-slate-500 uppercase">Minutes</p>
          </div>
          <div className="text-center p-2 bg-slate-900/60 rounded-xl">
            <p className="text-lg font-bold text-white">
              {weeklyStats.totalDistance != null ? weeklyStats.totalDistance.toFixed(1) : "—"}
            </p>
            <p className="text-[10px] text-slate-500 uppercase">km</p>
          </div>
        </div>

        {/* How calculation works */}
        <p className="text-[10px] text-slate-600 leading-relaxed">
          <Info size={10} className="inline -mt-0.5 mr-0.5" />
          1 vigorous min = 2 moderate min. 1 light min = 0.5 moderate min.
        </p>
      </div>

      {/* ── Activity Trend ── */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-vivid-purple" />
          8-Week Trend
        </h2>
        <div className="flex items-end gap-1.5 h-20">
          {trend.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  w.minutes > 0 ? "bg-gradient-to-t from-neon-cyan/60 to-neon-cyan/20" : "bg-slate-800"
                }`}
                style={{
                  height: `${Math.max(4, (w.minutes / maxTrend) * 64)}px`,
                }}
                title={`${w.minutes} moderate-equiv min`}
              />
              <span className="text-[9px] text-slate-500">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Beginner Programs ── */}
      <button
        onClick={() => setShowPrograms(!showPrograms)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all text-left"
      >
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Activity size={14} className="text-amber-400" />
          Beginner Programs & Tips
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${showPrograms ? "rotate-180" : ""}`} />
      </button>

      {showPrograms && (
        <div className="space-y-3 animate-fadeIn">
          {/* Safety disclaimer */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
            <p className="text-[11px] text-red-400 flex items-start gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              {safetyDisclaimer.en}
            </p>
          </div>

          {/* Warmup/cooldown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
              <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Warm-up</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">{warmupCooldownTips.warmup.en}</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
              <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Cool-down</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">{warmupCooldownTips.cooldown.en}</p>
            </div>
          </div>

          {/* Programs */}
          {beginnerPrograms.map((prog) => (
            <div key={prog.id} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{prog.name}</h3>
                <span className="text-[10px] text-slate-500">{prog.totalMinutesPerWeek} min/week</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{prog.notes}</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {prog.sessions.map((s, i) => {
                  const act = cardioActivities.find((a) => a.id === s.activity);
                  const ic = intensityColors[s.intensity] || intensityColors.moderate;
                  return (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${ic.bg} ${ic.text} ${ic.border}`}>
                      {act?.icon} {act?.name} · {s.duration}min × {s.days}d
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Sessions ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          Recent Sessions
          {recentSessions.length > 0 && (
            <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">
              {recentSessions.length}
            </span>
          )}
        </h2>

        {recentSessions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-800/20 border border-dashed border-slate-700/50 space-y-2">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <Activity size={20} />
            </div>
            <p className="text-slate-400 text-sm font-medium">No cardio sessions yet</p>
            <p className="text-[11px] text-slate-500">Log your first cardio activity above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.slice(0, 20).map((session) => {
              const activity = cardioActivities.find((a) => a.id === session.activityId);
              const ic = intensityColors[session.intensity] || intensityColors.moderate;
              return (
                <div key={session.id} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${ic.bg} ${ic.border} border shrink-0`}>
                    {activity?.icon || "🏃"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {activity?.name || session.activityName || "Activity"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-500">{session.date}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${ic.bg} ${ic.text} ${ic.border}`}>
                        {session.intensity}
                      </span>
                      <span className="text-[10px] text-slate-400">{session.duration} min</span>
                      {session.distance && (
                        <span className="text-[10px] text-slate-400">{session.distance} km</span>
                      )}
                      {session.estimatedCalories && (
                        <span className="text-[10px] text-slate-500 italic">
                          ~{session.estimatedCalories} cal (est.)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(session)}
                      className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-neon-blue transition-colors"
                      aria-label="Edit session"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(session.id)}
                      className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      aria-label="Delete session"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add/Edit Form (overlay bottom sheet) ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => resetForm()}>
          <div
            className="bg-slate-900 w-full max-w-md rounded-t-3xl border-t border-slate-700 p-5 space-y-3 animate-slideUp max-h-[85vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editingId ? "Edit Session" : "Log Cardio"}
              </h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700" aria-label="Cancel">
                <X size={16} />
              </button>
            </div>

            {/* Date */}
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>

            {/* Activity */}
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Activity</label>
              <div className="relative">
                <select
                  value={form.activityId}
                  onChange={(e) => setForm({ ...form, activityId: e.target.value })}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  title="Select activity"
                >
                  {cardioActivities.map((a) => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              {selectedActivity && !selectedActivity.beginnerFriendly && (
                <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} />
                  High-demand activity. {selectedActivity.beginnerAlternative && (
                    <>Beginner alternative: {cardioActivities.find((a) => a.id === selectedActivity.beginnerAlternative)?.name}</>
                  )}
                </p>
              )}
            </div>

            {/* Duration & Intensity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Duration (min) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="30"
                  min="1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Intensity</label>
                <div className="relative">
                  <select
                    value={form.intensity}
                    onChange={(e) => setForm({ ...form, intensity: e.target.value })}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                    title="Select intensity"
                  >
                    {intensityLevels.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-2">
              {selectedActivity?.supportsDistance && (
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Distance (km)</label>
                  <input
                    type="number"
                    value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    placeholder="—"
                    step="0.1"
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Avg Heart Rate</label>
                <input
                  type="number"
                  value={form.heartRate}
                  onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                  placeholder="—"
                  min="40"
                  max="220"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">RPE (1–10)</label>
                <input
                  type="number"
                  value={form.rpe}
                  onChange={(e) => setForm({ ...form, rpe: e.target.value })}
                  placeholder="—"
                  min="1"
                  max="10"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Est. Calories</label>
                <input
                  type="number"
                  value={form.estimatedCalories}
                  onChange={(e) => setForm({ ...form, estimatedCalories: e.target.value })}
                  placeholder="—"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
                />
              </div>
            </div>

            <textarea
              placeholder="Notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={!form.duration || Number(form.duration) <= 0}
              className="w-full py-3.5 rounded-xl bg-neon-cyan/20 text-neon-cyan font-semibold text-sm border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={16} />
              {editingId ? "Save Changes" : "Log Session"}
            </button>
          </div>
        </div>
      )}

      {/* ── Goal Edit Modal ── */}
      {showGoalEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowGoalEdit(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-xs border border-slate-700 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white">Weekly Goal</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              WHO recommends 150 min moderate or 75 min vigorous activity per week (or equivalent mix).
            </p>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Moderate-equivalent minutes/week</label>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min="10"
                max="1000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowGoalEdit(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm border border-slate-700 hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={handleSaveGoal} className="flex-1 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan text-sm font-semibold border border-neon-cyan/30 hover:bg-neon-cyan/30">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Session?"
        message="This cardio session will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
