import { useState } from "react";
import { ImageOff } from "lucide-react";
import { getExerciseImageUrl } from "../utils/imageUtil";

/** Never substitute a different movement for a missing instructional image. */
export default function ExerciseImage({ exercise, className = "", compact = false, loading = "lazy" }) {
  const src = getExerciseImageUrl(exercise);
  const [failedSrc, setFailedSrc] = useState(null);
  const unavailable = !src || failedSrc === src;

  return (
    <div className={`exercise-image flex items-center justify-center overflow-hidden ${className}`}>
      {unavailable ? (
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
      )}
    </div>
  );
}
