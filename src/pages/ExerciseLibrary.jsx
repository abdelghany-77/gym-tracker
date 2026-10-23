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
  const [viewMode, setViewMode] = useState("list");

  // Unique muscles
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

  // Group by muscle
  const groupedExercises = useMemo(() => {
    return filteredExercises.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});
  }, [filteredExercises]);

  const muscleColors = {
    Chest: "bg-red-500/10 text-red-400 border-red-500/20",
    Back: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Shoulders: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Arms: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Legs: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="px-4 pt-4 pb-24 space-y-3.5 max-w-lg mx-auto animate-fadeIn">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Exercise Library</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{exercises.length} exercises cataloged</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/exercises/manage")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-elevated text-slate-300 text-xs font-medium border border-border hover:bg-surface-hover hover:text-white transition-all"
            aria-label="Manage exercises"
          >
            <Settings size={13} className="text-teal-400" />
            Manage
          </button>
          <div className="flex bg-surface-elevated rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="Grid view"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, angle, or equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl py-2.5 pl-9 pr-9 text-xs text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-all placeholder:text-slate-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Muscle Filter Chips */}
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
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isActive
                  ? "bg-teal-500 text-slate-950 font-bold border-teal-500"
                  : "bg-surface text-slate-400 border-border hover:border-slate-600 hover:text-white"
              }`}
            >
              {m}
              <span className={`text-[10px] font-mono px-1 rounded-full ${
                isActive ? "bg-slate-950/20 text-slate-950" : "text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Exercise Display */}
      <div className="space-y-5">
        {Object.entries(groupedExercises).map(([muscle, group]) => {
          const MuscleIcon = muscleIcons[muscle] || Target;
          return (
            <div key={muscle} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <MuscleIcon size={14} className="text-teal-400" />
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {muscle}
                </h2>
                <span className="text-[10px] text-slate-400 bg-surface-elevated border border-border px-1.5 py-0.5 rounded-full font-mono">
                  {group.length}
                </span>
                <div className="h-px bg-border flex-1 ml-1" />
              </div>

              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 gap-2">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="group relative aspect-square rounded-xl overflow-hidden glass-card hover:border-slate-500 transition-all active:scale-[0.98]"
                    >
                      <img
                        src={getImageUrl(exercise.image || `/exercises/${exercise.id}.png`)}
                        alt={exercise.name}
                        className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity bg-background"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getImageUrl("/icons/dumbbell.svg");
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-2.5 pointer-events-none">
                        <div
                          className={`self-start text-[9px] px-1.5 py-0.5 rounded-full border mb-1 ${
                            muscleColors[exercise.muscle] || "bg-surface text-slate-300 border-border"
                          }`}
                        >
                          {exercise.muscle}
                        </div>
                        <h3 className="font-semibold text-white text-xs leading-tight truncate">{exercise.name}</h3>
                        {exercise.nameAr && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5" dir="rtl">{exercise.nameAr}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-1.5">
                  {group.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 glass-card p-2.5 hover:border-slate-500 transition-all active:scale-[0.99]"
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-background shrink-0 border border-border p-1 flex items-center justify-center">
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
                        <h3 className="font-semibold text-white truncate text-xs">{exercise.name}</h3>
                        {exercise.nameAr && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5" dir="rtl">{exercise.nameAr}</p>
                        )}
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border shrink-0 ${
                        muscleColors[exercise.muscle] || "bg-surface text-slate-300 border-border"
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
          <div className="text-center py-10 px-4 rounded-xl glass-card border-dashed">
            <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400 border border-border">
              <Search size={16} />
            </div>
            <p className="text-white font-medium text-xs">No exercises match search</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try searching for other keywords or muscles</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedMuscle("All"); }}
              className="mt-3 px-3 py-1.5 bg-surface hover:bg-surface-hover text-white text-xs rounded-lg transition-colors border border-border"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
