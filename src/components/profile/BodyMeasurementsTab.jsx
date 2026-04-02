import { useState } from "react";
import { Ruler, Plus } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";

export default function BodyMeasurementsTab() {
  const measurements = useWorkoutStore((s) => s.measurements);
  const addMeasurement = useWorkoutStore((s) => s.addMeasurement);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bodyFat: "", chest: "", waist: "", arms: "", thighs: "" });

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Ruler size={14} className="text-neon-purple" />
          Body Measurements
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[11px] text-neon-blue hover:text-neon-blue/80 font-medium transition-colors flex items-center gap-0.5"
        >
          <Plus size={12} /> Add Entry
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2 w-full">
            {["bodyFat", "chest", "waist", "arms", "thighs"].map((key) => (
              <div key={key}>
                <label className="text-[10px] text-slate-500 mb-1 block capitalize">
                  {key === "bodyFat" ? "Body Fat %" : key}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="—"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-2 py-2 border border-slate-600 focus:border-neon-blue focus:outline-none text-xs"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const entry = {};
              Object.entries(form).forEach(([k, v]) => { if (v) entry[k] = Number(v); });
              if (Object.keys(entry).length > 0) {
                addMeasurement(entry);
                setForm({ bodyFat: "", chest: "", waist: "", arms: "", thighs: "" });
                setShowForm(false);
              }
            }}
            className="w-full py-2 rounded-xl bg-neon-blue/20 text-neon-blue font-semibold text-xs border border-neon-blue/30 hover:bg-neon-blue/30 transition-all mt-2"
          >
            Save Measurement
          </button>
        </div>
      )}

      {measurements.entries.length > 0 ? (
        <div className="space-y-2">
          {[...measurements.entries].reverse().slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0 text-xs text-center">
              <span className="text-slate-500">{entry.date}</span>
              <div className="flex gap-3 text-slate-300 flex-wrap justify-end">
                {entry.bodyFat && <span>{entry.bodyFat}% BF</span>}
                {entry.chest && <span>Chest {entry.chest}</span>}
                {entry.waist && <span>Waist {entry.waist}</span>}
                {entry.arms && <span>Arms {entry.arms}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-3">No measurements recorded yet</p>
      )}
    </div>
  );
}
