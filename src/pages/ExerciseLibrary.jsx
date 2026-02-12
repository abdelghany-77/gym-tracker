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
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Exercise Library
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{exercises.length} exercises</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/exercises/manage")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
            aria-label="Manage exercises"
          >
            <Settings size={13} />
            Manage
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
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-transparent transition-all placeholder:text-slate-500"
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

      {/* Muscle Filter Chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4">
        {muscles.map((m) => {
          const count =
            m === "All"
              ? exercises.length
              : exercises.filter((e) => e.muscle === m).length;
          const isActive = selectedMuscle === m;

          // Determine active color style
          let activeStyle = "bg-neon-blue text-slate-950 font-semibold shadow-lg shadow-neon-blue/20 border-neon-blue";
          if (isActive && m !== "All") {
             // Use specific muscle color for active state if available, else neon-blue
             if (m === "Chest") activeStyle = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20";
             else if (m === "Back") activeStyle = "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20";
             else if (m === "Shoulders") activeStyle = "bg-amber-500 text-slate-900 border-amber-500 shadow-lg shadow-amber-500/20";
             else if (m === "Arms") activeStyle = "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20";
             else if (m === "Legs") activeStyle = "bg-emerald-500 text-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/20";
          }

          return (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-4 py-2 rounded-full text-[11px] whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isActive
                  ? activeStyle
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:bg-slate-750"
              }`}
            >
              {m}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-black/20" : "bg-slate-700 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Exercise Display */}
      <div className="space-y-8">
        {Object.entries(groupedExercises).map(([muscle, group]) => {
          const MuscleIcon = muscleIcons[muscle] || Target;
          return (
            <div key={muscle} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MuscleIcon size={18} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-300">
                  {muscle}
                </h2>
                <span className="text-[10px] text-slate-600 font-medium bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {group.length} exercises
                </span>
                <div className="h-px bg-slate-800 flex-1 ml-2" />
              </div>

              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-3">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all active:scale-[0.98]"
                    >
                      <img
                        src={getImageUrl(exercise.image)}
                        alt={exercise.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
                        <div
                          className={`self-start text-[10px] px-2 py-0.5 rounded-full border mb-1.5 ${
                            muscleColors[exercise.muscle] ||
                            "bg-slate-700 text-slate-300 border-slate-600"
                          }`}
                        >
                          {exercise.muscle}
                        </div>
                        <h3 className="font-semibold text-white text-sm leading-tight">
                          {exercise.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 hover:border-slate-600/80 transition-all active:scale-[0.99]"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-700 shrink-0 border border-slate-600/30">
                        <img
                          src={getImageUrl(exercise.image)}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-sm">
                          {exercise.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              muscleColors[exercise.muscle] ||
                              "bg-slate-700 text-slate-300 border-slate-600"
                            }`}
                          >
                            {exercise.muscle}
                          </span>
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
