import { exercisesDatabase } from "../data/exercises";

const builtInExercises = new Map(
  exercisesDatabase.map((exercise) => [exercise.id, exercise]),
);

/**
 * Resolves the correct path for images, accounting for the Vite base path.
 * The base path should be set in vite.config.js (e.g., "/gym-tracker/")
 */
export const getImageUrl = (path) => {
  // An unavailable image must not become an empty src or a guessed exercise URL.
  if (typeof path !== "string" || !path.trim()) return undefined;

  // If the path is already an absolute URL or data URI, return it
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Get base from Vite environment
  const base = import.meta.env.BASE_URL; // e.g. "/gym-tracker/" using default or configured base

  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If base is just "/", return path (ensure leading slash)
  if (base === "/") return `/${cleanPath}`;

  // Combine base and path
  // Base usually ends with slash if configured in vite.config.js
  return `${base}${cleanPath}`;
};

/** Persisted built-ins cannot override the current catalog's audited image decision. */
export const getExerciseImageUrl = (exercise) => {
  if (!exercise) return undefined;
  const currentExercise = builtInExercises.get(exercise.id) || exercise;
  if (currentExercise.imageStatus === "unavailable") return undefined;
  return getImageUrl(currentExercise.image);
};
