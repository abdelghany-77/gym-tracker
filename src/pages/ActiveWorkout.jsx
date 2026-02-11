import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, X, Clock } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import { useState, useMemo } from "react";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const progress = useMemo(() => {
    if (!activeWorkout) return { totalSets: 0, doneSets: 0, percent: 0 };
    const totalSets = activeWorkout.exercises.reduce(
      (acc, e) => acc + e.sets.length,
      0,
    );
    const doneSets = activeWorkout.exercises.reduce(
      (acc, e) => acc + e.sets.filter((s) => s.done).length,
      0,
    );
    return {
      totalSets,
      doneSets,
      percent: totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0,
    };
  }, [activeWorkout]);

  const elapsed = useMemo(() => {
    if (!activeWorkout) return 0;
    const start = new Date(activeWorkout.startedAt);
    const now = new Date();
    const diff = Math.floor((now - start) / 60000); // minutes
    return diff;
  }, [activeWorkout]);

  // Redirect if no active workout
  if (!activeWorkout) {
    return (
      <div className="px-4 pt-20 text-center max-w-lg mx-auto">
        <p className="text-slate-400 mb-4">No active workout session.</p>
        <button
          onClick={() => navigate("/workout")}
          className="text-neon-blue hover:underline text-sm"
        >
          Start a workout →
        </button>
      </div>
    );
  }

  const handleFinish = () => {
    finishWorkout();
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    cancelWorkout();
    navigate("/workout", { replace: true });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/workout")}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {activeWorkout.programName}
          </p>
          <div className="flex items-center gap-1 justify-center text-xs text-slate-500">
            <Clock size={10} />
            <span>{elapsed} min</span>
          </div>
        </div>
        <button
          onClick={() => setShowConfirmCancel(true)}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {progress.doneSets}/{progress.totalSets} sets completed
          </span>
          <span className="text-neon-blue font-medium">
            {progress.percent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-neon-blue to-neon-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {activeWorkout.exercises.map((exerciseData, index) => (
          <ExerciseCard
            key={exerciseData.exerciseId}
            exerciseIndex={index}
            exerciseData={exerciseData}
          />
        ))}
      </div>

      {/* Finish Workout Button */}
      <button
        onClick={() => setShowConfirmFinish(true)}
        className="w-full bg-linear-to-r from-neon-green/20 to-emerald-500/20 text-neon-green font-semibold py-4 rounded-2xl border border-neon-green/30 hover:border-neon-green/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={20} />
        Finish Workout ({progress.percent}% done)
      </button>

      {/* Rest Timer (floating) */}
      <RestTimer />

      {/* Confirm Finish Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Finish Workout?
            </h3>
            <p className="text-sm text-slate-400">
              You've completed {progress.doneSets} of {progress.totalSets} sets
              ({progress.percent}%). Only completed sets will be saved to your
              history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-neon-green/20 text-neon-green font-medium border border-neon-green/30 hover:bg-neon-green/30 transition-colors"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Cancel Workout?
            </h3>
            <p className="text-sm text-slate-400">
              All progress from this session will be lost. This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
