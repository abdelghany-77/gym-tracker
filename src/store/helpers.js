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

export const loadProgramOverrides = () =>
  loadFromStorage("gym_custom_program_overrides", null) ??
  loadFromStorage("gym_custom_overrides", {});

export const normalizeMeasurements = (measurements) => {
  const normalized = Array.isArray(measurements)
    ? { entries: measurements }
    : measurements;
  if (
    normalized &&
    Array.isArray(normalized.entries) &&
    normalized.entries.every(
      (entry) => entry && typeof entry === "object" && !Array.isArray(entry),
    )
  )
    return normalized;
  throw new Error(
    "Invalid measurements data: expected an array of measurement entries.",
  );
};

export const isValidNutritionTargets = (targets) =>
  targets !== null &&
  typeof targets === "object" &&
  !Array.isArray(targets) &&
  Number.isFinite(targets.calories) &&
  targets.calories > 0 &&
  Object.values(targets).every((value) => Number.isFinite(value) && value >= 0);

export const generateId = () =>
  `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Backup & Restore Engine ──

/**
 * Export all core gym tracker data into a single timestamped JSON file
 * and trigger browser download.
 */
export const exportUserData = () => {
  const nutritionTargets = loadFromStorage("gym_nutrition", null);
  const exportPayload = {
    ...(isValidNutritionTargets(nutritionTargets)
      ? { gym_nutrition: nutritionTargets }
      : {}),
    gym_history: loadFromStorage("gym_history", []),
    gym_prs: loadFromStorage("gym_prs", {}),
    gym_exercises: loadFromStorage("gym_exercises", []),
    gym_programs: loadFromStorage("gym_programs", {}),
    gym_schedule: loadFromStorage("gym_schedule", {}),
    gym_custom_program_overrides: loadProgramOverrides(),
    gym_db_version: DATABASE_VERSION,
    // Additional user data for completeness
    gym_profile: loadFromStorage("gym_profile", {
      name: "",
      weight: 0,
      height: 0,
      age: 0,
    }),
    gym_active_program: loadFromStorage("gym_active_program", "ppl_upper"),
    gym_measurements: normalizeMeasurements(
      loadFromStorage("gym_measurements", { entries: [] }),
    ),
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

    const supportedKeys = [
      "gym_history",
      "history",
      "gym_prs",
      "personalRecords",
      "prs",
      "gym_exercises",
      "exercises",
      "gym_programs",
      "programs",
      "gym_schedule",
      "schedule",
      "weeklySchedule",
      "gym_custom_program_overrides",
      "gym_custom_overrides",
      "customProgramOverrides",
      "gym_profile",
      "userProfile",
      "gym_active_program",
      "activeProgram",
      "gym_measurements",
      "measurements",
      "gym_nutrition",
      "nutritionTargets",
    ];
    if (!supportedKeys.some((key) => Object.hasOwn(data, key))) {
      throw new Error("Invalid backup format: no recognized user data.");
    }
    const isMap = (value) =>
      value !== null && typeof value === "object" && !Array.isArray(value);
    const mapKeys = [
      "gym_prs",
      "personalRecords",
      "prs",
      "gym_programs",
      "programs",
      "gym_schedule",
      "schedule",
      "weeklySchedule",
      "gym_custom_program_overrides",
      "gym_custom_overrides",
      "customProgramOverrides",
      "gym_profile",
      "userProfile",
    ];
    for (const key of mapKeys) {
      if (Object.hasOwn(data, key) && !isMap(data[key])) {
        throw new Error(`Invalid ${key} data: expected a key-value map.`);
      }
    }

    for (const key of [
      "gym_history",
      "history",
      "gym_exercises",
      "exercises",
    ]) {
      if (Object.hasOwn(data, key) && !Array.isArray(data[key])) {
        throw new Error(`Invalid ${key} data: expected an array.`);
      }
    }

    // Validate supplied data before writing any storage keys.
    // Support both raw storage keys (gym_*) and shorthand keys (history, prs, etc.)
    const history = data.gym_history ?? data.history ?? [];
    if (!Array.isArray(history)) {
      throw new Error(
        "Invalid history data: expected an array of workout sessions.",
      );
    }

    for (const session of history) {
      if (
        !isMap(session) ||
        typeof session.id !== "string" ||
        typeof session.date !== "string" ||
        !Array.isArray(session.exercises) ||
        session.exercises.some(
          (exercise) =>
            !isMap(exercise) ||
            typeof exercise.exerciseId !== "string" ||
            !Array.isArray(exercise.sets) ||
            exercise.sets.some(
              (entry) =>
                !isMap(entry) ||
                !Number.isFinite(Number(entry.weight)) ||
                !Number.isFinite(Number(entry.reps)),
            ),
        )
      ) {
        throw new Error(
          "Invalid history data: malformed workout session or sets.",
        );
      }
    }

    const prs = data.gym_prs ?? data.personalRecords ?? data.prs ?? {};
    if (
      Object.values(prs).some(
        (weight) =>
          !["number", "string"].includes(typeof weight) ||
          !Number.isFinite(Number(weight)) ||
          Number(weight) < 0,
      )
    ) {
      throw new Error(
        "Invalid personal records data: expected non-negative numeric weights.",
      );
    }

    const rawExercises = data.gym_exercises ?? data.exercises ?? [];
    const exercises = sanitizeExerciseList(rawExercises);

    const programs = data.gym_programs ?? data.programs ?? {};
    const schedule =
      data.gym_schedule ?? data.schedule ?? data.weeklySchedule ?? {};
    const overrides =
      data.gym_custom_program_overrides ??
      data.gym_custom_overrides ??
      data.customProgramOverrides ??
      {};
    const dbVersion = data.gym_db_version ?? data.dbVersion ?? DATABASE_VERSION;
    const profile = data.gym_profile ?? data.userProfile ?? null;
    const activeProgram = data.gym_active_program ?? data.activeProgram ?? null;
    const hasNutritionTargets =
      Object.hasOwn(data, "gym_nutrition") ||
      Object.hasOwn(data, "nutritionTargets");
    const nutritionTargets = data.gym_nutrition ?? data.nutritionTargets;
    if (hasNutritionTargets && !isValidNutritionTargets(nutritionTargets)) {
      throw new Error(
        "Invalid nutrition targets: expected positive calories and non-negative numeric targets.",
      );
    }
    const rawMeasurements = data.gym_measurements ?? data.measurements;
    const measurements =
      rawMeasurements === undefined
        ? null
        : normalizeMeasurements(rawMeasurements);

    if (
      Object.values(programs).some(
        (program) =>
          !isMap(program) ||
          !Array.isArray(program.exercises) ||
          program.exercises.some((id) => typeof id !== "string"),
      )
    ) {
      throw new Error(
        "Invalid programs data: expected programs with exercise ID arrays.",
      );
    }

    const updates = {};
    if (data.gym_history !== undefined || data.history !== undefined)
      updates.gym_history = history;
    if (
      data.gym_prs !== undefined ||
      data.personalRecords !== undefined ||
      data.prs !== undefined
    )
      updates.gym_prs = prs;
    if (exercises.length > 0) {
      updates.gym_exercises = exercises;
    }
    if (Object.keys(programs).length > 0) {
      updates.gym_programs = programs;
    }
    if (Object.keys(schedule).length > 0) {
      updates.gym_schedule = schedule;
    }
    if (
      data.gym_custom_program_overrides !== undefined ||
      data.gym_custom_overrides !== undefined ||
      data.customProgramOverrides !== undefined
    ) {
      updates.gym_custom_program_overrides = overrides;
    }
    if (hasNutritionTargets) updates.gym_nutrition = nutritionTargets;
    if (profile) updates.gym_profile = profile;
    if (activeProgram) updates.gym_active_program = activeProgram;
    if (measurements) updates.gym_measurements = measurements;

    const serialized = Object.entries(updates).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    serialized.push(["gym_db_version", String(dbVersion)]);
    const written = [];
    try {
      for (const [key, value] of serialized) {
        const previous = localStorage.getItem(key);
        localStorage.setItem(key, value);
        written.push([key, previous]);
      }
    } catch (error) {
      // A full/disabled store must not leave a half-restored backup or report success.
      for (const [key, previous] of written.reverse()) {
        if (previous === null) localStorage.removeItem(key);
        else localStorage.setItem(key, previous);
      }
      throw error;
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
