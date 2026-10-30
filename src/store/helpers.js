// ── Schema Version ──
export const DATABASE_VERSION = "3.0.0";

// ── Legacy ID to Canonical ID Mapping ──
export const LEGACY_EXERCISE_ID_MAP = {
  // Chest
  chest_barbell_bench: "chest_bb_flat_bench",
  chest_flat_barbell_bench: "chest_bb_flat_bench",
  chest_incline_db: "chest_db_incline_press",
  chest_cable_fly: "chest_high_to_low_cable_fly",
  chest_pec_deck: "chest_pec_deck_fly",
  chest_flat_db_fly: "chest_db_flat_press",
  // Back
  back_lat_pulldown: "back_wide_lat_pulldown",
  back_bent_row: "back_bb_bent_over_row",
  back_cable_row: "back_seated_cable_row",
  back_single_db_row: "back_db_single_arm_row",
  back_face_pulls: "back_face_pulls",
  back_extensions: "back_hyperextension",
  back_reverse_bb_row: "back_close_grip_pulldown",
  // Shoulders
  sh_overhead_press: "sh_standing_bb_ohp",
  sh_lateral_raise: "sh_db_lateral_raise",
  sh_front_raise: "sh_standing_bb_ohp",
  sh_reverse_fly: "sh_reverse_pec_deck",
  sh_face_pulls_sh: "back_face_pulls",
  sh_shrugs: "sh_bb_shrugs",
  // Arms
  arm_barbell_curl: "arm_bb_bicep_curl",
  arm_hammer_curl: "arm_db_hammer_curl",
  arm_incline_curl: "arm_db_incline_curl",
  arm_tricep_pushdown: "arm_rope_pushdown",
  arm_overhead_ext: "arm_overhead_cable_ext",
  arm_wrist_curl: "arm_cable_rope_curl",
  arm_reverse_curl: "arm_db_hammer_curl",
  // Legs
  leg_squat: "leg_bb_back_squat",
  leg_press: "leg_45_press",
  leg_lunges: "leg_walking_lunges",
  leg_rdl: "leg_bb_rdl",
  leg_curl: "leg_lying_curl",
  leg_adductor: "leg_extension",
  leg_calf_raise: "leg_standing_calf_raise",
};

// ── Normalize exercise names for semantic deduplication ──
export const normalizeExerciseName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/^flat\s+barbell\s+bench\s+press$/, "barbell bench press")
    .replace(/^flat\s+bench\s+press$/, "barbell bench press")
    .replace(/\s+/g, " ")
    .trim();
};

// ── Helper: Deduplication & Sanitizer ──
export const sanitizeExerciseList = (list) => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const seenNames = new Set();
  const result = [];

  for (const item of list) {
    if (!item) continue;
    
    // Map legacy ID if present
    const rawId = item.id;
    const resolvedId = LEGACY_EXERCISE_ID_MAP[rawId] || rawId;
    if (!resolvedId) continue;

    // Check ID duplicate
    if (seenIds.has(resolvedId)) continue;

    // Check semantic name duplicate
    const normName = normalizeExerciseName(item.name);
    if (normName && seenNames.has(normName)) continue;

    seenIds.add(resolvedId);
    if (normName) seenNames.add(normName);

    result.push({
      ...item,
      id: resolvedId,
    });
  }

  return result;
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

// ── Backup & Restore Engine ──

/**
 * Export all core gym tracker data into a single timestamped JSON file
 * and trigger browser download.
 */
export const exportUserData = () => {
  const exportPayload = {
    gym_history: loadFromStorage("gym_history", []),
    gym_prs: loadFromStorage("gym_prs", {}),
    gym_exercises: loadFromStorage("gym_exercises", []),
    gym_programs: loadFromStorage("gym_programs", {}),
    gym_schedule: loadFromStorage("gym_schedule", {}),
    gym_custom_program_overrides: loadFromStorage("gym_custom_program_overrides", {}),
    gym_db_version: loadFromStorage("gym_db_version", DATABASE_VERSION),
    // Additional user data for completeness
    gym_profile: loadFromStorage("gym_profile", { name: "", weight: 0, height: 0, age: 0 }),
    gym_active_program: loadFromStorage("gym_active_program", "ppl_upper"),
    gym_measurements: loadFromStorage("gym_measurements", []),
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
    const overrides = data.gym_custom_program_overrides ?? data.customProgramOverrides ?? {};
    const dbVersion = data.gym_db_version ?? data.dbVersion ?? DATABASE_VERSION;
    const profile = data.gym_profile ?? data.userProfile ?? null;
    const activeProgram = data.gym_active_program ?? data.activeProgram ?? null;
    const measurements = data.gym_measurements ?? data.measurements ?? null;

    // Persist verified keys to localStorage
    saveToStorage("gym_history", history);
    saveToStorage("gym_prs", prs);
    if (exercises.length > 0) {
      saveToStorage("gym_exercises", exercises);
    }
    if (Object.keys(programs).length > 0) {
      saveToStorage("gym_programs", programs);
    }
    if (Object.keys(schedule).length > 0) {
      saveToStorage("gym_schedule", schedule);
    }
    saveToStorage("gym_custom_program_overrides", overrides);
    saveToStorage("gym_db_version", String(dbVersion));

    if (profile) saveToStorage("gym_profile", profile);
    if (activeProgram) saveToStorage("gym_active_program", activeProgram);
    if (Array.isArray(measurements)) saveToStorage("gym_measurements", measurements);

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
