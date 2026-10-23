// ── Schema Version ──
export const DATABASE_VERSION = "3.1.0";

// ── Canonical Storage Keys ──
export const STORAGE_KEYS = {
  exercises: "gym_exercises",
  programs: "gym_programs",
  schedule: "gym_schedule",
  overrides: "gym_custom_program_overrides",  // unified key
  overridesLegacy: "gym_custom_overrides",     // old key (read-only)
  history: "gym_history",
  prs: "gym_prs",
  profile: "gym_profile",
  activeProgram: "gym_active_program",
  measurements: "gym_measurements",
  theme: "gym_theme",
  onboarding: "gym_onboarding",
  restTimes: "gym_rest_times",
  dbVersion: "gym_db_version",
  activeSession: "gym_active_session",
  cardioHistory: "gym_cardio_history",
  cardioGoal: "gym_cardio_goal",
};

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

// ── Merge custom program overrides from legacy keys ──
// Reads from both old (gym_custom_overrides) and new (gym_custom_program_overrides)
// and returns a merged result. New key takes priority per-program.
export const mergeCustomOverrides = () => {
  const oldOverrides = loadFromStorage(STORAGE_KEYS.overridesLegacy, {});
  const newOverrides = loadFromStorage(STORAGE_KEYS.overrides, {});

  // Deep merge: for each program, merge old into new (new wins per exercise key)
  const merged = { ...oldOverrides };
  for (const [programId, programOverrides] of Object.entries(newOverrides)) {
    merged[programId] = {
      ...(merged[programId] || {}),
      ...programOverrides,
    };
  }

  // Save unified and clean up legacy
  if (Object.keys(oldOverrides).length > 0) {
    saveToStorage(STORAGE_KEYS.overrides, merged);
    try {
      localStorage.removeItem(STORAGE_KEYS.overridesLegacy);
    } catch {
      // silent
    }
  }

  return merged;
};

// ── Active Session Persistence ──
export const saveActiveSession = (session) => {
  if (session) {
    saveToStorage(STORAGE_KEYS.activeSession, session);
  } else {
    try {
      localStorage.removeItem(STORAGE_KEYS.activeSession);
    } catch {
      // silent
    }
  }
};

export const loadActiveSession = () => {
  return loadFromStorage(STORAGE_KEYS.activeSession, null);
};

export const clearActiveSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.activeSession);
  } catch {
    // silent
  }
};

// ── Backup & Restore Engine ──

/**
 * Export all core gym tracker data into a single timestamped JSON file
 * and trigger browser download.
 */
