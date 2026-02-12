import { useNavigate } from "react-router-dom";
import { Play, ChevronRight, Activity, Clock } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { workoutPrograms } from "../data/exercises";
import { getImageUrl } from "../utils/imageUtil";
import exercises from "../data/exercises";

const muscleColors = {
  Chest: "bg-red-500/15 text-red-400 border-red-500/30",
  Back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Shoulders: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Arms: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Legs: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const muscleAccent = {
  Chest: "from-red-500/20",
  Back: "from-blue-500/20",
  Shoulders: "from-amber-500/20",
  Arms: "from-purple-500/20",
  Legs: "from-emerald-500/20",
};

const muscleBorder = {
  Chest: "border-l-red-500/40",
  Back: "border-l-blue-500/40",
  Shoulders: "border-l-amber-500/40",
  Arms: "border-l-purple-500/40",
  Legs: "border-l-emerald-500/40",
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

  // Get first 3 exercise images for a program
  const getExerciseThumbnails = (program) => {
    return program.exercises.slice(0, 3).map((exId) => {
      const ex = exercises.find((e) => e.id === exId);
      return ex ? ex.image : null;
    }).filter(Boolean);
  };

  // Estimate duration: ~4 min per exercise
  const estimateDuration = (program) => {
    return program.exercises.length * 4;
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5 animate-fadeIn">
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
          className="w-full bg-linear-to-r from-emerald-500/15 to-neon-green/10 rounded-2xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all active:scale-[0.98] text-left focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none"
          aria-label={`Resume ${activeWorkout.programName} workout`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Activity size={12} />
                Active Workout
              </p>
              <p className="text-base font-semibold text-white mt-0.5">
                {activeWorkout.programName}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
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
        {programs.map((program) => {
          const thumbnails = getExerciseThumbnails(program);
          const duration = estimateDuration(program);
          const mainMuscle = program.muscles[0];
          return (
            <button
              key={program.id}
              onClick={() => handleStartWorkout(program.id)}
              className={`w-full bg-slate-900 rounded-2xl p-4 border border-slate-800 border-l-[3px] ${muscleBorder[mainMuscle] || "border-l-slate-700"} hover:border-slate-700 transition-all active:scale-[0.98] text-left group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none`}
              aria-label={`Start ${program.name} — ${program.exercises.length} exercises, approximately ${duration} minutes`}
            >
              {/* Subtle gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-r ${muscleAccent[mainMuscle] || "from-slate-800/20"} to-transparent opacity-30 pointer-events-none`} />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-base font-semibold text-white group-hover:text-neon-blue transition-colors">
                    {program.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {program.muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          muscleColors[muscle] ||
                          "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      {program.exercises.length} exercises
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} /> ~{duration} min
                    </p>
                  </div>
                  {/* Exercise thumbnails */}
                  <div className="flex items-center gap-1 mt-2.5">
                    {thumbnails.map((img, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                    {program.exercises.length > 3 && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-medium">
                        +{program.exercises.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors shrink-0 ml-3">
                  <Play size={20} className="text-neon-blue ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
