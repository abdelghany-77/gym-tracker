import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Dumbbell,
  ArrowLeft,
  ChevronDown,
  Settings2,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/Modal";

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

const muscleColors = {
  Chest: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
    activeBg: "bg-red-500/20",
    activeBorder: "border-red-500/40",
  },
  Back: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    activeBg: "bg-blue-500/20",
    activeBorder: "border-blue-500/40",
  },
  Shoulders: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    activeBg: "bg-amber-500/20",
    activeBorder: "border-amber-500/40",
  },
  Arms: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
    activeBg: "bg-purple-500/20",
    activeBorder: "border-purple-500/40",
  },
  Legs: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    activeBg: "bg-emerald-500/20",
    activeBorder: "border-emerald-500/40",
  },
  Core: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    dot: "bg-cyan-400",
    activeBg: "bg-cyan-500/20",
    activeBorder: "border-cyan-500/40",
  },
};

export default function ManageExercises() {
  const navigate = useNavigate();
  const exercises = useWorkoutStore((s) => s.exercises);
  const programs = useWorkoutStore((s) => s.programs);
  const updateProgram = useWorkoutStore((s) => s.updateProgram);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const updateExercise = useWorkoutStore((s) => s.updateExercise);
  const deleteExercise = useWorkoutStore((s) => s.deleteExercise);

  // Which program is being edited
  const programList = useMemo(() => Object.values(programs), [programs]);
  const [selectedProgramId, setSelectedProgramId] = useState(
    programList[0]?.id || null,
  );
  const selectedProgram = programs[selectedProgramId];

  // UI state
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("program"); // "program" or "all"

  // Form state for add/edit
  const [form, setForm] = useState({
    name: "",
    muscle: "Chest",
    tips: "",
    default_sets: 3,
    default_reps: 10,
  });

  // Get the relevant muscle for the selected program
  const programMuscles = useMemo(() => selectedProgram?.muscles || [], [selectedProgram]);

  // Filter exercises for the current program's muscle group
  const availableExercises = useMemo(() => {
    if (!selectedProgram) return [];
    return exercises.filter((ex) => {
      const matchMuscle =
        programMuscles.length === 0 || programMuscles.includes(ex.muscle);
      const matchSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchMuscle && matchSearch;
    });
  }, [exercises, selectedProgram, programMuscles, search]);

  // All exercises grouped by muscle (for "all" view)
  const allExercisesGrouped = useMemo(() => {
    const filtered = exercises.filter((ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()),
    );
    return filtered.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});
  }, [exercises, search]);

  // Check if exercise is in the selected program
  const isInProgram = (exerciseId) => {
    return selectedProgram?.exercises?.includes(exerciseId) || false;
  };

  // Toggle exercise in program
  const toggleExerciseInProgram = (exerciseId) => {
    if (!selectedProgram) return;
    const currentExercises = [...(selectedProgram.exercises || [])];
    const idx = currentExercises.indexOf(exerciseId);
    if (idx >= 0) {
      currentExercises.splice(idx, 1);
    } else {
      currentExercises.push(exerciseId);
    }
    updateProgram(selectedProgramId, { exercises: currentExercises });
  };

  // Get exercises currently in the program (ordered)
  const programExercises = useMemo(() => {
    if (!selectedProgram) return [];
    return (selectedProgram.exercises || [])
      .map((id) => exercises.find((e) => e.id === id))
      .filter(Boolean);
  }, [selectedProgram, exercises]);

  // Form handlers
  const resetForm = () => {
    setForm({
      name: "",
      muscle: programMuscles[0] || "Chest",
      tips: "",
      default_sets: 3,
      default_reps: 10,
    });
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
            Pick exercises for each workout program
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neon-blue/10 text-neon-blue text-xs font-semibold border border-neon-blue/20 hover:bg-neon-blue/20 transition-all active:scale-95"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1">
        <button
          onClick={() => setView("program")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            view === "program"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Settings2 size={12} className="inline mr-1.5 -mt-0.5" />
          By Program
        </button>
        <button
          onClick={() => setView("all")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            view === "all"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Dumbbell size={12} className="inline mr-1.5 -mt-0.5" />
          All Exercises
        </button>
      </div>

      {/* ═══ PROGRAM VIEW ═══ */}
      {view === "program" && (
        <>
          {/* Program Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {programList.map((prog) => {
              const mainMuscle = prog.muscles?.[0];
              const colors = muscleColors[mainMuscle] || muscleColors.Chest;
              const isSelected = prog.id === selectedProgramId;
              return (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border shrink-0 ${
                    isSelected
                      ? `${colors.activeBg} ${colors.text} ${colors.activeBorder}`
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? colors.dot : "bg-slate-600"
                    }`}
                  />
                  {prog.name}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? `${colors.bg} ${colors.text}`
                        : "bg-slate-700/50 text-slate-500"
                    }`}
                  >
                    {prog.exercises?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder={`Search ${programMuscles.join(", ") || ""} exercises...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
            />
          </div>

          {/* Current Selection Summary */}
          {selectedProgram && programExercises.length > 0 && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  Current Lineup — {programExercises.length} exercises
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {programExercises.map((ex, i) => (
                  <span
                    key={ex.id}
                    className="inline-flex items-center gap-1.5 text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/40"
                  >
                    <span className="text-[10px] text-slate-500 font-mono">
                      {i + 1}
                    </span>
                    {ex.name}
                    <button
                      onClick={() => toggleExerciseInProgram(ex.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors -mr-0.5"
                      aria-label={`Remove ${ex.name}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Exercises (with checkboxes) */}
          <div className="space-y-1.5">
            {availableExercises.map((ex) => {
              const selected = isInProgram(ex.id);
              const colors =
                muscleColors[ex.muscle] || muscleColors.Chest;
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleExerciseInProgram(ex.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] text-left group ${
                    selected
                      ? `${colors.bg} ${colors.activeBorder} border`
                      : "bg-slate-900/60 border-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      selected
                        ? `bg-neon-blue text-slate-950`
                        : "bg-slate-800 border border-slate-700 text-transparent group-hover:border-slate-600"
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>

                  {/* Image */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        selected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {ex.default_sets} sets × {ex.default_reps} reps
                      {ex.isCustom && " • Custom"}
                    </p>
                  </div>

                  {/* Order number if selected */}
                  {selected && (
                    <span
                      className={`text-xs font-bold ${colors.text} bg-slate-800/60 w-6 h-6 rounded-md flex items-center justify-center shrink-0`}
                    >
                      {(selectedProgram?.exercises?.indexOf(ex.id) ?? -1) + 1}
                    </span>
                  )}
                </button>
              );
            })}

            {availableExercises.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                No exercises found
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ ALL EXERCISES VIEW ═══ */}
      {view === "all" && (
        <>
          {/* Search & Filter */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search all exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-5">
            {Object.entries(allExercisesGrouped).map(([muscle, items]) => {
              const colors = muscleColors[muscle] || muscleColors.Chest;
              return (
                <div key={muscle} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${colors.dot}`}
                    />
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
                      className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all group"
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
                            className={`text-[9px] px-1.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
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

                      {/* Actions - always visible on mobile */}
                      <div className="flex gap-1">
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
              );
            })}

            {Object.keys(allExercisesGrouped).length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No exercises found
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Form (overlay bottom sheet) */}
      {(showAddForm || editingId) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-md rounded-t-3xl border-t border-slate-700 p-5 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editingId ? "Edit Exercise" : "New Exercise"}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700"
                aria-label="Cancel"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Exercise name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
              autoFocus
            />

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-500 mb-1 block">
                  Muscle
                </label>
                <div className="relative">
                  <select
                    value={form.muscle}
                    onChange={(e) =>
                      setForm({ ...form, muscle: e.target.value })
                    }
                    className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                    title="Select muscle group"
                  >
                    {muscleGroups.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">
                  Sets
                </label>
                <input
                  type="number"
                  value={form.default_sets}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      default_sets: Number(e.target.value) || 3,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">
                  Reps
                </label>
                <input
                  type="number"
                  value={form.default_reps}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      default_reps: Number(e.target.value) || 10,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                />
              </div>
            </div>

            <textarea
              placeholder="Tips / How to perform..."
              value={form.tips}
              onChange={(e) => setForm({ ...form, tips: e.target.value })}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500 resize-none"
            />

            <button
              onClick={editingId ? handleSaveEdit : handleAdd}
              disabled={!form.name.trim()}
              className="w-full py-3.5 rounded-xl bg-neon-blue/20 text-neon-blue font-semibold text-sm border border-neon-blue/30 hover:bg-neon-blue/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={16} />
              {editingId ? "Save Changes" : "Add Exercise"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Exercise?"
        message="This exercise will be removed from all programs. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
