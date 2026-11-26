import { beforeEach, describe, expect, it, vi } from "vitest";
import defaultExercises, { trainingPlans } from "../data/exercises";
import { DATABASE_VERSION } from "./helpers";
import {
  PRE_MIGRATION_BACKUP_KEY,
  migrateUserDatabase,
  rollbackMigrationSnapshot,
} from "./migration";

const LEGACY_V3_HISTORY = [
  {
    id: "sess_legacy_1",
    date: "2026-10-12",
    programId: "push_day",
    exercises: [
      {
        exerciseId: "chest_bb_flat_bench",
        sets: [
          { weight: 80, reps: 8 },
          { weight: 85, reps: 6 },
        ],
      },
      {
        exerciseId: "custom_landmine_press_1",
        sets: [{ weight: 40, reps: 10 }],
      },
    ],
  },
];

const LEGACY_V3_PRS = {
  chest_bb_flat_bench: 100,
  leg_bb_back_squat: 140,
  custom_landmine_press_1: 55,
};

const LEGACY_CUSTOM_EXERCISE = {
  id: "custom_landmine_press_1",
  name: "Half-Kneeling Landmine Press",
  muscle: "Shoulders",
  targetAngle: "anterior_delt",
  equipment: "barbell",
  default_sets: 3,
  default_reps: 10,
  image: null,
  tips: "Brace core and press along arc.",
  isCustom: true,
};

const LEGACY_SAVED_PROGRAMS = {
  my_custom_split: {
    id: "my_custom_split",
    name: "My Custom Upper",
    muscles: ["Chest", "Back"],
    exercises: ["chest_bb_flat_bench", "custom_landmine_press_1"],
    isCustom: true,
  },
};

const LEGACY_SAVED_SCHEDULE = {
  0: "my_custom_split",
  1: null,
  2: "my_custom_split",
  3: null,
  4: null,
  5: null,
  6: null,
};

const LEGACY_OVERRIDES = {
  push_day: {
    chest_bb_flat_bench: "chest_db_flat_press",
  },
};

