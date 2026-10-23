import { useNavigate } from "react-router-dom";
import { Play, Activity, Clock, Dumbbell, Library, HeartPulse } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { trainingPlans } from "../data/exercises";

const muscleColors = {
  Chest: "bg-red-500/10 text-red-400 border-red-500/20",
  Back: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shoulders: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Arms: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Legs: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Core: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export default function WorkoutSelect() {
  const navigate = useNavigate();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const programs = useWorkoutStore((s) => s.programs);
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const activePlan = trainingPlans[activeProgram] || trainingPlans.ppl_upper;
  const programList = Object.values(programs);

  const handleStartWorkout = (programId) => {
    startWorkout(programId);
    navigate("/workout/active");
  };

  const estimateDuration = (program) => {
    return (program.exercises?.length || 0) * 4;
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Workouts</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-400">Select a training session</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-teal-500/10 text-teal-400 border-teal-500/20">
              {activePlan.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => navigate("/cardio")}
            className="h-8 px-2.5 bg-surface-elevated border border-border rounded-lg flex items-center gap-1.5 text-teal-400 hover:text-white transition-all text-xs font-semibold"
            aria-label="Cardio"
          >
            <HeartPulse size={14} />
            Cardio
          </button>
          <button 
            onClick={() => navigate("/exercises")}
            className="w-8 h-8 bg-surface-elevated rounded-lg flex items-center justify-center text-slate-300 border border-border hover:bg-surface-hover hover:text-white transition-all"
            aria-label="Exercise Library"
            title="Exercise Library"
          >
            <Library size={15} />
          </button>
        </div>
      </div>

      {/* Resume active workout banner */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-teal-500/10 rounded-2xl p-4 border border-teal-500/30 hover:border-teal-500/50 transition-all active:scale-[0.98] text-left btn-press"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
                <Activity size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Active Session</p>
                <p className="text-sm font-bold text-white truncate mt-0.5">{activeWorkout.programName}</p>
                <p className="text-[10px] text-slate-400">
                  Started{" "}
                  {new Date(activeWorkout.startedAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-teal-400 shrink-0">
              Resume →
            </div>
          </div>
        </button>
      )}

      {/* Empty State */}
      {programList.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-surface border border-dashed border-border space-y-3">
          <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-border">
            <Dumbbell size={20} />
          </div>
          <p className="text-white font-medium text-sm">No workout routines found</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You can configure exercises and custom routines in the library.
          </p>
          <button
            onClick={() => navigate("/exercises/manage")}
            className="mt-2 px-4 py-2 bg-teal-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-teal-400 transition-colors"
          >
            Manage Exercises
          </button>
        </div>
      )}

      {/* Program list */}
      <div className="space-y-2.5">
        {programList.map((program) => {
          const duration = estimateDuration(program);
          return (
            <button
              key={program.id}
              onClick={() => handleStartWorkout(program.id)}
              className="w-full glass-card p-4 transition-all active:scale-[0.99] text-left group relative overflow-hidden hover:border-slate-500"
              aria-label={`Start ${program.name} — ${program.exercises?.length || 0} exercises, approximately ${duration} minutes`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors truncate">
                      {program.name}
                    </p>
                    {program.isCustom && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-teal-500/10 text-teal-400 border-teal-500/20">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(program.muscles || []).map((muscle) => (
                      <span
                        key={muscle}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          muscleColors[muscle] || "bg-surface-elevated text-slate-300 border-border"
                        }`}
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Dumbbell size={11} className="text-slate-400" />
                      {program.exercises?.length || 0} exercises
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      ~{duration} min
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 text-teal-400 transition-colors shrink-0">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
