import { useState } from "react";
import {
  ExternalLink,
  AlertTriangle,
  ArrowLeftRight,
  ZoomIn,
  Film,
  Layers,
} from "lucide-react";
import Modal from "./Modal";
import ExerciseImage from "./ExerciseImage";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import ImageLightbox from "./ImageLightbox";
import { getExerciseMediaInfo } from "../utils/imageUtil";
import { getAngleLabel } from "../utils/angleUtils";

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function ExerciseDetails({
  exercise,
  isOpen,
  onClose,
  onCompareAlternatives,
}) {
  const [anatomyZoomOpen, setAnatomyZoomOpen] = useState(false);

  if (!exercise) return null;

  const media = getExerciseMediaInfo(exercise);
  const angleLabel = getAngleLabel(exercise.targetAngle);
  const youtubeUrl =
    exercise.video ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${exercise.name} proper form technique tutorial Jeff Nippard OR Renaissance Periodization`,
    )}`;

  const metaParts = [
    exercise.muscle,
    angleLabel?.en || null,
    exercise.equipment ? exercise.equipment : null,
    exercise.difficulty ? DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty : null,
  ].filter(Boolean);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={exercise.name}
        maxWidth={media.hasVerifiedDualMedia ? "max-w-3xl" : "max-w-xl"}
        position="bottom"
      >
        <div className="p-4 sm:p-5 space-y-5 text-sm">
          <div className="space-y-1.5">
            {exercise.nameAr && (
              <p lang="ar" dir="rtl" className="text-slate-400">
                {exercise.nameAr}
              </p>
            )}
            <p className="text-xs text-slate-400 capitalize">
              {metaParts.join(" · ")}
            </p>
          </div>

          {/* Dual-Asset Verified Display: Real Continuous Video + Exercise-Specific Anatomical Plate */}
          {media.hasVerifiedDualMedia ? (
            <section
              aria-label="Movement demonstration and targeted anatomy"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* 1. Continuous Movement Video */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-semibold text-white flex items-center gap-1.5">
                    <Film size={14} className="text-slate-400" aria-hidden="true" />
                    Movement Video
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Continuous loop · Offline ready
                  </span>
                </div>
                <ExerciseVideoPlayer
                  src={media.videoUrl}
                  poster={media.anatomyUrl}
                  exerciseName={exercise.name}
                  attribution={media.video.attribution}
                  license={media.video.license}
                  durationSec={media.video.durationSec}
                />
              </div>

              {/* 2. Exercise-Specific Anatomical Illustration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-semibold text-white flex items-center gap-1.5">
                    <Layers size={14} className="text-slate-400" aria-hidden="true" />
                    Targeted Anatomy
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Tap to zoom
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b0f17]">
                  <button
                    type="button"
                    onClick={() => setAnatomyZoomOpen(true)}
                    aria-label={`Zoom ${exercise.name} anatomical muscle diagram`}
                    className="group relative block aspect-[4/3] w-full overflow-hidden bg-[#0b0f17]"
                  >
                    <img
                      src={media.anatomyUrl}
                      alt={`${exercise.name} anatomical illustration highlighting ${exercise.primaryTarget || exercise.muscle}`}
                      className="h-full w-full object-contain"
                      loading="eager"
                    />
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-slate-200 opacity-85 transition-opacity group-hover:opacity-100">
                      <ZoomIn size={12} aria-hidden="true" /> Zoom
                    </span>
                  </button>

                  {/* Explicit Primary & Secondary Anatomical Color Legend */}
                  <div className="border-t border-slate-800/90 bg-slate-900/80 px-3 py-2.5 space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dc2626]"
                        aria-hidden="true"
                      />
                      <p className="text-slate-200 leading-snug">
                        <span className="font-semibold text-white">Primary:</span>{" "}
                        {exercise.primaryTarget || exercise.muscle}
                      </p>
                    </div>
                    {exercise.secondaryMuscles?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d97706]"
                          aria-hidden="true"
                        />
                        <p className="text-slate-300 leading-snug">
                          <span className="font-semibold text-slate-200">
                            Secondary:
                          </span>{" "}
                          {exercise.secondaryMuscles.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="space-y-2">
              <ExerciseImage
                exercise={exercise}
                className="w-full aspect-[2/1] rounded-xl border border-slate-800 bg-[#0b0f17]"
                zoomable
              />
              <p className="text-xs text-slate-400">
                Static reference preview — verified movement video and
                exercise-specific anatomy illustration pending in catalog
                scale-up.
              </p>
            </div>
          )}

          <section className="space-y-2">
            <h3 className="font-semibold text-white">How to do it</h3>
            {exercise.setupAlignment && (
              <p className="text-slate-300 leading-relaxed">
                {exercise.setupAlignment}
              </p>
            )}
            {exercise.tips && (
              <p className="text-slate-300 leading-relaxed">{exercise.tips}</p>
            )}
            {exercise.executionCues?.length > 0 && (
              <ol className="list-decimal pl-5 space-y-2 text-slate-300 leading-relaxed">
                {exercise.executionCues.map((cue, index) => (
                  <li key={index}>{cue}</li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2">
            <h3 className="font-semibold text-white">Muscles worked</h3>
            <p className="text-slate-100 font-medium">
              {exercise.primaryTarget || exercise.muscle}
            </p>
            {exercise.secondaryMuscles?.length > 0 && (
              <p className="text-slate-400">
                Also involves: {exercise.secondaryMuscles.join(", ")}
              </p>
            )}
            {exercise.jointAction && (
              <p className="text-slate-400">{exercise.jointAction}</p>
            )}
          </section>

          {exercise.commonMistakes?.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle
                  size={16}
                  className="text-amber-500"
                  aria-hidden="true"
                />
                Common mistakes
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                {exercise.commonMistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-xs text-slate-400 leading-relaxed">
            Visuals illustrate the movement pattern, not every detail of safe
            technique. Use a controlled range of motion and stop if you feel
            sharp pain.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {onCompareAlternatives && (
              <button
                type="button"
                onClick={() => onCompareAlternatives(exercise)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-200 px-4 py-3 font-medium text-slate-950 hover:bg-white transition-colors"
              >
                <ArrowLeftRight size={16} aria-hidden="true" />
                Compare same-angle alternatives
              </button>
            )}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 font-medium text-white hover:bg-slate-700 transition-colors"
            >
              {exercise.video
                ? "Watch external video"
                : "Find form videos on YouTube"}
              <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Modal>

      {media.anatomyUrl && (
        <ImageLightbox
          src={media.anatomyUrl}
          alt={`${exercise.name} anatomical target muscles`}
          isOpen={anatomyZoomOpen}
          onClose={() => setAnatomyZoomOpen(false)}
        />
      )}
    </>
  );
}
