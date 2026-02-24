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
