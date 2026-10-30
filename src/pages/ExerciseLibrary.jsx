import { useState, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  X,
  ArrowLeft,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const exercises = useWorkoutStore((s) => s.exercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // Default to list matching reference panel 4

  const muscles = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.nameAr && ex.nameAr.includes(searchTerm));
      const matchesMuscle =
        selectedMuscle === "All" ||
        ex.muscle?.toLowerCase() === selectedMuscle.toLowerCase() ||
        ex.primaryMuscle?.toLowerCase() === selectedMuscle.toLowerCase();
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn text-[#F1F5F7]">
      {/* ═══ TOP HEADER (Matches Reference Panel 4) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Exercise Library</h1>
          <p className="text-[11px] text-[#8E9FA5]">{exercises.length} exercises</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-[#142332] rounded-xl p-1 border border-[#223348]">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-[#C4E58A] text-[#0D1723] shadow-sm font-bold"
                : "text-[#8E9FA5] hover:text-[#F1F5F7]"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-[#C4E58A] text-[#0D1723] shadow-sm font-bold"
                : "text-[#8E9FA5] hover:text-[#F1F5F7]"
            }`}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* ═══ SEARCH BAR (Matches Reference Panel 4) ═══ */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search size={16} className="text-[#8E9FA5]" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#142332] border border-[#223348] rounded-2xl py-3 pl-10 pr-10 text-xs sm:text-sm text-[#F1F5F7] focus:outline-none focus:border-[#73C8B4] focus:ring-1 focus:ring-[#73C8B4] transition-all placeholder:text-[#64748B]"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3.5 flex items-center text-[#8E9FA5] hover:text-[#F1F5F7]"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ═══ MUSCLE FILTER CHIPS (Matches Reference Panel 4) ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 select-none">
        {muscles.map((m) => {
          const isActive = selectedMuscle === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border ${
                isActive
                  ? "bg-[#C4E58A] text-[#0D1723] font-bold border-[#C4E58A] shadow-[0_0_12px_rgba(196,229,138,0.3)]"
                  : "bg-[#142332] text-[#8E9FA5] border-[#223348] hover:text-[#F1F5F7] hover:border-[#2B4660]"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* ═══ EXERCISE CARDS LIST (Matches Reference Panel 4) ═══ */}
      {viewMode === "list" ? (
        <div className="space-y-2.5">
          {filteredExercises.map((exercise) => {
            const equipmentLabel = exercise.equipment || "Barbell";
            return (
              <div
                key={exercise.id}
                className="rounded-2xl bg-[#142332] border border-[#223348] p-3 flex items-center justify-between gap-3 hover:border-[#2B4660] transition-all active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Movement Illustrated Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center shrink-0 p-1">
                    <img
                      src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                      alt={exercise.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/exercises/chest_bb_flat_bench.png";
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-bold text-[#F1F5F7] truncate leading-tight">
                      {exercise.name}
                    </h3>
                    <p className="text-[11px] text-[#8E9FA5] truncate capitalize">
                      {exercise.muscle} • {equipmentLabel}
                    </p>
                    {exercise.targetAngle && (
                      <span className="text-[9px] text-[#73C8B4] font-medium block">
                        Target: {exercise.targetAngle.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Green '+' Action Pill Button */}
                <button
                  type="button"
                  onClick={() => navigate("/exercises/manage")}
                  className="w-8 h-8 rounded-full bg-[#C4E58A]/15 hover:bg-[#C4E58A] text-[#C4E58A] hover:text-[#0D1723] flex items-center justify-center transition-all active:scale-90 shrink-0 border border-[#C4E58A]/30"
                  aria-label={`Select ${exercise.name}`}
                  title="Add to workout"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 gap-3">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-2xl bg-[#142332] border border-[#223348] p-3 flex flex-col justify-between hover:border-[#2B4660] transition-all shadow-sm"
            >
              <div className="w-full h-28 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center p-1 mb-2">
                <img
                  src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/exercises/chest_bb_flat_bench.png";
                  }}
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F1F5F7] truncate">{exercise.name}</h3>
                <p className="text-[10px] text-[#8E9FA5] capitalize">{exercise.muscle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#142332] border border-[#223348] space-y-2">
          <p className="text-sm font-bold text-[#F1F5F7]">No exercises found</p>
          <p className="text-xs text-[#8E9FA5]">Try adjusting your search terms or filter category.</p>
        </div>
      )}
    </div>
  );
}
