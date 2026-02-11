import { useNavigate } from "react-router-dom";
import { Play, ChevronRight } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { workoutPrograms } from "../data/exercises";

const muscleColors = {
  Chest: "bg-red-500/15 text-red-400 border-red-500/30",
  Back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Shoulders: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Arms: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Legs: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function WorkoutSelect() {
  const navigate = useNavigate();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const programs = Object.values(workoutPrograms);

  const handleStartWorkout = (programId) => {
    startWorkout(programId);
    navigate("/workout/active");
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Start Workout</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose your program for today
        </p>
      </div>

      {/* Resume active workout */}
      {activeWorkout && (
        <button
          onClick={() => navigate("/workout/active")}
          className="w-full bg-linear-to-r from-emerald-500/15 to-neon-green/10 rounded-2xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-medium">
                ⚡ Active Workout
              </p>
              <p className="text-base font-semibold text-white mt-0.5">
                {activeWorkout.programName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Started{" "}
                {new Date(activeWorkout.startedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <ChevronRight size={20} className="text-emerald-400" />
          </div>
        </button>
      )}

      {/* Program list */}
      <div className="space-y-3">
        {programs.map((program) => (
          <button
            key={program.id}
            onClick={() => handleStartWorkout(program.id)}
            className="w-full bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-base font-semibold text-white group-hover:text-neon-blue transition-colors">
                  {program.name}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {program.muscles.map((muscle) => (
                    <span
                      key={muscle}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        muscleColors[muscle] ||
                        "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {program.exercises.length} exercises
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                <Play size={18} className="text-neon-blue ml-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
