import { useState } from "react";
import { ImageOff, ZoomIn } from "lucide-react";
import { getExerciseImageUrl } from "../utils/imageUtil";
import ImageLightbox from "./ImageLightbox";

/** Never substitute a different movement for a missing instructional image. */
export default function ExerciseImage({
  exercise,
  className = "",
  compact = false,
  loading = "lazy",
  zoomable = false,
}) {
  const src = getExerciseImageUrl(exercise);
  const [failedSrc, setFailedSrc] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const unavailable = !src || failedSrc === src;

  const imageEl = unavailable ? (
    <div
      role="img"
      aria-label={`${exercise?.name || "Exercise"}: image unavailable`}
      className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center text-slate-400"
    >
      <ImageOff size={compact ? 20 : 28} aria-hidden="true" />
      {!compact && <span className="text-xs font-medium">Image unavailable</span>}
    </div>
  ) : (
    <img
      src={src}
      alt={`${exercise.name} demonstration`}
      className="h-full w-full object-contain"
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );

  if (!zoomable || unavailable) {
    return (
      <div className={`exercise-image flex items-center justify-center overflow-hidden ${className}`}>
        {imageEl}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`exercise-image group relative flex items-center justify-center overflow-hidden ${className}`}
        aria-label={`Zoom ${exercise?.name || "exercise"} image`}
      >
        {imageEl}
        {/* Subtle zoom affordance */}
        <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white/90 opacity-80 transition-opacity group-hover:opacity-100">
          <ZoomIn size={11} aria-hidden="true" /> Zoom
        </span>
      </button>
      <ImageLightbox
        src={src}
        alt={`${exercise.name} demonstration`}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
