import { useNavigate } from "react-router-dom";
import { Play, ChevronRight, Activity, Clock, Dumbbell, Library, Zap, Crown, HeartPulse } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { trainingPlans } from "../data/exercises";

const muscleColors = {
  Chest: "bg-red-500/10 text-red-400 border-red-500/20",
  Back: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shoulders: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Arms: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Legs: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Core: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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

  // Estimate duration: ~4 min per exercise
  const estimateDuration = (program) => {
    return program.exercises.length * 4;
  };

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Start Workout</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500">Choose your program</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              activeProgram === 'ppl_upper'
                ? 'bg-accent/8 text-accent border-accent/20'
                : 'bg-vivid-purple/8 text-vivid-purple border-vivid-purple/20'
            }`}>
              {activePlan.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => navigate("/cardio")}
            className="h-9 px-2.5 bg-red-500/8 border border-red-500/20 rounded-lg flex items-center gap-1 text-red-400 hover:bg-red-500/15 transition-all text-[11px] font-semibold"
            aria-label="Cardio"
          >
            <HeartPulse size={14} />
            Cardio
          </button>
          <button 
            onClick={() => navigate("/exercises")}
            className="w-9 h-9 bg-bg-card rounded-lg flex items-center justify-center text-slate-400 border border-border-slate hover:bg-slate-700 hover:text-white transition-all"
            aria-label="Exercise Library"
          >
            <Library size={16} />
          </button>
        </div>
      </div>

      {/* Resume active workout */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-accent/8 rounded-xl p-3.5 border border-accent/25 hover:border-accent/40 transition-all active:scale-[0.98] text-left"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-bg-deep">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">Active Workout</p>
                <p className="text-sm font-semibold text-white mt-0.5">{activeWorkout.programName}</p>
                <p className="text-[10px] text-slate-500">
                  Started{" "}
                  {new Date(activeWorkout.startedAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-accent" />
          </div>
        </button>
      )}

      {/* Program list */}
      {programList.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-bg-card border border-dashed border-border-slate space-y-3">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
            <Dumbbell size={20} />
          </div>
          <p className="text-slate-400 font-medium text-sm">No programs yet</p>
          <p className="text-xs text-slate-500">Head to the Exercise Library to create your first program.</p>
          <button
            onClick={() => navigate("/exercises/manage")}
            className="mt-2 px-4 py-2 bg-accent/10 text-accent text-xs font-medium rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            Manage Exercises
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {programList.map((program) => {
          const duration = estimateDuration(program);
          return (
            <button
              key={program.id}
              onClick={() => handleStartWorkout(program.id)}
              className="w-full bg-bg-card rounded-xl p-3.5 border border-border-slate hover:border-slate-600 transition-all active:scale-[0.98] text-left group relative overflow-hidden"
              aria-label={`Start ${program.name} — ${program.exercises.length} exercises, approximately ${duration} minutes`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                    {program.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(program.muscles || []).map((muscle) => (
                      <span
                        key={muscle}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                          muscleColors[muscle] || "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {muscle}
                      </span>
                    ))}
                    {program.isCustom && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Dumbbell size={10} /> {program.exercises.length} exercises
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} /> ~{duration} min
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/8 flex items-center justify-center group-hover:bg-accent/15 transition-colors shrink-0 ml-3">
                  <Play size={18} className="text-accent ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
