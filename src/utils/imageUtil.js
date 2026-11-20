import { exercisesDatabase } from "../data/exercises";
import { PILOT_MEDIA_REGISTRY } from "../data/pilotMediaData";

const builtInExercises = new Map(
  exercisesDatabase.map((exercise) => [exercise.id, exercise]),
);

/**
 * Resolves the correct path for local assets, accounting for the Vite base path.
 * Works cleanly with relative base "./" inside Capacitor WebView and GitHub Pages.
 */
export const getImageUrl = (path) => {
  if (typeof path !== "string" || !path.trim()) return undefined;
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const base = import.meta.env.BASE_URL;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (base === "/") return `/${cleanPath}`;
  return `${base}${cleanPath}`;
};

/**
 * Resolves the verified exercise-specific anatomical illustration URL.
 * Returns undefined unless anatomy.status === "verified".
 */
export const getExerciseAnatomyUrl = (exercise) => {
  if (!exercise?.id) return undefined;
  const entry = PILOT_MEDIA_REGISTRY[exercise.id];
  if (!entry || entry.anatomy?.status !== "verified") return undefined;
  return getImageUrl(entry.anatomy.path);
};

/**
 * Resolves the verified continuous movement video URL (.mp4).
 * Returns undefined unless video.status === "verified".
 */
export const getExerciseVideoUrl = (exercise) => {
  if (!exercise?.id) return undefined;
  const entry = PILOT_MEDIA_REGISTRY[exercise.id];
  if (!entry || entry.video?.status !== "verified") return undefined;
  return getImageUrl(entry.video.path);
};

/**
 * Computes independent dual-asset media status for an exercise.
 * An exercise is marked "complete" ONLY when BOTH anatomy AND video are verified.
 * Legacy 2-frame images remain strictly optional fallbacks.
 */
export const getExerciseMediaInfo = (exercise) => {
  const entry = exercise?.id ? PILOT_MEDIA_REGISTRY[exercise.id] : null;
  const anatomyVerified = entry?.anatomy?.status === "verified";
  const videoVerified = entry?.video?.status === "verified";
  const hasVerifiedDualMedia = Boolean(anatomyVerified && videoVerified);

  const completionStatus = hasVerifiedDualMedia
    ? "complete"
    : anatomyVerified
      ? "anatomy_only"
      : videoVerified
        ? "video_only"
        : "incomplete";

  return {
    completionStatus,
    hasVerifiedDualMedia,
    anatomy: entry?.anatomy || { status: "pending" },
    video: entry?.video || { status: "pending" },
    anatomyUrl: anatomyVerified ? getImageUrl(entry.anatomy.path) : undefined,
    videoUrl: videoVerified ? getImageUrl(entry.video.path) : undefined,
    fallbackImageUrl: getExerciseImageUrl(exercise),
  };
};

/** Persisted built-ins cannot override the current catalog's audited image decision. */
export const getExerciseImageUrl = (exercise) => {
  if (!exercise) return undefined;
  const currentExercise = builtInExercises.get(exercise.id) || exercise;
  if (currentExercise.imageStatus === "unavailable") return undefined;
  return getImageUrl(currentExercise.image);
};
