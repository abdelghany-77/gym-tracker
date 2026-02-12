/**
 * Resolves the correct path for images, accounting for the Vite base path.
 * The base path should be set in vite.config.js (e.g., "/gym-tracker/")
 */
export const getImageUrl = (path) => {
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
