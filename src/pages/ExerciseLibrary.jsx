import { useState, useMemo } from "react";
import { Search, ChevronDown, Info, X } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const muscleFilters = ["All", "Chest", "Back", "Shoulders", "Legs", "Arms"];

const muscleColorMap = {
  Chest: "bg-red-500/15 text-red-400",
  Back: "bg-blue-500/15 text-blue-400",
  Shoulders: "bg-amber-500/15 text-amber-400",
  Arms: "bg-purple-500/15 text-purple-400",
  Legs: "bg-emerald-500/15 text-emerald-400",
};

export default function ExerciseLibrary() {
  const allExercises = useWorkoutStore((s) => s.getAllExercises());
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || ex.muscle === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allExercises, search, activeFilter]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">Exercise Library</h1>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
        />
      </div>

      {/* Muscle Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {muscleFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 border ${
              activeFilter === filter
                ? "bg-neon-blue/15 text-neon-blue border-neon-blue/30"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="space-y-3">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="w-full bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] overflow-hidden text-left"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {exercise.name}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                    muscleColorMap[exercise.muscle] ||
                    "bg-slate-800 text-slate-400"
                  }`}
                >
                  {exercise.muscle}
                </span>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span>
                    {exercise.default_sets} sets × {exercise.default_reps} reps
                  </span>
                  {personalRecords[exercise.id] && (
                    <span className="text-amber-400">
                      PR: {personalRecords[exercise.id]} kg
                    </span>
                  )}
                </div>
              </div>
              <Info size={16} className="text-slate-600 shrink-0" />
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No exercises found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-lg border-t sm:border border-slate-700 p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {selectedExercise.name}
              </h3>
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Image */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-800">
              <img
                src={selectedExercise.image}
                alt={selectedExercise.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    muscleColorMap[selectedExercise.muscle] ||
                    "bg-slate-800 text-slate-400"
                  }`}
                >
                  {selectedExercise.muscle}
                </span>
                <span className="text-xs text-slate-500">
                  {selectedExercise.default_sets} ×{" "}
                  {selectedExercise.default_reps}
                </span>
                {personalRecords[selectedExercise.id] && (
                  <span className="text-xs text-amber-400 ml-auto">
                    PR: {personalRecords[selectedExercise.id]} kg
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
                  How to Perform
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedExercise.tips}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
