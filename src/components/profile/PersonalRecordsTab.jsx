import { Trophy, Dumbbell } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";

export default function PersonalRecordsTab() {
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const getExerciseById = useWorkoutStore((s) => s.getExerciseById);

  const prEntries = Object.entries(personalRecords)
    .map(([exerciseId, weight]) => ({
      exercise: getExerciseById(exerciseId),
      weight,
    }))
    .filter((e) => e.exercise)
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Trophy size={14} className="text-amber-400" />
        Personal Records
      </h2>
      {prEntries.length > 0 ? (
        <div className="space-y-2">
          {prEntries.map(({ exercise, weight }) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
            >
              <div>
                <p className="text-sm text-white">{exercise.name}</p>
                <p className="text-[11px] text-slate-500">{exercise.muscle}</p>
              </div>
              <span className="text-sm font-bold text-amber-400">
                {weight} kg
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Dumbbell size={20} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Complete workouts to track PRs</p>
        </div>
      )}
    </div>
  );
}
