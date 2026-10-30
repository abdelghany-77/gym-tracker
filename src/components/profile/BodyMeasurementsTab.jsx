import { useState } from "react";
import { Activity, Plus, Trash2, Calendar, Scale, ChevronDown, ChevronUp, Zap, Sparkles } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";
import { calculateBMI, getVisceralFatStatus, getBodyFatStatus, calculateInbodyDeltas } from "../../utils/inbodyUtils";

export default function BodyMeasurementsTab() {
  const userProfile = useWorkoutStore((s) => s.userProfile) || {};
  const measurements = useWorkoutStore((s) => s.measurements) || { entries: [] };
  const addMeasurement = useWorkoutStore((s) => s.addMeasurement);
  const deleteMeasurement = useWorkoutStore((s) => s.deleteMeasurement);

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [syncProfile, setSyncProfile] = useState(true);

  // Form State initialized with current user profile values for height, age, and weight
  const [form, setForm] = useState({
    date: new Date().toLocaleDateString("en-CA"),
    height: userProfile.height || "",
    age: userProfile.age || "",
    weight: userProfile.weight || "",
    skeletalMuscleMass: "",
    bodyFat: "",
    bodyFatMass: "",
    water: "",
    visceralFat: "",
    bmr: "",
    boneMass: "",
    chest: "",
    waist: "",
    arms: "",
    thighs: "",
    notes: "",
  });

  const handleOpenForm = () => {
    setForm((prev) => ({
      ...prev,
      date: new Date().toLocaleDateString("en-CA"),
      height: userProfile.height || prev.height || "",
      age: userProfile.age || prev.age || "",
      weight: userProfile.weight || prev.weight || "",
    }));
    setShowForm(true);
  };

  const handleWeightChange = (val) => {
    const newWeight = val;
    let newBfMass = form.bodyFatMass;
    if (newWeight && form.bodyFat) {
      newBfMass = (Number(newWeight) * (Number(form.bodyFat) / 100)).toFixed(1);
    }
    setForm({ ...form, weight: newWeight, bodyFatMass: newBfMass });
  };

  const handleBodyFatChange = (val) => {
    const newBf = val;
    let newBfMass = form.bodyFatMass;
    if (form.weight && newBf) {
      newBfMass = (Number(form.weight) * (Number(newBf) / 100)).toFixed(1);
    }
    setForm({ ...form, bodyFat: newBf, bodyFatMass: newBfMass });
  };

  const handleSave = () => {
    if (!form.weight && !form.height && !form.bodyFat && !form.skeletalMuscleMass) {
      return;
    }

    // Auto-calculate BMR if empty but weight, height, age are present
    let computedBmr = form.bmr;
    if (!computedBmr && form.weight && form.height && form.age) {
      computedBmr = Math.round(10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + 5);
    }

    addMeasurement({
      date: form.date,
      height: form.height ? Number(form.height) : null,
      age: form.age ? Number(form.age) : null,
      weight: form.weight ? Number(form.weight) : null,
      skeletalMuscleMass: form.skeletalMuscleMass ? Number(form.skeletalMuscleMass) : null,
      bodyFat: form.bodyFat ? Number(form.bodyFat) : null,
      bodyFatMass: form.bodyFatMass ? Number(form.bodyFatMass) : null,
      water: form.water ? Number(form.water) : null,
      visceralFat: form.visceralFat ? Number(form.visceralFat) : null,
      bmr: computedBmr ? Number(computedBmr) : null,
      boneMass: form.boneMass ? Number(form.boneMass) : null,
      chest: form.chest ? Number(form.chest) : null,
      waist: form.waist ? Number(form.waist) : null,
      arms: form.arms ? Number(form.arms) : null,
      thighs: form.thighs ? Number(form.thighs) : null,
      notes: form.notes,
      syncProfile,
    });

    setShowForm(false);
    // Reset form except core profile defaults
    setForm({
      date: new Date().toLocaleDateString("en-CA"),
      height: form.height,
      age: form.age,
      weight: form.weight,
      skeletalMuscleMass: "",
      bodyFat: "",
      bodyFatMass: "",
      water: "",
      visceralFat: "",
      bmr: "",
      boneMass: "",
      chest: "",
      waist: "",
      arms: "",
      thighs: "",
      notes: "",
    });
  };

  const sortedEntries = [...measurements.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestEntry = sortedEntries[0] || null;
  const previousEntry = sortedEntries[1] || null;

  const latestBmi = latestEntry ? calculateBMI(latestEntry.weight, latestEntry.height) : null;
  const visceralStatus = latestEntry ? getVisceralFatStatus(latestEntry.visceralFat) : null;
  const bodyFatStatus = latestEntry ? getBodyFatStatus(latestEntry.bodyFat) : null;
  const deltas = latestEntry && previousEntry ? calculateInbodyDeltas(latestEntry, previousEntry) : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={16} className="text-neon-blue" />
            InBody & Body Composition
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Track height, age, weight & InBody scan metrics</p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : handleOpenForm())}
          className="text-xs px-3 py-1.5 rounded-xl bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 font-medium transition-all flex items-center gap-1 border border-neon-blue/30 shadow-sm"
        >
          <Plus size={14} />
          {showForm ? "Cancel" : "New InBody Scan"}
        </button>
      </div>

      {/* ── Add Entry Form ── */}
      {showForm && (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-semibold text-neon-blue flex items-center gap-1.5">
              <Sparkles size={14} /> Record InBody Test Data
            </span>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-slate-900 text-xs text-white rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-neon-blue"
              />
            </div>
          </div>

          {/* Section 1: User Core Parameters (Height, Age, Weight) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Personal Attributes
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80">
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">Height (cm)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="175"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full bg-slate-800 text-white font-semibold rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80">
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">Age (years)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="24"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full bg-slate-800 text-white font-semibold rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80">
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="70.0"
                  value={form.weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full bg-slate-800 text-white font-semibold rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-green focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: InBody Composition Metrics */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              InBody Composition Analysis
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Muscle Mass - SMM (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 34.5"
                  value={form.skeletalMuscleMass}
                  onChange={(e) => setForm({ ...form, skeletalMuscleMass: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Body Fat (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 15.0"
                  value={form.bodyFat}
                  onChange={(e) => handleBodyFatChange(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Body Fat Mass (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 10.5"
                  value={form.bodyFatMass}
                  onChange={(e) => setForm({ ...form, bodyFatMass: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Visceral Fat (1-20)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 4"
                  value={form.visceralFat}
                  onChange={(e) => setForm({ ...form, visceralFat: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">Total Body Water (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 60.0"
                  value={form.water}
                  onChange={(e) => setForm({ ...form, water: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">BMR (kcal)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 1700"
                  value={form.bmr}
                  onChange={(e) => setForm({ ...form, bmr: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Circumferences & Notes (Optional) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tape Circumferences (cm) & Notes (Optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["chest", "waist", "arms", "thighs"].map((key) => (
                <div key={key}>
                  <label className="text-[9px] text-slate-500 block capitalize">{key}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-lg px-2 py-1 text-xs border border-slate-700"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Scan Notes (e.g. Fasting scan in morning)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-700 focus:outline-none"
            />
          </div>

          {/* Checkbox & Save button */}
          <div className="pt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncProfile}
                onChange={(e) => setSyncProfile(e.target.checked)}
                className="rounded accent-neon-blue"
              />
              <span className="text-[11px] text-slate-300">
                Update Height, Age, and Weight in Profile
              </span>
            </label>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap size={14} /> Save InBody Measurement
            </button>
          </div>
        </div>
      )}

      {/* ── Latest InBody Dashboard Card ── */}
      {latestEntry ? (
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-neon-green" />
              <span className="text-xs font-semibold text-white">Latest InBody Summary</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{latestEntry.date}</span>
          </div>

          {/* Top Row Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-medium">Height</p>
              <p className="text-base font-bold text-white mt-0.5">{latestEntry.height ? `${latestEntry.height} cm` : "—"}</p>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-medium">Age</p>
              <p className="text-base font-bold text-white mt-0.5">{latestEntry.age ? `${latestEntry.age} yrs` : "—"}</p>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-medium">Weight</p>
              <p className="text-base font-bold text-neon-green mt-0.5">
                {latestEntry.weight ? `${latestEntry.weight} kg` : "—"}
              </p>
              {deltas?.weight != null && (
                <span className={`text-[10px] font-semibold ${deltas.weight <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {deltas.weight > 0 ? `+${deltas.weight}` : deltas.weight} kg
                </span>
              )}
            </div>
          </div>

          {/* Middle Detailed Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-medium">Muscle Mass (SMM)</p>
              <p className="text-sm font-bold text-neon-blue mt-0.5">
                {latestEntry.skeletalMuscleMass ? `${latestEntry.skeletalMuscleMass} kg` : "—"}
              </p>
              {deltas?.skeletalMuscleMass != null && (
                <span className={`text-[10px] font-semibold ${deltas.skeletalMuscleMass >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {deltas.skeletalMuscleMass > 0 ? `+${deltas.skeletalMuscleMass}` : deltas.skeletalMuscleMass} kg
                </span>
              )}
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-medium">Body Fat %</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">
                {latestEntry.bodyFat ? `${latestEntry.bodyFat}%` : "—"}
              </p>
              {bodyFatStatus && <p className={`text-[9px] font-medium ${bodyFatStatus.color}`}>{bodyFatStatus.category}</p>}
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-medium">Visceral Fat Level</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">
                {latestEntry.visceralFat != null ? latestEntry.visceralFat : "—"}
              </p>
              {visceralStatus && <p className={`text-[9px] font-medium ${visceralStatus.color}`}>{visceralStatus.category}</p>}
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-medium">BMR (Metabolic)</p>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">
                {latestEntry.bmr ? `${latestEntry.bmr} kcal` : "—"}
              </p>
              {latestBmi && <p className={`text-[9px] font-medium ${latestBmi.color}`}>BMI: {latestBmi.value}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-slate-800">
          <Activity size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-medium">No InBody measurements logged yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Click "New InBody Scan" above to add your height, age, weight and scan metrics.</p>
        </div>
      )}

      {/* ── Scan History Log ── */}
      {sortedEntries.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            InBody History Log ({sortedEntries.length})
          </h3>
          <div className="space-y-2">
            {sortedEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const entryBmi = calculateBMI(entry.weight, entry.height);

              return (
                <div
                  key={entry.id}
                  className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 hover:border-slate-600 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-medium">{entry.date}</span>
                      <div className="flex items-center gap-2">
                        {entry.weight && <span className="font-semibold text-white">{entry.weight} kg</span>}
                        {entry.height && <span className="text-slate-400">({entry.height} cm)</span>}
                        {entry.age && <span className="text-slate-500">{entry.age} yrs</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {entry.skeletalMuscleMass && (
                        <span className="text-neon-blue font-medium hidden sm:inline">
                          SMM: {entry.skeletalMuscleMass}kg
                        </span>
                      )}
                      {entry.bodyFat && (
                        <span className="text-amber-400 font-medium">{entry.bodyFat}% BF</span>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="text-slate-400 hover:text-white p-1"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => deleteMeasurement(entry.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete scan"
                        aria-label="Delete scan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail metrics */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] animate-fadeIn">
                      <div>
                        <span className="text-slate-500 block">Height & Age:</span>
                        <span className="text-slate-200">
                          {entry.height ? `${entry.height} cm` : "N/A"} • {entry.age ? `${entry.age} yrs` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fat Mass:</span>
                        <span className="text-slate-200">
                          {entry.bodyFatMass ? `${entry.bodyFatMass} kg` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Visceral Fat Level:</span>
                        <span className="text-slate-200">
                          {entry.visceralFat != null ? `Level ${entry.visceralFat}` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">BMR & BMI:</span>
                        <span className="text-slate-200">
                          {entry.bmr ? `${entry.bmr} kcal` : "N/A"} {entryBmi ? `(BMI ${entryBmi.value})` : ""}
                        </span>
                      </div>

                      {(entry.chest || entry.waist || entry.arms || entry.thighs) && (
                        <div className="col-span-2 sm:col-span-4 pt-1 flex gap-3 text-slate-400">
                          <span className="text-slate-500">Tape:</span>
                          {entry.chest && <span>Chest: {entry.chest}cm</span>}
                          {entry.waist && <span>Waist: {entry.waist}cm</span>}
                          {entry.arms && <span>Arms: {entry.arms}cm</span>}
                          {entry.thighs && <span>Thighs: {entry.thighs}cm</span>}
                        </div>
                      )}

                      {entry.notes && (
                        <div className="col-span-2 sm:col-span-4 text-slate-400 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
