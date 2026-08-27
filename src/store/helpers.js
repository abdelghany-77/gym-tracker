// ── Schema Version ──
export const DATABASE_VERSION = "3.0.0";

// ── Helper: Deduplication & Sanitizer ──
export const sanitizeExerciseList = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// ── Helper: localStorage read/write ──
export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
};

// ── Use local date to avoid UTC midnight shift ──
export const todayKey = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export const generateId = () =>
  `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

