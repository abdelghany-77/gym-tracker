import { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Check, Dumbbell, ArrowLeft, ChevronDown,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import { useNavigate } from "react-router-dom";

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs"];

const muscleColors = {
  Chest: "bg-red-500/10 text-red-400 border-red-500/20",
  Back: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shoulders: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Arms: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Legs: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function ManageExercises() {
  const navigate = useNavigate();
  const exercises = useWorkoutStore((s) => s.exercises);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const updateExercise = useWorkoutStore((s) => s.updateExercise);
  const deleteExercise = useWorkoutStore((s) => s.deleteExercise);

  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    muscle: "Chest",
    tips: "",
    default_sets: 3,
    default_reps: 10,
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === "All" || ex.muscle === filterMuscle;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, filterMuscle]);

  const grouped = useMemo(() => {
    return filteredExercises.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});
  }, [filteredExercises]);

  const resetForm = () => {
    setForm({ name: "", muscle: "Chest", tips: "", default_sets: 3, default_reps: 10 });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addExercise(form);
    resetForm();
  };

  const handleStartEdit = (ex) => {
    setEditingId(ex.id);
    setForm({
      name: ex.name,
      muscle: ex.muscle,
      tips: ex.tips || "",
      default_sets: ex.default_sets || 3,
      default_reps: ex.default_reps || 10,
    });
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    if (!form.name.trim()) return;
    updateExercise(editingId, form);
    resetForm();
  };

  const handleDelete = (id) => {
    deleteExercise(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/exercises")}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
          aria-label="Back to Exercise Library"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Manage Exercises</h1>
          <p className="text-[11px] text-slate-500">
            {exercises.length} exercises total
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-blue/10 text-neon-blue text-xs font-semibold border border-neon-blue/20 hover:bg-neon-blue/20 transition-all active:scale-95"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
          />
        </div>
        <div className="relative">
          <select
            value={filterMuscle}
            onChange={(e) => setFilterMuscle(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
            title="Filter by muscle group"
          >
            <option value="All">All</option>
            {muscleGroups.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {editingId ? "Edit Exercise" : "New Exercise"}
            </h3>
            <button
              onClick={resetForm}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700"
              aria-label="Cancel"
            >
              <X size={14} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Exercise name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Muscle</label>
              <select
                value={form.muscle}
                onChange={(e) => setForm({ ...form, muscle: e.target.value })}
                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                title="Select muscle group"
              >
                {muscleGroups.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Sets</label>
              <input
                type="number"
                value={form.default_sets}
                onChange={(e) => setForm({ ...form, default_sets: Number(e.target.value) || 3 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Reps</label>
              <input
                type="number"
                value={form.default_reps}
                onChange={(e) => setForm({ ...form, default_reps: Number(e.target.value) || 10 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
          </div>

          <textarea
            placeholder="Tips / How to perform..."
            value={form.tips}
            onChange={(e) => setForm({ ...form, tips: e.target.value })}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500 resize-none"
          />

          <button
            onClick={editingId ? handleSaveEdit : handleAdd}
            disabled={!form.name.trim()}
            className="w-full py-3 rounded-xl bg-neon-blue/20 text-neon-blue font-semibold text-sm border border-neon-blue/30 hover:bg-neon-blue/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {editingId ? "Save Changes" : "Add Exercise"}
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([muscle, items]) => (
          <div key={muscle} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {muscle}
              </h2>
              <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {items.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  {ex.image ? (
                    <img
                      src={getImageUrl(ex.image)}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Dumbbell size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {ex.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                        muscleColors[ex.muscle] || "bg-slate-700 text-slate-400 border-slate-600"
                      }`}
                    >
                      {ex.muscle}
                    </span>
                    {ex.isCustom && (
                      <span className="text-[9px] text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded-full border border-neon-green/20">
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(ex)}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-neon-blue transition-colors"
                    aria-label={`Edit ${ex.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(ex.id)}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label={`Delete ${ex.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No exercises found
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Delete Exercise?
            </h3>
            <p className="text-sm text-slate-400">
              This exercise will be removed from all programs. This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