export const exportUserData = () => {
  const exportPayload = {
    gym_history: loadFromStorage(STORAGE_KEYS.history, []),
    gym_prs: loadFromStorage(STORAGE_KEYS.prs, {}),
    gym_exercises: loadFromStorage(STORAGE_KEYS.exercises, []),
    gym_programs: loadFromStorage(STORAGE_KEYS.programs, {}),
    gym_schedule: loadFromStorage(STORAGE_KEYS.schedule, {}),
    gym_custom_program_overrides: loadFromStorage(STORAGE_KEYS.overrides, {}),
    gym_db_version: loadFromStorage(STORAGE_KEYS.dbVersion, DATABASE_VERSION),
    // Additional user data for completeness
    gym_profile: loadFromStorage(STORAGE_KEYS.profile, { name: "", weight: 0, height: 0, age: 0 }),
    gym_active_program: loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper"),
    gym_measurements: loadFromStorage(STORAGE_KEYS.measurements, []),
    // Cardio data
    gym_cardio_history: loadFromStorage(STORAGE_KEYS.cardioHistory, []),
    gym_cardio_goal: loadFromStorage(STORAGE_KEYS.cardioGoal, null),
    exportedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = todayKey(); // YYYY-MM-DD
    a.href = url;
    a.download = `gym-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return exportPayload;
};

/**
 * Validates, sanitizes, and restores user data from a JSON object or string.
 * Writes verified keys to localStorage and triggers reactive store re-hydration.
 * 
 * @param {string|object} rawInput - JSON string or parsed object
 * @param {function} [onRehydrate] - Optional callback (e.g. useWorkoutStore.getState().rehydrateFromStorage)
 * @returns {{ success: boolean, message?: string, count?: { history: number, prs: number, exercises: number } }}
 */
export const importUserData = (rawInput, onRehydrate) => {
  try {
    let data = rawInput;
    if (typeof rawInput === "string") {
      data = JSON.parse(rawInput);
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid backup format: root must be a JSON object.");
    }

    // Support both raw storage keys (gym_*) and shorthand keys (history, prs, etc.)
    const history = data.gym_history ?? data.history ?? [];
    if (!Array.isArray(history)) {
      throw new Error("Invalid history data: expected an array of workout sessions.");
    }

    const prs = data.gym_prs ?? data.personalRecords ?? data.prs ?? {};
    if (typeof prs !== "object" || Array.isArray(prs)) {
      throw new Error("Invalid personal records data: expected a key-value map.");
    }

    const rawExercises = data.gym_exercises ?? data.exercises ?? [];
    const exercises = sanitizeExerciseList(rawExercises);

    const programs = data.gym_programs ?? data.programs ?? {};
    const schedule = data.gym_schedule ?? data.schedule ?? data.weeklySchedule ?? {};
    // Support both override key names
    const overrides = data.gym_custom_program_overrides ?? data.gym_custom_overrides ?? data.customProgramOverrides ?? {};
    const dbVersion = data.gym_db_version ?? data.dbVersion ?? DATABASE_VERSION;
    const profile = data.gym_profile ?? data.userProfile ?? null;
    const activeProgram = data.gym_active_program ?? data.activeProgram ?? null;
    const measurements = data.gym_measurements ?? data.measurements ?? null;

    // Cardio data (backward-compatible: old backups may not have it)
    const cardioHistory = data.gym_cardio_history ?? data.cardioHistory ?? [];
    const cardioGoal = data.gym_cardio_goal ?? data.cardioGoal ?? null;

    // Persist verified keys to localStorage
    saveToStorage(STORAGE_KEYS.history, history);
    saveToStorage(STORAGE_KEYS.prs, prs);
    if (exercises.length > 0) {
      saveToStorage(STORAGE_KEYS.exercises, exercises);
    }
    if (Object.keys(programs).length > 0) {
      saveToStorage(STORAGE_KEYS.programs, programs);
    }
    if (Object.keys(schedule).length > 0) {
      saveToStorage(STORAGE_KEYS.schedule, schedule);
    }
    saveToStorage(STORAGE_KEYS.overrides, overrides);
    // Remove legacy override key on import
    try { localStorage.removeItem(STORAGE_KEYS.overridesLegacy); } catch { /* silent */ }
    saveToStorage(STORAGE_KEYS.dbVersion, String(dbVersion));

    if (profile) saveToStorage(STORAGE_KEYS.profile, profile);
    if (activeProgram) saveToStorage(STORAGE_KEYS.activeProgram, activeProgram);
    if (Array.isArray(measurements)) saveToStorage(STORAGE_KEYS.measurements, measurements);

    // Cardio
    if (Array.isArray(cardioHistory) && cardioHistory.length > 0) {
      saveToStorage(STORAGE_KEYS.cardioHistory, cardioHistory);
    }
    if (cardioGoal) {
      saveToStorage(STORAGE_KEYS.cardioGoal, cardioGoal);
    }

    // Reactive store re-hydration
    if (typeof onRehydrate === "function") {
      onRehydrate();
    }

    return {
      success: true,
      count: {
        history: history.length,
        prs: Object.keys(prs).length,
        exercises: exercises.length,
      },
    };
  } catch (err) {
    console.error("Backup restoration error:", err);
    return {
      success: false,
      message: err.message || "Failed to parse and restore backup.",
    };
  }
};
