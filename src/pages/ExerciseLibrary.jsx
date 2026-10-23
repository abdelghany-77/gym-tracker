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
  const [viewMode, setViewMode] = useState("list"); // Default to list for mobile

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
    <div className="px-4 pt-5 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Exercise Library</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">{exercises.length} exercises</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/exercises/manage")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-card text-slate-400 text-[11px] border border-border-slate hover:bg-slate-700 hover:text-white transition-all"
            aria-label="Manage exercises"
          >
            <Settings size={12} />
            Manage
          </button>
          <div className="flex bg-bg-card rounded-lg p-0.5 border border-border-slate">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-label="Grid view"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar — immediately accessible */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-bg-card border border-border-slate rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition-all placeholder:text-slate-500"
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

      {/* Muscle Filter Chips — compact horizontal row */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-hide -mx-4 px-4">
        {muscles.map((m) => {
          const count =
            m === "All"
              ? exercises.length
              : exercises.filter((e) => e.muscle === m).length;
          const isActive = selectedMuscle === m;

          return (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all border flex items-center gap-1 ${
                isActive
                  ? "bg-accent text-bg-deep font-semibold border-accent"
                  : "bg-bg-card text-slate-400 border-border-slate hover:border-slate-600"
              }`}
            >
              {m}
              <span className={`text-[9px] px-1 py-0.5 rounded-full ${
                isActive ? "bg-black/20" : "bg-slate-700/50 text-slate-500"
              }`}>
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
            <div key={muscle} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <MuscleIcon size={14} className="text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {muscle}
                </h2>
                <span className="text-[9px] text-slate-600 bg-bg-card px-1.5 py-0.5 rounded-full">
                  {group.length}
                </span>
                <div className="h-px bg-border-slate flex-1 ml-1" />
              </div>

              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-2">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-bg-card border border-border-slate hover:border-slate-600 transition-all active:scale-[0.98]"
                    >
                      <img
                        src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                        alt={exercise.name}
                        className="w-full h-full object-contain p-2 opacity-85 group-hover:opacity-100 transition-opacity bg-bg-deep"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getImageUrl("/icons/dumbbell.svg");
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5 pointer-events-none">
                        <div
                          className={`self-start text-[9px] px-1.5 py-0.5 rounded-full border mb-1 ${
                            muscleColors[exercise.muscle] || "bg-slate-700 text-slate-300 border-slate-600"
                          }`}
                        >
                          {exercise.muscle}
                        </div>
                        <h3 className="font-semibold text-white text-xs leading-tight">{exercise.name}</h3>
                        {exercise.nameAr && (
                          <p className="text-[10px] text-slate-400 truncate" dir="rtl">{exercise.nameAr}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View — compact scannable list */
                <div className="space-y-1.5">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 bg-bg-card p-2.5 rounded-xl border border-border-slate hover:border-slate-600 transition-all active:scale-[0.99]"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-deep shrink-0 border border-border-slate p-1 flex items-center justify-center">
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
                        <h3 className="font-medium text-white truncate text-sm">{exercise.name}</h3>
                        {exercise.nameAr && (
                          <p className="text-[10px] text-slate-500 truncate" dir="rtl">{exercise.nameAr}</p>
                        )}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                        muscleColors[exercise.muscle] || "bg-slate-700 text-slate-300 border-slate-600"
                      }`}>
                        {exercise.muscle}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="text-center py-10 px-4 rounded-xl bg-bg-card border border-dashed border-border-slate">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
              <Search size={16} />
            </div>
            <p className="text-slate-400 font-medium text-sm">No exercises found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search or filter</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedMuscle("All"); }}
              className="mt-3 px-3 py-1.5 bg-bg-card hover:bg-slate-700 text-white text-xs rounded-lg transition-colors border border-border-slate"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
