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
  MoreVertical,
  Layers,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/Modal";
import AngleBadge from "../components/AngleBadge";
import AngleCoverageBadge from "../components/AngleCoverageBadge";
import { angleLabels } from "../data/exercises";
import { sanitizeExerciseList } from "../store/helpers";

const equipmentOptions = [
  { id: "all", label: "All" },
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "cable", label: "Cable" },
  { id: "machine", label: "Machine" },
  { id: "bodyweight", label: "Bodyweight" },
];

export default function ManageExercises() {
  const navigate = useNavigate();
  const rawExercises = useWorkoutStore((s) => s.exercises);
  const programs = useWorkoutStore((s) => s.programs);
  const updateProgram = useWorkoutStore((s) => s.updateProgram);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const updateExercise = useWorkoutStore((s) => s.updateExercise);
  const deleteExercise = useWorkoutStore((s) => s.deleteExercise);

  const exercises = useMemo(() => sanitizeExerciseList(rawExercises), [rawExercises]);
  const programList = useMemo(() => Object.values(programs), [programs]);
  const [selectedProgramId, setSelectedProgramId] = useState(
    programList[0]?.id || "chest_day"
  );
  const selectedProgram = programs[selectedProgramId] || programList[0];

  // UI tabs: "builder" (Workout Builder) or "library" (Exercise Library)
  const [view, setView] = useState("builder");
  const [search, setSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const programMuscles = useMemo(() => selectedProgram?.muscles || [], [selectedProgram]);

  const currentProgramExerciseObjs = useMemo(() => {
    if (!selectedProgram?.exercises) return [];
    const map = new Map(exercises.map((e) => [e.id, e]));
    return selectedProgram.exercises.map((id) => map.get(id)).filter(Boolean);
  }, [selectedProgram, exercises]);

  // Exercises currently in this program
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

  // Filtered exercises for adding/library
  const filteredLibrary = useMemo(() => {
    return exercises.filter((ex) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        (ex.nameAr && ex.nameAr.includes(q)) ||
        ex.muscle.toLowerCase().includes(q);
      const matchEquip = selectedEquipment === "all" || ex.equipment === selectedEquipment;
      return matchSearch && matchEquip;
    });
  }, [exercises, search, selectedEquipment]);

  const toggleExerciseInProgram = (exerciseId) => {
    if (!selectedProgram) return;
    const currentList = [...(selectedProgram.exercises || [])];
    const idx = currentList.indexOf(exerciseId);
    if (idx >= 0) {
      currentList.splice(idx, 1);
    } else {
      currentList.push(exerciseId);
    }
    updateProgram(selectedProgramId, { exercises: Array.from(new Set(currentList)) });
  };

  const handleSaveExercise = () => {
    if (!form.name.trim()) return;
    if (editingExercise) {
      updateExercise(editingExercise.id, form);
    } else {
      addExercise(form);
    }
    setShowAddModal(false);
    setEditingExercise(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER (Matches Reference Panel 5) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/exercises")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Back to exercises"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Manage Exercises</h1>

        <button
          type="button"
          onClick={() => {
            setEditingExercise(null);
            setForm({
              name: "",
              nameAr: "",
              muscle: "Chest",
              equipment: "barbell",
              targetAngle: "mid_chest",
              tips: "",
              default_sets: 3,
              default_reps: 10,
            });
            setShowAddModal(true);
          }}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#C4E58A] flex items-center justify-center transition-all active:scale-95"
          aria-label="Create new exercise"
          title="New Exercise"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ═══ SEGMENTED TOGGLE (Matches Reference Panel 5) ═══ */}
      <div className="grid grid-cols-2 gap-1 bg-[#142332] p-1 rounded-2xl border border-[#223348]">
        <button
          type="button"
          onClick={() => setView("library")}
          className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
            view === "library"
              ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
              : "text-[#8E9FA5] hover:text-[#F1F5F7]"
          }`}
        >
          Exercise Library
        </button>
        <button
          type="button"
          onClick={() => setView("builder")}
          className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
            view === "builder"
              ? "bg-[#C4E58A] text-[#0D1723] shadow-sm"
              : "text-[#8E9FA5] hover:text-[#F1F5F7]"
          }`}
        >
          Workout Builder
        </button>
      </div>

      {/* ═══ ROUTINE / PROGRAM SELECTOR PILLS ═══ */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {programList.map((prog) => {
          const isSelected = prog.id === selectedProgramId;
          return (
            <button
              key={prog.id}
              type="button"
              onClick={() => setSelectedProgramId(prog.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? "bg-[#73C8B4]/15 text-[#73C8B4] border-[#73C8B4]/40 font-bold"
                  : "bg-[#142332] text-[#8E9FA5] border-[#223348] hover:border-[#2B4660]"
              }`}
            >
              <span>{prog.name}</span>
              <span className="text-[10px] opacity-70 font-mono">({prog.exercises?.length || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Biomechanical Angle Warning Banner */}
      <AngleCoverageBadge
        exercises={currentProgramExerciseObjs}
        programContext={selectedProgram?.id || selectedProgram?.name}
        compact
      />

      {/* ═══ SEARCH BAR ═══ */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search size={16} className="text-[#8E9FA5]" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#142332] border border-[#223348] rounded-2xl py-3 pl-10 pr-10 text-xs sm:text-sm text-[#F1F5F7] focus:outline-none focus:border-[#73C8B4] transition-all placeholder:text-[#64748B]"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-3.5 flex items-center text-[#8E9FA5] hover:text-[#F1F5F7]"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ═══ WORKOUT BUILDER VIEW (Matches Reference Panel 5) ═══ */}
      {view === "builder" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {programExercises.map((ex, index) => (
              <div
                key={ex.id}
                className="rounded-2xl bg-[#142332] border border-[#223348] p-3 flex items-center justify-between gap-3 hover:border-[#2B4660] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Badge */}
                  <span className="w-6 h-6 rounded-lg bg-[#192C3C] text-[#8E9FA5] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Illustrated Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center shrink-0 p-1">
                    <img
                      src={getImageUrl(ex.image || `/exercises/${ex.id}.png`)}
                      alt={ex.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getImageUrl("/exercises/chest_bb_flat_bench.png");
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#F1F5F7] truncate">{ex.name}</h3>
                    <p className="text-[11px] text-[#8E9FA5] mt-0.5">
                      {ex.default_sets || 3} sets • {ex.default_reps || 10} reps
                    </p>
                  </div>
                </div>

                {/* Remove / Options Button */}
                <button
                  type="button"
                  onClick={() => toggleExerciseInProgram(ex.id)}
                  className="w-8 h-8 rounded-xl bg-[#192C3C] text-[#8E9FA5] hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center shrink-0"
                  aria-label={`Remove ${ex.name}`}
                  title="Remove from routine"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Primary Action Button: + Add Exercise (Matches Reference Panel 5) */}
          <button
            type="button"
            onClick={() => setView("library")}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold text-xs sm:text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(196,229,138,0.25)]"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Exercise</span>
          </button>
        </div>
      ) : (
        /* ═══ EXERCISE LIBRARY PICKER VIEW ═══ */
        <div className="space-y-2">
          {filteredLibrary.map((ex) => {
            const inRoutine = selectedProgram?.exercises?.includes(ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => toggleExerciseInProgram(ex.id)}
                className={`rounded-2xl p-3 flex items-center justify-between gap-3 border cursor-pointer transition-all active:scale-[0.99] ${
                  inRoutine
                    ? "bg-[#C4E58A]/[0.08] border-[#C4E58A]/40"
                    : "bg-[#142332] border-[#223348] hover:border-[#2B4660]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center shrink-0 p-1">
                    <img
                      src={getImageUrl(ex.image || `/exercises/${ex.id}.png`)}
                      alt={ex.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#F1F5F7] truncate">{ex.name}</h3>
                    <p className="text-[11px] text-[#8E9FA5] capitalize">{ex.muscle} • {ex.equipment || "Barbell"}</p>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    inRoutine
                      ? "bg-[#C4E58A] text-[#0D1723]"
                      : "bg-[#192C3C] text-[#8E9FA5] border border-[#223348]"
                  }`}
                >
                  {inRoutine ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ADD / EDIT EXERCISE MODAL ═══ */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#142332] rounded-3xl w-full max-w-sm border border-[#223348] overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#223348] pb-3">
              <h3 className="font-bold text-sm text-[#F1F5F7]">
                {editingExercise ? "Edit Exercise" : "Create New Exercise"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8E9FA5] hover:text-[#F1F5F7]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Name (English)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Incline Cable Fly"
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7] focus:outline-none focus:border-[#73C8B4]"
                />
              </div>

              <div>
                <label className="block text-[#8E9FA5] font-medium mb-1">Muscle Group</label>
                <select
                  value={form.muscle}
                  onChange={(e) => setForm({ ...form, muscle: e.target.value })}
                  className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7] focus:outline-none focus:border-[#73C8B4]"
                >
                  {["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8E9FA5] font-medium mb-1">Default Sets</label>
                  <input
                    type="number"
                    value={form.default_sets}
                    onChange={(e) => setForm({ ...form, default_sets: Number(e.target.value) })}
                    className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E9FA5] font-medium mb-1">Default Reps</label>
                  <input
                    type="number"
                    value={form.default_reps}
                    onChange={(e) => setForm({ ...form, default_reps: Number(e.target.value) })}
                    className="w-full bg-[#0D1723] border border-[#223348] rounded-xl p-2.5 text-[#F1F5F7]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveExercise}
              className="w-full py-2.5 bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold rounded-xl text-xs transition-all active:scale-95 mt-2"
            >
              Save Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
