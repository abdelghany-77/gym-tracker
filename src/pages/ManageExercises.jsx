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
import AngleBadge from "../components/AngleBadge";
import { angleLabels } from "../data/exercises";
import { sanitizeExerciseList } from "../store/helpers";

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

const equipmentOptions = [
  { id: "all", label: "All" },
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "cable", label: "Cable" },
  { id: "machine", label: "Machine" },
  { id: "bodyweight", label: "Bodyweight" },
];

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
  const rawExercises = useWorkoutStore((s) => s.exercises);
  const programs = useWorkoutStore((s) => s.programs);
  const updateProgram = useWorkoutStore((s) => s.updateProgram);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const updateExercise = useWorkoutStore((s) => s.updateExercise);
  const deleteExercise = useWorkoutStore((s) => s.deleteExercise);

  // Sanitize exercise list from store to avoid any duplicates
  const exercises = useMemo(() => sanitizeExerciseList(rawExercises), [rawExercises]);

  // Which program is being edited
  const programList = useMemo(() => Object.values(programs), [programs]);
  const [selectedProgramId, setSelectedProgramId] = useState(
    programList[0]?.id || null,
  );
  const selectedProgram = programs[selectedProgramId];

  // UI filter states
  const [search, setSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("program"); // "program" or "all"

  // Form state for add/edit
  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    muscle: "Chest",
    equipment: "barbell",
    targetAngle: "mid_chest",
    tips: "",
    default_sets: 3,
    default_reps: 10,
  });

  // Get the relevant muscle for the selected program
  const programMuscles = useMemo(() => selectedProgram?.muscles || [], [selectedProgram]);

  // Multi-attribute search matching function
  const matchExercise = (ex, query, equipment) => {
    if (equipment !== "all" && ex.equipment !== equipment) {
      return false;
    }
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const nameEn = (ex.name || "").toLowerCase();
    const nameAr = (ex.nameAr || "").toLowerCase();
    const targetAngle = (ex.targetAngle || "").toLowerCase();
    const muscle = (ex.muscle || ex.primaryMuscle || "").toLowerCase();
    const equip = (ex.equipment || "").toLowerCase();
    const angleObj = ex.targetAngle ? angleLabels[ex.targetAngle] : null;
    const angleEn = (angleObj?.en || "").toLowerCase();
    const angleAr = (angleObj?.ar || "").toLowerCase();

    return (
      nameEn.includes(q) ||
      nameAr.includes(q) ||
      targetAngle.includes(q) ||
      muscle.includes(q) ||
      equip.includes(q) ||
      angleEn.includes(q) ||
      angleAr.includes(q)
    );
  };

  // Filter exercises for the current program's muscle group
  const availableExercises = useMemo(() => {
    if (!selectedProgram) return [];
    return exercises.filter((ex) => {
      const matchMuscle =
        programMuscles.length === 0 || programMuscles.includes(ex.muscle);
      return matchMuscle && matchExercise(ex, search, selectedEquipment);
    });
  }, [exercises, selectedProgram, programMuscles, search, selectedEquipment]);

  // All exercises grouped by muscle (for "all" view)
  const allExercisesGrouped = useMemo(() => {
    const filtered = exercises.filter((ex) =>
      matchExercise(ex, search, selectedEquipment),
    );
    return filtered.reduce((acc, ex) => {
      const m = ex.muscle || "Chest";
      if (!acc[m]) acc[m] = [];
      acc[m].push(ex);
      return acc;
    }, {});
  }, [exercises, search, selectedEquipment]);

  // Check if exercise is in the selected program
  const isInProgram = (exerciseId) => {
    return selectedProgram?.exercises?.includes(exerciseId) || false;
  };

  // Toggle exercise in program (maintains unique list)
  const toggleExerciseInProgram = (exerciseId) => {
    if (!selectedProgram) return;
    const currentExercises = [...(selectedProgram.exercises || [])];
    const idx = currentExercises.indexOf(exerciseId);
    if (idx >= 0) {
      currentExercises.splice(idx, 1);
    } else {
      currentExercises.push(exerciseId);
    }
    // Deduplicate array
    const deduplicated = Array.from(new Set(currentExercises));
    updateProgram(selectedProgramId, { exercises: deduplicated });
  };

  // Get exercises currently in the program (ordered & deduplicated)
  const programExercises = useMemo(() => {
    if (!selectedProgram) return [];
    const seen = new Set();
    const list = [];
    for (const id of selectedProgram.exercises || []) {
      if (!seen.has(id)) {
        seen.add(id);
        const ex = exercises.find((e) => e.id === id);
        if (ex) list.push(ex);
      }
    }
    return list;
  }, [selectedProgram, exercises]);

  // Form handlers
  const resetForm = () => {
    setForm({
      name: "",
      nameAr: "",
      muscle: programMuscles[0] || "Chest",
      equipment: "barbell",
      targetAngle: "mid_chest",
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
      nameAr: ex.nameAr || "",
      muscle: ex.muscle || "Chest",
      equipment: ex.equipment || "barbell",
      targetAngle: ex.targetAngle || "mid_chest",
      tips: ex.tips || "",
      default_sets: ex.default_sets || ex.defaultSets || 3,
      default_reps: ex.default_reps || ex.defaultReps || 10,
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

      {/* Equipment Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {equipmentOptions.map((opt) => {
          const isSelected = selectedEquipment === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedEquipment(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border ${
                isSelected
                  ? "bg-neon-blue/20 text-neon-blue border-neon-blue/40 shadow-sm"
                  : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
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
              placeholder={`Search ${programMuscles.join(", ") || "all"} exercises (EN / عربي / Angle / Equipment)...`}
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

                  {/* Image with fallback */}
                  <img
                    src={getImageUrl(ex.image || `/exercises/${ex.id}.png`)}
                    alt={ex.name}
                    className="w-12 h-12 rounded-lg object-contain bg-[#0B0F17] border border-[#1E293B] p-1 shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getImageUrl("/icons/dumbbell.svg");
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        selected ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {ex.name}
                    </p>
                    {ex.nameAr && (
                      <p className="text-[11px] text-slate-400 truncate" dir="rtl">
                        {ex.nameAr}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50 uppercase font-medium">
                        {ex.equipment || "barbell"}
                      </span>
                      {ex.targetAngle && (
                        <AngleBadge angle={ex.targetAngle} size="xs" />
                      )}
                      <span className="text-[10px] text-slate-500">
                        {ex.default_sets || ex.defaultSets || 3}×{ex.default_reps || ex.defaultReps || 10}
                      </span>
                    </div>
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
                No exercises found matching current filters
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
              placeholder="Search all exercises (EN / عربي / Angle / Equipment)..."
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
                      {/* Image with fallback */}
                      <img
                        src={getImageUrl(ex.image || `/exercises/${ex.id}.png`)}
                        alt={ex.name}
                        className="w-12 h-12 rounded-lg object-contain bg-[#0B0F17] border border-[#1E293B] p-1 shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getImageUrl("/icons/dumbbell.svg");
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {ex.name}
                        </p>
                        {ex.nameAr && (
                          <p className="text-[11px] text-slate-400 truncate" dir="rtl">
                            {ex.nameAr}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {ex.muscle}
                          </span>
                          <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50 uppercase font-medium">
                            {ex.equipment || "barbell"}
                          </span>
                          {ex.targetAngle && (
                            <AngleBadge angle={ex.targetAngle} size="xs" />
                          )}
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
                No exercises found matching current filters
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
              placeholder="Exercise name (English)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
              autoFocus
            />

            <input
              type="text"
              placeholder="Arabic name (e.g. بنش بار مستوي)"
              value={form.nameAr}
              dir="rtl"
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 placeholder:text-slate-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">
                  Muscle Group
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
                  Equipment
                </label>
                <div className="relative">
                  <select
                    value={form.equipment}
                    onChange={(e) =>
                      setForm({ ...form, equipment: e.target.value })
                    }
                    className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                    title="Select equipment"
                  >
                    {equipmentOptions.filter(e => e.id !== 'all').map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
