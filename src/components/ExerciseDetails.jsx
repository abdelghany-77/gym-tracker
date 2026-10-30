import { ExternalLink, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import ExerciseImage from "./ExerciseImage";
import AngleBadge from "./AngleBadge";

export default function ExerciseDetails({ exercise, isOpen, onClose }) {
  if (!exercise) return null;
  const videoUrl = exercise.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} exercise proper form`)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.name} maxWidth="max-w-xl" position="bottom">
      <div className="p-4 sm:p-5 space-y-5 text-sm">
        {exercise.nameAr && <p lang="ar" dir="rtl" className="text-slate-400">{exercise.nameAr}</p>}
        <ExerciseImage exercise={exercise} className="w-full aspect-[2/1] rounded-xl border border-slate-700" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{exercise.muscle}</span>
          {exercise.equipment && <span className="capitalize text-slate-400">{exercise.equipment}</span>}
          {exercise.targetAngle && <AngleBadge angle={exercise.targetAngle} />}
        </div>
        <section className="space-y-2">
          <h3 className="font-semibold text-white">How to do it</h3>
          {exercise.setupAlignment && <p className="text-slate-300 leading-relaxed">{exercise.setupAlignment}</p>}
          {exercise.tips && <p className="text-slate-300 leading-relaxed">{exercise.tips}</p>}
          {exercise.executionCues?.length > 0 && (
            <ol className="list-decimal pl-5 space-y-2 text-slate-300 leading-relaxed">
              {exercise.executionCues.map((cue, index) => <li key={index}>{cue}</li>)}
            </ol>
          )}
        </section>
        <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 space-y-2">
          <h3 className="font-semibold text-white">Muscles worked</h3>
          <p className="text-neon-cyan">{exercise.primaryTarget || exercise.muscle}</p>
          {exercise.secondaryMuscles?.length > 0 && <p className="text-slate-400">Also involves: {exercise.secondaryMuscles.join(", ")}</p>}
          {exercise.jointAction && <p className="text-slate-400">{exercise.jointAction}</p>}
        </section>
        {exercise.commonMistakes?.length > 0 && (
          <section className="space-y-2">
            <h3 className="font-semibold text-amber-400 flex items-center gap-2"><AlertTriangle size={16} aria-hidden="true" /> Common mistakes</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              {exercise.commonMistakes.map((mistake, index) => <li key={index}>{mistake}</li>)}
            </ul>
          </section>
        )}
        <p className="text-xs text-slate-400 leading-relaxed">Pictures illustrate the movement, not every detail of safe technique. Use a comfortable range of motion and stop if you feel sharp pain.</p>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 font-medium text-white hover:bg-slate-700">
          {exercise.video ? "Watch exercise video" : "Find form videos on YouTube"}
          <ExternalLink size={16} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Modal>
  );
}