describe("v3 -> v4 safe non-destructive migration, deduplication, and rollback", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("backs up existing user data and preserves history, PRs, custom exercises, saved plans, and all legacy IDs", () => {
    localStorage.setItem("gym_db_version", "3.0.0");
    localStorage.setItem("gym_history", JSON.stringify(LEGACY_V3_HISTORY));
    localStorage.setItem("gym_prs", JSON.stringify(LEGACY_V3_PRS));
    localStorage.setItem(
      "gym_exercises",
      JSON.stringify([
        // Simulate stale built-in + duplicate built-in + custom exercise + duplicate custom exercise
        { id: "chest_bb_flat_bench", name: "Old Flat Bench", muscle: "Chest" },
        { id: "chest_bb_flat_bench", name: "Duplicate Flat Bench", muscle: "Chest" },
        LEGACY_CUSTOM_EXERCISE,
        { ...LEGACY_CUSTOM_EXERCISE, name: "Duplicate Custom" },
      ]),
    );
    localStorage.setItem("gym_programs", JSON.stringify(LEGACY_SAVED_PROGRAMS));
    localStorage.setItem("gym_schedule", JSON.stringify(LEGACY_SAVED_SCHEDULE));
    localStorage.setItem(
      "gym_custom_program_overrides",
      JSON.stringify(LEGACY_OVERRIDES),
    );

    const result = migrateUserDatabase({
      defaultExercises,
      trainingPlans,
      storage: localStorage,
    });

    expect(result.migrated).toBe(true);
    expect(result.rolledBack).toBe(false);
    expect(result.backedUp).toBe(true);
    expect(localStorage.getItem("gym_db_version")).toBe(DATABASE_VERSION);

    // Backup snapshot was saved with untouched v3 payloads
    const backup = JSON.parse(localStorage.getItem(PRE_MIGRATION_BACKUP_KEY));
    expect(backup.fromVersion).toBe("3.0.0");
    expect(JSON.parse(backup.keys.gym_history)).toEqual(LEGACY_V3_HISTORY);
    expect(JSON.parse(backup.keys.gym_prs)).toEqual(LEGACY_V3_PRS);

    // Existing user data is untouched
    expect(JSON.parse(localStorage.getItem("gym_history"))).toEqual(
      LEGACY_V3_HISTORY,
    );
    expect(JSON.parse(localStorage.getItem("gym_prs"))).toEqual(LEGACY_V3_PRS);
    expect(JSON.parse(localStorage.getItem("gym_programs"))).toEqual(
      LEGACY_SAVED_PROGRAMS,
    );
    expect(JSON.parse(localStorage.getItem("gym_schedule"))).toEqual(
      LEGACY_SAVED_SCHEDULE,
    );
    expect(
      JSON.parse(localStorage.getItem("gym_custom_program_overrides")),
    ).toEqual(LEGACY_OVERRIDES);

    // Merged exercises include every built-in exercise + custom exercise, zero duplicates
    const migratedExercises = JSON.parse(localStorage.getItem("gym_exercises"));
    const ids = migratedExercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(migratedExercises.length).toBe(defaultExercises.length + 1);
    expect(ids).toContain("chest_bb_flat_bench");
    expect(ids).toContain("glute_bb_hip_thrust");
    expect(ids).toContain(LEGACY_CUSTOM_EXERCISE.id);

    // Custom exercise preserved verbatim (first copy kept, duplicate removed)
    const custom = migratedExercises.find(
      (e) => e.id === LEGACY_CUSTOM_EXERCISE.id,
    );
    expect(custom).toEqual(LEGACY_CUSTOM_EXERCISE);
  });

  it("rolls back atomically to pre-migration state if storage fails mid-migration", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const backingMap = new Map([
      ["gym_db_version", "3.0.0"],
      ["gym_history", JSON.stringify(LEGACY_V3_HISTORY)],
      ["gym_prs", JSON.stringify(LEGACY_V3_PRS)],
      ["gym_exercises", JSON.stringify([LEGACY_CUSTOM_EXERCISE])],
      ["gym_programs", JSON.stringify(LEGACY_SAVED_PROGRAMS)],
      ["gym_schedule", JSON.stringify(LEGACY_SAVED_SCHEDULE)],
    ]);

    let failNextDbVersionWrite = true;
    const flakyStorage = {
      getItem: (k) => (backingMap.has(k) ? backingMap.get(k) : null),
      setItem: (k, v) => {
        if (k === "gym_db_version" && failNextDbVersionWrite) {
          failNextDbVersionWrite = false;
          throw new Error("QuotaExceededError");
        }
        backingMap.set(k, String(v));
      },
      removeItem: (k) => backingMap.delete(k),
    };

    const result = migrateUserDatabase({
      defaultExercises,
      trainingPlans,
      storage: flakyStorage,
    });

    expect(result.migrated).toBe(false);
    expect(result.rolledBack).toBe(true);
    // Exact pre-migration state restored
    expect(flakyStorage.getItem("gym_db_version")).toBe("3.0.0");
    expect(JSON.parse(flakyStorage.getItem("gym_exercises"))).toEqual([
      LEGACY_CUSTOM_EXERCISE,
    ]);
    expect(JSON.parse(flakyStorage.getItem("gym_history"))).toEqual(
      LEGACY_V3_HISTORY,
    );
    expect(JSON.parse(flakyStorage.getItem("gym_programs"))).toEqual(
      LEGACY_SAVED_PROGRAMS,
    );
  });

  it("supports explicit manual rollback from saved pre-migration snapshot", () => {
    localStorage.setItem("gym_db_version", "3.0.0");
    localStorage.setItem("gym_exercises", JSON.stringify([LEGACY_CUSTOM_EXERCISE]));
    localStorage.setItem("gym_prs", JSON.stringify(LEGACY_V3_PRS));

    migrateUserDatabase({
      defaultExercises,
      trainingPlans,
      storage: localStorage,
    });
    expect(localStorage.getItem("gym_db_version")).toBe(DATABASE_VERSION);

    const snapshot = JSON.parse(localStorage.getItem(PRE_MIGRATION_BACKUP_KEY));
    expect(rollbackMigrationSnapshot(snapshot, localStorage)).toBe(true);
    expect(localStorage.getItem("gym_db_version")).toBe("3.0.0");
    expect(JSON.parse(localStorage.getItem("gym_exercises"))).toEqual([
      LEGACY_CUSTOM_EXERCISE,
    ]);
    expect(JSON.parse(localStorage.getItem("gym_prs"))).toEqual(LEGACY_V3_PRS);
  });

  it("syncs older 72-exercise v4.0.0 storage up to full 94 built-in catalog without data loss", () => {
    const staleBuiltInSubset = defaultExercises.slice(0, 72);
    localStorage.setItem("gym_db_version", DATABASE_VERSION);
    localStorage.setItem("gym_history", JSON.stringify(LEGACY_V3_HISTORY));
    localStorage.setItem("gym_prs", JSON.stringify(LEGACY_V3_PRS));
    localStorage.setItem(
      "gym_exercises",
      JSON.stringify([...staleBuiltInSubset, LEGACY_CUSTOM_EXERCISE]),
    );
    localStorage.setItem("gym_programs", JSON.stringify(LEGACY_SAVED_PROGRAMS));

    const result = migrateUserDatabase({
      defaultExercises,
      trainingPlans,
      storage: localStorage,
    });

    expect(result.catalogSynced).toBe(true);
    expect(localStorage.getItem("gym_db_version")).toBe(DATABASE_VERSION);

    const synced = JSON.parse(localStorage.getItem("gym_exercises"));
    expect(synced).toHaveLength(defaultExercises.length + 1);
    for (const ex of defaultExercises) {
      expect(synced.some((item) => item.id === ex.id)).toBe(true);
    }
    expect(synced.find((item) => item.id === LEGACY_CUSTOM_EXERCISE.id)).toEqual(
      LEGACY_CUSTOM_EXERCISE,
    );
    expect(JSON.parse(localStorage.getItem("gym_history"))).toEqual(
      LEGACY_V3_HISTORY,
    );
    expect(JSON.parse(localStorage.getItem("gym_prs"))).toEqual(LEGACY_V3_PRS);
    expect(JSON.parse(localStorage.getItem("gym_programs"))).toEqual(
      LEGACY_SAVED_PROGRAMS,
    );
  });

  it("respects explicitly deleted built-in exercises across v4 catalog syncs until reset", () => {
    const deletedId = defaultExercises[defaultExercises.length - 1].id;
    const remainingBuiltIns = defaultExercises.filter((ex) => ex.id !== deletedId);

    localStorage.setItem("gym_db_version", DATABASE_VERSION);
    localStorage.setItem("gym_exercises", JSON.stringify(remainingBuiltIns));
    localStorage.setItem("gym_deleted_builtin_ids", JSON.stringify([deletedId]));

    const result = migrateUserDatabase({
      defaultExercises,
      trainingPlans,
      storage: localStorage,
    });

    expect(result.catalogSynced).toBe(true);
    const synced = JSON.parse(localStorage.getItem("gym_exercises"));
    expect(synced).toHaveLength(defaultExercises.length - 1);
    expect(synced.some((ex) => ex.id === deletedId)).toBe(false);
  });
});
