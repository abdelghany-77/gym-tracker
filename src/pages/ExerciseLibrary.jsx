import { useState, useMemo } from "react";
import { Search, Grid, List, X, Target, Layers, ChevronsUp, Dumbbell, Footprints, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import { getImageUrl } from "../utils/imageUtil";

const muscleIcons = {
  Chest: Target,
  Back: Layers,
  Shoulders: ChevronsUp,
  Arms: Dumbbell,
  Legs: Footprints,
};

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const exercises = useWorkoutStore((s) => s.exercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // Default to grid

  // Get unique muscles
  const muscles = ["All", ...new Set(exercises.map((e) => e.muscle))];

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMuscle =
        selectedMuscle === "All" || ex.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  // Use reduce to group by muscle
  const groupedExercises = useMemo(() => {
    return filteredExercises.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});
  }, [filteredExercises]);

  // Color map for muscle badges
  const muscleColors = {
    Chest: "bg-red-500/10 text-red-400 border-red-500/20",
    Back: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Shoulders: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Arms: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Legs: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="page-shell pt-4 space-y-5 pb-24">
      <header className="flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Exercise Library
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{exercises.length} exercises</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/exercises/manage")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            aria-label="Manage exercises"
          >
            <Settings size={13} />
            <span>Manage</span>
          </button>
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-transparent transition-all placeholder:text-slate-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={14} className="bg-slate-700 rounded-full p-0.5 w-5 h-5" />
          </button>
        )}
      </div>

      {/* Muscle Filter Chips (Fixed shrink-0 so they never squash into circles) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 select-none">
        {muscles.map((m) => {
          const count =
            m === "All"
              ? exercises.length
              : exercises.filter((e) => e.muscle === m).length;
          const isActive = selectedMuscle === m;

          let activeStyle = "bg-neon-cyan text-slate-950 font-bold shadow-lg shadow-neon-cyan/25 border-neon-cyan";
          if (isActive && m !== "All") {
             if (m === "Chest") activeStyle = "bg-red-500 text-white font-bold border-red-500 shadow-lg shadow-red-500/25";
             else if (m === "Back") activeStyle = "bg-blue-500 text-white font-bold border-blue-500 shadow-lg shadow-blue-500/25";
             else if (m === "Shoulders") activeStyle = "bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-lg shadow-amber-500/25";
             else if (m === "Arms") activeStyle = "bg-purple-500 text-white font-bold border-purple-500 shadow-lg shadow-purple-500/25";
             else if (m === "Legs") activeStyle = "bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-lg shadow-emerald-500/25";
          }

          return (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? activeStyle
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{m}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/20 text-inherit" : "bg-slate-700 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Exercise Display */}
      <div className="space-y-6">
        {Object.entries(groupedExercises).map(([muscle, group]) => {
          const MuscleIcon = muscleIcons[muscle] || Target;
          return (
            <div key={muscle} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MuscleIcon size={16} className="text-neon-cyan shrink-0" />
                <h2 className="text-sm font-bold text-slate-200">
                  {muscle}
                </h2>
                <span className="text-[10px] text-slate-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50 font-mono">
                  {group.length}
                </span>
                <div className="h-px bg-slate-800 flex-1 ml-2" />
              </div>

              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-[#121824] border border-border-slate hover:border-neon-cyan/40 transition-all active:scale-[0.98] shadow-md flex flex-col justify-between"
                    >
                      <div className="w-full flex-1 flex items-center justify-center p-2 overflow-hidden bg-[#0B0F17]">
                        <img
                          src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                          alt={exercise.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageUrl("/icons/dumbbell.svg");
                          }}
                        />
                      </div>
                      <div className="p-2.5 bg-bg-surface/90 border-t border-border-slate/60 backdrop-blur-sm">
                        <div
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md border mb-1 ${
                            muscleColors[exercise.muscle] ||
                            "bg-slate-700 text-slate-300 border-slate-600"
                          }`}
                        >
                          {exercise.muscle}
                        </div>
                        <h3 className="font-semibold text-white text-xs leading-snug truncate">
                          {exercise.name}
                        </h3>
                        {exercise.nameAr && (
                          <p className="text-[10px] text-slate-400 truncate" dir="rtl">
                            {exercise.nameAr}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-2">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 bg-bg-surface/70 p-2.5 rounded-2xl border border-border-slate hover:border-slate-600/80 transition-all active:scale-[0.99]"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0B0F17] shrink-0 border border-[#1E293B] p-1 flex items-center justify-center">
                        <img
                          src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                          alt={exercise.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageUrl("/icons/dumbbell.svg");
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-sm">
                          {exercise.name}
                        </h3>
                        {exercise.nameAr && (
                          <p className="text-[11px] text-slate-400 truncate" dir="rtl">
                            {exercise.nameAr}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                              muscleColors[exercise.muscle] ||
                              "bg-slate-700 text-slate-300 border-slate-600"
                            }`}
                          >
                            {exercise.muscle}
                          </span>
                          {exercise.category && (
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                              {exercise.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-800/20 border border-dashed border-slate-700/50">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Search size={20} />
            </div>
            <p className="text-slate-400 font-medium">No exercises found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedMuscle("All");
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl transition-colors border border-slate-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
