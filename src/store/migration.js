import {
  DATABASE_VERSION,
  loadFromStorage,
  loadProgramOverrides,
  sanitizeExerciseList,
} from "./helpers";

export const PRE_MIGRATION_BACKUP_KEY = "gym_pre_migration_backup_v3";

const USER_STORAGE_KEYS = [
  "gym_history",
  "gym_prs",
  "gym_exercises",
  "gym_programs",
  "gym_schedule",
  "gym_custom_program_overrides",
  "gym_custom_overrides",
  "gym_profile",
  "gym_active_program",
  "gym_measurements",
  "gym_nutrition",
  "gym_db_version",
];

function readRawVersion(storage) {
  const raw = storage.getItem("gym_db_version");
  if (!raw) return null;
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/**
 * Merges incoming built-in exercises with persisted user exercises:
 * - Refreshes built-in catalog fields while preserving all legacy built-in IDs
 * - Preserves every user-created custom exercise (isCustom: true or non-catalog ID)
 * - Deduplicates duplicate IDs without overwriting custom user entries
 */
export function mergeExercisesNonDestructively(storedList, builtInCatalog) {
  const builtInById = new Map(builtInCatalog.map((ex) => [ex.id, ex]));
  const storedSanitized = sanitizeExerciseList(
    Array.isArray(storedList) ? storedList : [],
  );

  const customExercises = storedSanitized.filter(
    (ex) => ex.isCustom === true || !builtInById.has(ex.id),
  );

  // Built-in exercises take canonical catalog metadata; custom user exercises append cleanly.
  return sanitizeExerciseList([...builtInCatalog, ...customExercises]);
}

/**
 * Captures a complete, unmodified backup snapshot of existing user storage keys
 * before any schema migration runs.
 */
export function createPreMigrationSnapshot(storage = window.localStorage) {
  const snapshot = {
    backedUpAt: new Date().toISOString(),
    fromVersion: readRawVersion(storage),
    targetVersion: DATABASE_VERSION,
    keys: {},
  };

  for (const key of USER_STORAGE_KEYS) {
    const raw = storage.getItem(key);
    if (raw !== null) {
      snapshot.keys[key] = raw;
    }
  }

  return snapshot;
}

/**
 * Restores all captured user keys from a pre-migration snapshot.
 */
export function rollbackMigrationSnapshot(
  snapshot,
  storage = window.localStorage,
) {
  if (!snapshot || typeof snapshot !== "object" || !snapshot.keys) {
    return false;
  }

  for (const key of USER_STORAGE_KEYS) {
    if (Object.hasOwn(snapshot.keys, key)) {
      storage.setItem(key, snapshot.keys[key]);
    } else {
      storage.removeItem(key);
    }
  }
  return true;
}

/**
 * Non-destructive schema migration (e.g. v3 -> v4):
 * 1. Backs up existing user data before touching any key
 * 2. Preserves workout history, PRs, saved programs, schedules, overrides, and custom exercises
 * 3. Merges updated built-in catalog and deduplicates safely
 * 4. Rolls back atomically if any write or validation fails
 */
export function migrateUserDatabase({
  defaultExercises,
  trainingPlans,
  storage = typeof window !== "undefined" ? window.localStorage : null,
} = {}) {
  if (!storage || !Array.isArray(defaultExercises) || !trainingPlans) {
    return { migrated: false, rolledBack: false, reason: "unavailable" };
  }

  const currentVersion = readRawVersion(storage);
  if (currentVersion === DATABASE_VERSION) {
    return { migrated: false, rolledBack: false, version: DATABASE_VERSION };
  }

  const snapshot = createPreMigrationSnapshot(storage);
  const hasExistingData = Object.keys(snapshot.keys).length > 0;

  try {
    // 1. Save pre-migration backup snapshot when user data already exists
    if (hasExistingData) {
      storage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify(snapshot));
    }

    // 2. Non-destructively merge exercises (preserve custom exercises & all 89 legacy IDs)
    const rawStoredExercises = loadFromStorage("gym_exercises", null);
    const mergedExercises = mergeExercisesNonDestructively(
      rawStoredExercises,
      defaultExercises,
    );

    // Validate integrity before writing
    const mergedIds = new Set(mergedExercises.map((e) => e.id));
    if (mergedIds.size !== mergedExercises.length) {
      throw new Error("Duplicate exercise IDs detected after migration merge.");
    }
    for (const builtIn of defaultExercises) {
      if (!mergedIds.has(builtIn.id)) {
        throw new Error(`Built-in exercise missing after merge: ${builtIn.id}`);
      }
    }

    // 3. Seed programs/schedule ONLY if missing; never overwrite saved user plans or overrides
    const activePlan = loadFromStorage("gym_active_program", "ppl_upper");
    const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;

    const existingPrograms = loadFromStorage("gym_programs", null);
    const existingSchedule = loadFromStorage("gym_schedule", null);
    const existingOverrides = loadProgramOverrides();

    storage.setItem("gym_exercises", JSON.stringify(mergedExercises));

    if (!existingPrograms || Object.keys(existingPrograms).length === 0) {
      storage.setItem("gym_programs", JSON.stringify(plan.programs));
    }
    if (!existingSchedule || Object.keys(existingSchedule).length === 0) {
      storage.setItem("gym_schedule", JSON.stringify(plan.defaultSchedule));
    }
    if (
      storage.getItem("gym_custom_program_overrides") === null &&
      existingOverrides &&
      Object.keys(existingOverrides).length > 0
    ) {
      storage.setItem(
        "gym_custom_program_overrides",
        JSON.stringify(existingOverrides),
      );
    }

    storage.setItem("gym_db_version", DATABASE_VERSION);

    return {
      migrated: true,
      rolledBack: false,
      fromVersion: currentVersion,
      toVersion: DATABASE_VERSION,
      backedUp: hasExistingData,
      exerciseCount: mergedExercises.length,
    };
  } catch (error) {
    // Atomic rollback to pre-migration snapshot
    try {
      rollbackMigrationSnapshot(snapshot, storage);
    } catch (rollbackError) {
      console.error("Migration rollback failed:", rollbackError);
    }
    console.warn("Database migration failed and was rolled back:", error);
    return {
      migrated: false,
      rolledBack: true,
      error: error?.message || "Migration failed",
    };
  }
}
