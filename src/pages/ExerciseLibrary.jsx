import { useState, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  X,
  Settings,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import ExerciseImage from "../components/ExerciseImage";
import ExerciseDetails from "../components/ExerciseDetails";

export default function ExerciseLibrary() {
  const exercises = useWorkoutStore((s) => s.exercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const selectedExercise = exercises.find(
    (exercise) => exercise.id === selectedId,
  );
  const muscles = [
    "All",
    ...new Set(exercises.map((exercise) => exercise.muscle).filter(Boolean)),
  ];
  const equipment = [
    ...new Set(exercises.map((exercise) => exercise.equipment).filter(Boolean)),
  ].sort();

  const filteredExercises = useMemo(() => {
    const words = searchTerm
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return exercises.filter((exercise) => {
      const searchable = [
        exercise.name,
        exercise.nameAr,
        exercise.muscle,
        exercise.equipment,
        exercise.primaryTarget,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return (
        words.every((word) => searchable.includes(word)) &&
        (selectedMuscle === "All" || exercise.muscle === selectedMuscle) &&
        (selectedEquipment === "All" ||
          exercise.equipment === selectedEquipment)
      );
    });
  }, [exercises, searchTerm, selectedMuscle, selectedEquipment]);

  const groupedExercises = useMemo(
    () =>
      filteredExercises.reduce((groups, exercise) => {
        const muscle = exercise.muscle || "Other";
        (groups[muscle] ||= []).push(exercise);
        return groups;
      }, {}),
    [filteredExercises],
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
  };
  const hasFilters =
    searchTerm || selectedMuscle !== "All" || selectedEquipment !== "All";

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan mb-2">
            Move with confidence
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Exercise Library
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Explore {exercises.length} exercises. Open any exercise for setup,
            cues and common mistakes.
          </p>
        </div>
        <Link
          to="/exercises/manage"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          <Settings size={16} aria-hidden="true" /> Manage
        </Link>
      </header>

      <section
        aria-label="Exercise filters"
        className="space-y-4 rounded-2xl border border-border-slate bg-bg-surface p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="exercise-search" className="sr-only">
              Search exercises
            </label>
            <input
              id="exercise-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, muscle or equipment…"
              className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Equipment</span>
            <select
              value={selectedEquipment}
              onChange={(event) => setSelectedEquipment(event.target.value)}
              className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white capitalize"
            >
              <option value="All">All equipment</option>
              {equipment.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Muscle group"
        >
          {muscles.map((muscle) => (
            <button
              key={muscle}
              type="button"
              aria-pressed={selectedMuscle === muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`min-h-10 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${selectedMuscle === muscle ? "border-neon-cyan bg-neon-cyan text-slate-950" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"}`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-sm text-slate-400">
          {filteredExercises.length}{" "}
          {filteredExercises.length === 1 ? "exercise" : "exercises"}
          {hasFilters ? " found" : " to explore"}
        </p>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-11 text-xs font-semibold text-neon-cyan"
            >
              Reset filters
            </button>
          )}
          <div
            className="inline-flex rounded-xl border border-slate-700 bg-slate-800 p-1"
            role="group"
            aria-label="View mode"
          >
            {[
              { id: "grid", Icon: Grid },
              { id: "list", Icon: List },
            ].map(({ id, Icon }) => (
              <button
                type="button"
                key={id}
                aria-label={`${id === "grid" ? "Grid" : "List"} view`}
                aria-pressed={viewMode === id}
                onClick={() => setViewMode(id)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${viewMode === id ? "bg-slate-700 text-white" : "text-slate-400"}`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedExercises).map(([muscle, group]) => (
          <section
            key={muscle}
            aria-label={`${muscle} exercises`}
            className="space-y-3"
          >
            <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
              {muscle}
              <span className="text-xs font-normal text-slate-400">
                {group.length} exercises
              </span>
            </h2>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
                  : "grid gap-3"
              }
            >
              {group.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setSelectedId(exercise.id)}
                  aria-label={`View ${exercise.name} details`}
                  aria-haspopup="dialog"
                  className={`group overflow-hidden rounded-2xl border border-slate-700/70 bg-bg-surface text-left transition-colors hover:border-neon-cyan/50 ${viewMode === "list" ? "flex items-center gap-4 p-3" : "flex flex-col"}`}
                >
                  <ExerciseImage
                    exercise={exercise}
                    compact={viewMode === "list"}
                    className={
                      viewMode === "grid"
                        ? "aspect-[4/3] w-full border-b border-slate-700/50 p-2"
                        : "h-20 w-24 shrink-0 rounded-xl p-1"
                    }
                  />
                  <div
                    className={`min-w-0 flex-1 ${viewMode === "grid" ? "p-3 sm:p-4" : "py-1"}`}
                  >
                    <p className="font-semibold leading-snug text-white group-hover:text-neon-cyan text-sm">
                      {exercise.name}
                    </p>
                    {exercise.nameAr && (
                      <p
                        lang="ar"
                        dir="rtl"
                        className="mt-1 text-xs leading-relaxed text-slate-400"
                      >
                        {exercise.nameAr}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400 capitalize">
                      {exercise.equipment || "No equipment specified"}
                    </p>
                  </div>
                  {viewMode === "list" && (
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
        {filteredExercises.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-16 text-center">
            <Search
              size={28}
              className="mx-auto mb-4 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="font-semibold text-white">No exercises found</h2>
            <p className="mt-2 text-sm text-slate-400">
              Try another name, muscle group or equipment type.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <ExerciseDetails
        exercise={selectedExercise}
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
