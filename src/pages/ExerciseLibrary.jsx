import { useState, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  X,
  Settings,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeftRight,
  Film,
  User,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import ExerciseImage from "../components/ExerciseImage";
import ExerciseDetails from "../components/ExerciseDetails";
import AnatomyBodyMap from "../components/AnatomyBodyMap";
import ExerciseCompareModal from "../components/ExerciseCompareModal";
import { getExerciseMediaInfo } from "../utils/imageUtil";
import { getAngleLabel } from "../utils/angleUtils";

const DIFFICULTY_OPTIONS = [
  { id: "All", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const PAGE_SIZE = 24;

export default function ExerciseLibrary() {
  const exercises = useWorkoutStore((s) => s.exercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedAngle, setSelectedAngle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const filterSignature = `${searchTerm}|${selectedMuscle}|${selectedAngle}|${selectedEquipment}|${selectedDifficulty}|${verifiedOnly}`;
  const [prevFilterSig, setPrevFilterSig] = useState(filterSignature);
  if (filterSignature !== prevFilterSig) {
    setPrevFilterSig(filterSignature);
    setVisibleLimit(PAGE_SIZE);
  }

  const selectedExercise = exercises.find(
    (exercise) => exercise.id === selectedId,
  );

  const countsByMuscle = useMemo(() => {
    const counts = {};
    for (const ex of exercises) {
      if (ex.muscle) counts[ex.muscle] = (counts[ex.muscle] || 0) + 1;
    }
    return counts;
  }, [exercises]);

  const verifiedCount = useMemo(
    () =>
      exercises.filter((ex) => getExerciseMediaInfo(ex).hasVerifiedDualMedia)
        .length,
    [exercises],
  );

  const muscles = useMemo(
    () => [
      "All",
      ...new Set(exercises.map((exercise) => exercise.muscle).filter(Boolean)),
    ],
    [exercises],
  );

  const availableAngles = useMemo(() => {
    const scoped =
      selectedMuscle === "All"
        ? exercises
        : exercises.filter((ex) => ex.muscle === selectedMuscle);
    const unique = Array.from(
      new Set(scoped.map((ex) => ex.targetAngle).filter(Boolean)),
    );
    return unique.sort((a, b) => {
      const la = getAngleLabel(a)?.en || a;
      const lb = getAngleLabel(b)?.en || b;
      return la.localeCompare(lb);
    });
  }, [exercises, selectedMuscle]);

  const equipment = useMemo(
    () =>
      [
        ...new Set(
          exercises.map((exercise) => exercise.equipment).filter(Boolean),
        ),
      ].sort(),
    [exercises],
  );

  const handleMuscleSelect = (muscle) => {
    setSelectedMuscle(muscle);
    setSelectedAngle("All");
  };

  const filteredExercises = useMemo(() => {
    const words = searchTerm
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return exercises.filter((exercise) => {
      const angleText = getAngleLabel(exercise.targetAngle);
      const searchable = [
        exercise.name,
        exercise.nameAr,
        exercise.muscle,
        exercise.equipment,
        exercise.primaryTarget,
        angleText?.en,
        angleText?.ar,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      const media = getExerciseMediaInfo(exercise);
      return (
        words.every((word) => searchable.includes(word)) &&
        (selectedMuscle === "All" || exercise.muscle === selectedMuscle) &&
        (selectedAngle === "All" || exercise.targetAngle === selectedAngle) &&
        (selectedEquipment === "All" ||
          exercise.equipment === selectedEquipment) &&
        (selectedDifficulty === "All" ||
          (exercise.difficulty || "intermediate") === selectedDifficulty) &&
        (!verifiedOnly || media.hasVerifiedDualMedia)
      );
    });
  }, [
    exercises,
    searchTerm,
    selectedMuscle,
    selectedAngle,
    selectedEquipment,
    selectedDifficulty,
    verifiedOnly,
  ]);

  const visibleExercises = useMemo(
    () => filteredExercises.slice(0, visibleLimit),
    [filteredExercises, visibleLimit],
  );

  const groupedExercises = useMemo(
    () =>
      visibleExercises.reduce((groups, exercise) => {
        const muscle = exercise.muscle || "Other";
        (groups[muscle] ||= []).push(exercise);
        return groups;
      }, {}),
    [visibleExercises],
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscle("All");
    setSelectedAngle("All");
    setSelectedEquipment("All");
    setSelectedDifficulty("All");
    setVerifiedOnly(false);
  };

  const hasFilters =
    Boolean(searchTerm) ||
    selectedMuscle !== "All" ||
    selectedAngle !== "All" ||
    selectedEquipment !== "All" ||
    selectedDifficulty !== "All" ||
    verifiedOnly;

  const toggleCompare = (exerciseId) => {
    setCompareIds((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), exerciseId];
      }
      return [...prev, exerciseId];
    });
  };

  const openCompareForExercise = (exercise) => {
    const sameAngleAlternatives = exercises
      .filter(
        (candidate) =>
          candidate.id !== exercise.id &&
          candidate.targetAngle === exercise.targetAngle,
      )
      .slice(0, 2)
      .map((candidate) => candidate.id);

    const fallbackSameMuscle =
      sameAngleAlternatives.length === 0
        ? exercises
            .filter(
              (candidate) =>
                candidate.id !== exercise.id &&
                candidate.muscle === exercise.muscle,
            )
            .slice(0, 1)
            .map((candidate) => candidate.id)
        : [];

    setSelectedId(null);
    setCompareIds([
      exercise.id,
      ...sameAngleAlternatives,
      ...fallbackSameMuscle,
    ]);
    setCompareOpen(true);
  };

  const handleOpenCompareBar = () => {
    if (compareIds.length === 1) {
      const base = exercises.find((ex) => ex.id === compareIds[0]);
      if (base) {
        const peer = exercises.find(
          (ex) => ex.id !== base.id && ex.targetAngle === base.targetAngle,
        );
        if (peer) {
          setCompareIds([base.id, peer.id]);
        }
      }
    }
    setCompareOpen(true);
  };

  return (
    <div
      className={`mx-auto max-w-6xl p-4 sm:p-6 space-y-6 ${
        compareIds.length > 0 ? "pb-24" : ""
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
            Exercise Encyclopedia
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Exercise Library
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Explore {exercises.length} exercises ({verifiedCount} with verified
            movement video & anatomy). Open any exercise for setup, cues and
            comparisons.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBodyMap((v) => !v)}
            aria-pressed={showBodyMap}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
              showBodyMap
                ? "border-slate-500 bg-slate-800 text-white"
                : "border-slate-800 bg-bg-surface text-slate-300 hover:text-white"
            }`}
          >
            <User size={16} aria-hidden="true" />
            Body Map
          </button>
          <Link
            to="/exercises/manage"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:text-white"
          >
            <Settings size={16} aria-hidden="true" /> Manage
          </Link>
        </div>
      </header>

      {/* Interactive Body Map + Multi-Dimensional Filters */}
      <div
        className={`grid gap-4 ${
          showBodyMap ? "grid-cols-1 lg:grid-cols-[310px_1fr]" : "grid-cols-1"
        }`}
      >
        {showBodyMap && (
          <AnatomyBodyMap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={handleMuscleSelect}
            countsByMuscle={countsByMuscle}
          />
        )}

        <section
          aria-label="Exercise filters"
          className="space-y-4 rounded-2xl border border-slate-800 bg-bg-surface p-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            {/* Search row */}
            <div className="relative">
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
                placeholder="Search by name (EN / AR), muscle angle, or equipment…"
                className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Angle, Equipment, Difficulty Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                <span>Muscle Angle / Emphasis</span>
                <select
                  aria-label="Muscle Angle"
                  value={selectedAngle}
                  onChange={(event) => setSelectedAngle(event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  <option value="All">All angles</option>
                  {availableAngles.map((angle) => {
                    const label = getAngleLabel(angle);
                    return (
                      <option key={angle} value={angle}>
                        {label?.en || angle}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal size={12} aria-hidden="true" />
                  Equipment
                </span>
                <select
                  aria-label="Equipment"
                  value={selectedEquipment}
                  onChange={(event) => setSelectedEquipment(event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white capitalize"
                >
                  <option value="All">All equipment</option>
                  {equipment.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-slate-400">
                <span>Difficulty</span>
                <select
                  aria-label="Difficulty"
                  value={selectedDifficulty}
                  onChange={(event) =>
                    setSelectedDifficulty(event.target.value)
                  }
                  className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Muscle Filter Buttons + Verified Dual-Media Toggle */}
          <div className="space-y-3 pt-1">
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
                  onClick={() => handleMuscleSelect(muscle)}
                  className={`min-h-10 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                    selectedMuscle === muscle
                      ? "border-slate-200 bg-slate-100 text-slate-950"
                      : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
              <button
                type="button"
                aria-pressed={verifiedOnly}
                onClick={() => setVerifiedOnly((v) => !v)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  verifiedOnly
                    ? "border-slate-200 bg-slate-100 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
              >
                <Film size={14} aria-hidden="true" />
                Verified Video + Anatomy ({verifiedCount})
              </button>
              <span className="text-xs text-slate-400">
                Select up to 3 cards to compare side-by-side
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Results Count + View Switcher */}
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
              className="min-h-11 text-xs font-medium text-slate-200 underline underline-offset-4 hover:text-white"
            >
              Reset filters
            </button>
          )}
          <div
            className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1"
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
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  viewMode === id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped Exercise Cards */}
      <div className="space-y-8">
        {Object.entries(groupedExercises).map(([muscle, group]) => (
          <section
            key={muscle}
            aria-label={`${muscle} exercises`}
            className="space-y-3"
          >
            <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
              {muscle}
              <span className="text-xs font-normal text-slate-400 tabular-nums">
                {group.length} {group.length === 1 ? "exercise" : "exercises"}
              </span>
            </h2>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
                  : "grid gap-3"
              }
            >
              {group.map((exercise) => {
                const media = getExerciseMediaInfo(exercise);
                const angleLabel = getAngleLabel(exercise.targetAngle);
                const isCompared = compareIds.includes(exercise.id);
                const metaLine = [
                  angleLabel?.en,
                  exercise.equipment || "Bodyweight",
                  exercise.difficulty || "intermediate",
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <article
                    key={exercise.id}
                    className={`group overflow-hidden rounded-2xl border bg-bg-surface transition-colors ${
                      isCompared
                        ? "border-slate-400"
                        : "border-slate-800 hover:border-slate-600"
                    } ${
                      viewMode === "list"
                        ? "flex items-center gap-3 p-3"
                        : "flex flex-col"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(exercise.id)}
                      aria-label={`View ${exercise.name} details`}
                      aria-haspopup="dialog"
                      className={`text-left focus:outline-none ${
                        viewMode === "list"
                          ? "flex min-w-0 flex-1 items-center gap-3"
                          : "flex flex-1 flex-col"
                      }`}
                    >
                      {media.hasVerifiedDualMedia ? (
                        <div
                          className={`relative overflow-hidden bg-[#0b0f17] ${
                            viewMode === "grid"
                              ? "aspect-[16/10] w-full border-b border-slate-800"
                              : "h-20 w-24 shrink-0 rounded-xl border border-slate-800"
                          }`}
                        >
                          <img
                            src={media.anatomyUrl}
                            alt={`${exercise.name} anatomical target`}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <ExerciseImage
                          exercise={exercise}
                          compact={viewMode === "list"}
                          className={
                            viewMode === "grid"
                              ? "aspect-[16/10] w-full border-b border-slate-800 p-2 bg-[#0b0f17]"
                              : "h-20 w-24 shrink-0 rounded-xl p-1 bg-[#0b0f17]"
                          }
                        />
                      )}

                      <div
                        className={`min-w-0 flex-1 ${
                          viewMode === "grid" ? "p-3.5" : "py-1"
                        }`}
                      >
                        <p className="font-semibold leading-snug text-white group-hover:text-slate-200 text-sm">
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
                          {metaLine}
                        </p>
                        {media.hasVerifiedDualMedia && (
                          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                            <Film
                              size={12}
                              className="text-slate-400"
                              aria-hidden="true"
                            />
                            Video + Anatomy
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Independent accessible Compare action */}
                    <div
                      className={
                        viewMode === "grid"
                          ? "border-t border-slate-800/80 px-3 py-2 flex items-center justify-between"
                          : "flex shrink-0 items-center gap-2"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleCompare(exercise.id)}
                        aria-pressed={isCompared}
                        aria-label={
                          isCompared
                            ? `Remove ${exercise.name} from comparison`
                            : `Add ${exercise.name} to comparison`
                        }
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isCompared
                            ? "border-slate-200 bg-slate-100 text-slate-950"
                            : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-white"
                        }`}
                      >
                        {isCompared ? (
                          <Check size={13} aria-hidden="true" />
                        ) : (
                          <ArrowLeftRight size={13} aria-hidden="true" />
                        )}
                        {isCompared ? "Selected" : "Compare"}
                      </button>

                      {viewMode === "list" && (
                        <button
                          type="button"
                          onClick={() => setSelectedId(exercise.id)}
                          aria-label={`Open ${exercise.name}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                        >
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {filteredExercises.length > visibleLimit && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setVisibleLimit((n) => n + PAGE_SIZE)}
              className="min-h-11 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 text-sm font-semibold transition-colors"
            >
              Show more ({visibleExercises.length} of {filteredExercises.length})
            </button>
            <button
              type="button"
              onClick={() => setVisibleLimit(filteredExercises.length)}
              className="min-h-11 w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-bg-surface hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Show all ({filteredExercises.length})
            </button>
          </div>
        )}

        {filteredExercises.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-16 text-center">
            <Search
              size={28}
              className="mx-auto mb-4 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="font-semibold text-white">No exercises found</h2>
            <p className="mt-2 text-sm text-slate-400">
              Try another name, muscle angle, difficulty, or equipment type.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-white hover:bg-slate-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Compact Sticky Comparison Bar */}
      {compareIds.length > 0 && (
        <div
          role="region"
          aria-label="Selected exercises for comparison"
          className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-2.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-3"
        >
          <div className="min-w-0 text-xs text-slate-200">
            <span className="font-semibold text-white tabular-nums">
              {compareIds.length}/3
            </span>{" "}
            selected to compare
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="min-h-10 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleOpenCompareBar}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-white"
            >
              <ArrowLeftRight size={14} aria-hidden="true" />
              Compare now
            </button>
          </div>
        </div>
      )}

      <ExerciseDetails
        exercise={selectedExercise}
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedId(null)}
        onCompareAlternatives={openCompareForExercise}
      />

      <ExerciseCompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        selectedIds={compareIds}
        allExercises={exercises}
        onChangeIds={setCompareIds}
        onOpenDetails={(id) => setSelectedId(id)}
      />
    </div>
  );
}
