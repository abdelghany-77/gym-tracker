import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  ChevronRight,
  ChevronDown,
  Activity,
  Clock,
  Dumbbell,
  Library,
  Calendar,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseImage from "../components/ExerciseImage";
import { ConfirmDialog } from "../components/Modal";
import { trainingPlans } from "../data/exercises";
import { parseLocalDate } from "../utils/dateUtils";

export default function WorkoutSelect() {
  const navigate = useNavigate();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const programs = useWorkoutStore((s) => s.programs);
  const exercises = useWorkoutStore((s) => s.exercises);
  const history = useWorkoutStore((s) => s.history);
  const customProgramOverrides = useWorkoutStore(
    (s) => s.customProgramOverrides,
  );
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const setActiveProgram = useWorkoutStore((s) => s.setActiveProgram);

  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [pendingPlanSwitch, setPendingPlanSwitch] = useState(null);

  const programList = Object.values(programs || {});

  // Map programId -> most recent session date
  const lastTrainedByProgram = useMemo(() => {
    const map = {};
    for (const session of history) {
      if (!session.programId) continue;
      if (!map[session.programId] || session.date > map[session.programId]) {
        map[session.programId] = session.date;
      }
    }
    return map;
  }, [history]);

  const exerciseById = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises],
  );

  const resolveProgramExercises = (program) => {
    const resolvedIds =
      useWorkoutStore.getState().getResolvedExercises?.(program.id) ||
      program.exercises ||
      [];
    return resolvedIds
      .map((id) => exerciseById.get(id))
      .filter(Boolean);
  };

  const handleStartWorkout = (programId) => {
    if (useWorkoutStore.getState().activeWorkout) {
      navigate("/workout/active");
      return;
    }
    if (!programs?.[programId]?.exercises?.length) return;
    startWorkout(programId);
    if (useWorkoutStore.getState().activeWorkout) {
      navigate("/workout/active");
    }
  };

  const estimateDuration = (count) => count * 4;

  const formatLastTrained = (dateStr) => {
    if (!dateStr) return "Not trained yet";
    return `Last ${parseLocalDate(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  return (
    <div className="px-4 pt-5 pb-24 max-w-3xl mx-auto space-y-5 animate-fadeIn">
      {/* ── Header + Quick Plan Switcher ── */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Start Workout
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose today&apos;s session or preview exercises before starting
            </p>
          </div>
          <button
            onClick={() => navigate("/exercises")}
            className="min-h-11 px-3.5 bg-bg-surface rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
            aria-label="Exercise Library"
          >
            <Library size={16} />
            <span className="hidden sm:inline">Library</span>
          </button>
        </div>

        {/* Quick Plan Switcher */}
        <div
          className="inline-flex w-full sm:w-auto rounded-xl border border-slate-800 bg-bg-surface p-1"
          role="group"
          aria-label="Training plan switcher"
        >
          {Object.entries(trainingPlans).map(([planId, plan]) => {
            const isSelected = planId === activeProgram;
            return (
              <button
                key={planId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (!isSelected) setPendingPlanSwitch(planId);
                }}
                className={`flex-1 sm:flex-initial min-h-10 rounded-lg px-4 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {plan.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Resume active workout ── */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/35 hover:border-emerald-500/60 transition-colors active:scale-[0.99] text-left min-h-11"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Activity size={13} />
                Active Workout
              </p>
              <p className="text-base font-bold text-white mt-0.5">
                {activeWorkout.programName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Started{" "}
                {new Date(activeWorkout.startedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <ChevronRight size={20} className="text-emerald-400 shrink-0" />
          </div>
        </button>
      )}

      {/* ── Empty state ── */}
      {programList.length === 0 && (
        <div className="text-center py-14 px-4 rounded-2xl bg-bg-surface border border-dashed border-slate-700 space-y-3">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-400">
            <Dumbbell size={22} />
          </div>
          <p className="text-slate-200 font-semibold text-sm">
            No programs yet
          </p>
          <p className="text-xs text-slate-400">
            Head to the Exercise Library to create your first program.
          </p>
          <button
            onClick={() => navigate("/exercises/manage")}
            className="min-h-11 px-5 bg-slate-100 text-slate-950 text-xs font-bold rounded-xl hover:bg-white transition-colors"
          >
            Manage Exercises
          </button>
        </div>
      )}

      {/* ── Program Cards ── */}
      <div className="space-y-3">
        {programList.map((program) => {
          const resolvedExercises = resolveProgramExercises(program);
          const thumbnails = resolvedExercises.slice(0, 4);
          const programExercisesList = program.exercises || [];
          const exerciseCount =
            resolvedExercises.length || programExercisesList.length;
          const duration = estimateDuration(exerciseCount);
          const cannotStart = !activeWorkout && programExercisesList.length === 0;
          const isExpanded = expandedProgramId === program.id;
          const lastTrained = lastTrainedByProgram[program.id];
          const hasSwaps =
            customProgramOverrides?.[program.id] &&
            Object.keys(customProgramOverrides[program.id]).length > 0;

          return (
            <div
              key={program.id}
              className="rounded-2xl bg-bg-surface border border-slate-800 hover:border-slate-700 transition-colors overflow-hidden"
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white">
                      {program.name}
                    </h2>
                    {program.isCustom && (
                      <span className="text-[11px] font-medium text-emerald-400">
                        · Custom
                      </span>
                    )}
                    {hasSwaps && (
                      <span className="text-[11px] font-medium text-sky-400">
                        · Customized
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed muscles list */}
                  <p className="text-xs text-slate-300">
                    {(program.muscles || []).join(" · ")}
                  </p>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                    <span>{exerciseCount} exercises</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} aria-hidden="true" /> ~{duration} min
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-sans">
                      <Calendar size={11} aria-hidden="true" />{" "}
                      {formatLastTrained(lastTrained)}
                    </span>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {thumbnails.map((exercise, index) => (
                      <ExerciseImage
                        key={`${exercise.id}-${index}`}
                        exercise={exercise}
                        className="w-9 h-9 rounded-lg object-contain bg-bg-deep border border-slate-800 p-0.5 shrink-0"
                        compact
                      />
                    ))}
                    {thumbnails.length === 0 && (
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                        <Dumbbell size={14} />
                      </div>
                    )}
                    {exerciseCount > 4 && (
                      <div className="w-9 h-9 rounded-lg bg-bg-deep border border-slate-800 flex items-center justify-center text-[11px] font-mono tabular-nums text-slate-400 font-medium">
                        +{exerciseCount - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons: Preview & Start */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProgramId(isExpanded ? null : program.id)
                    }
                    aria-expanded={isExpanded}
                    className="min-h-11 px-3.5 rounded-xl border border-slate-700 bg-bg-deep text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    Preview
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartWorkout(program.id)}
                    disabled={cannotStart}
                    aria-label={
                      activeWorkout
                        ? `Resume ${activeWorkout.programName} workout`
                        : cannotStart
                          ? `${program.name} — add exercises to start`
                          : `Start ${program.name} — ${exerciseCount} exercises, approximately ${duration} minutes`
                    }
                    className="min-h-11 px-4 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white active:scale-[0.98] transition-all inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play size={14} fill="currentColor" />
                    {activeWorkout
                      ? "Resume"
                      : cannotStart
                        ? "Empty"
                        : "Start"}
                  </button>
                </div>
              </div>

              {/* Expandable Exercise Preview */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-bg-deep/60 px-4 py-3 space-y-2 animate-fadeIn">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Planned Exercises
                  </p>
                  {resolvedExercises.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No exercises assigned to this day yet.
                    </p>
                  ) : (
                    <ol className="divide-y divide-slate-800/80">
                      {resolvedExercises.map((ex, idx) => (
                        <li
                          key={`${ex.id}-${idx}`}
                          className="py-2 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[11px] font-mono tabular-nums text-slate-500 w-4 shrink-0">
                              {idx + 1}.
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-100 truncate">
                                {ex.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {ex.muscle}
                                {ex.angle ? ` · ${ex.angle}` : ""}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                            {ex.defaultSets || 3} × {ex.defaultReps || "8-12"}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan Switch Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pendingPlanSwitch)}
        onClose={() => setPendingPlanSwitch(null)}
        onConfirm={() => {
          if (pendingPlanSwitch) {
            setActiveProgram(pendingPlanSwitch);
            setExpandedProgramId(null);
            setPendingPlanSwitch(null);
          }
        }}
        title="Switch Training Plan?"
        description="Your workout history, PRs, and exercise library will be preserved. The weekly schedule and program list will switch to the selected plan's defaults."
        confirmText="Switch Plan"
        cancelText="Keep Current"
        variant="default"
      />
    </div>
  );
}
