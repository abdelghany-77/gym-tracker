import defaultExercises, {
  trainingPlans,
} from "../data/exercises";
import {
  DATABASE_VERSION,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  generateId,
  sanitizeExerciseList,
  mergeCustomOverrides,
} from "./helpers";

// ── Database Version Check & Safe Migration ──
// Instead of wiping user data on version mismatch, perform incremental migration
// that preserves custom exercises, custom programs, overrides, and schedule.
export const purgeAndSyncDatabase = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const currentVersion = localStorage.getItem(STORAGE_KEYS.dbVersion);

    if (currentVersion === DATABASE_VERSION) return; // No migration needed

    // ── BACKUP before migration ──
    const backupKey = `gym_pre_migration_backup_${Date.now()}`;
    try {
      const backup = {
        exercises: loadFromStorage(STORAGE_KEYS.exercises, null),
        programs: loadFromStorage(STORAGE_KEYS.programs, null),
        schedule: loadFromStorage(STORAGE_KEYS.schedule, null),
        overrides: loadFromStorage(STORAGE_KEYS.overrides, null),
        overridesLegacy: loadFromStorage(STORAGE_KEYS.overridesLegacy, null),
        version: currentVersion,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (e) {
      console.warn("Pre-migration backup failed:", e);
      // Continue with migration — we still have the original keys in place
    }

    // ── MERGE default exercises with user custom exercises ──
    const existingExercises = loadFromStorage(STORAGE_KEYS.exercises, []);
    const defaultIds = new Set(defaultExercises.map((e) => e.id));

    // Separate user-custom exercises (those not in the default catalog)
    const customExercises = existingExercises.filter(
      (ex) => ex.isCustom || !defaultIds.has(ex.id)
    );

    // Build merged list: fresh defaults + user customs (no duplicates)
    const merged = sanitizeExerciseList([...defaultExercises, ...customExercises]);
    saveToStorage(STORAGE_KEYS.exercises, merged);

    // ── MERGE programs: keep custom programs, update default ones ──
    const existingPrograms = loadFromStorage(STORAGE_KEYS.programs, null);
    if (existingPrograms && typeof existingPrograms === "object") {
      const activePlan = loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper");
      const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
      const defaultProgramIds = new Set(Object.keys(plan.programs));

      // Keep custom programs untouched, refresh default program definitions
      const mergedPrograms = {};
      // First, add all default programs from the current plan
      for (const [id, prog] of Object.entries(plan.programs)) {
        mergedPrograms[id] = { ...prog };
      }
      // Then, add custom programs that aren't defaults
      for (const [id, prog] of Object.entries(existingPrograms)) {
        if (!defaultProgramIds.has(id) || prog.isCustom) {
          mergedPrograms[id] = prog;
        }
      }
      saveToStorage(STORAGE_KEYS.programs, mergedPrograms);
    } else {
      // No existing programs — seed from the active plan
      const activePlan = loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper");
      const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
      saveToStorage(STORAGE_KEYS.programs, plan.programs);
    }

    // ── PRESERVE schedule if it exists, otherwise seed ──
    const existingSchedule = loadFromStorage(STORAGE_KEYS.schedule, null);
    if (!existingSchedule || Object.keys(existingSchedule).length === 0) {
      const activePlan = loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper");
      const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
      saveToStorage(STORAGE_KEYS.schedule, plan.defaultSchedule);
    }

    // ── UNIFY override keys ──
    mergeCustomOverrides();

    // ── SET new version ──
    localStorage.setItem(STORAGE_KEYS.dbVersion, DATABASE_VERSION);

  } catch (e) {
    console.warn("Database migration failed:", e);
    // On failure, do NOT wipe data. Keep what we have.
  }
};

// Execute version check immediately before store initialization
purgeAndSyncDatabase();

// ── Seed logic ──
const seedExercises = () => {
  const stored = loadFromStorage(STORAGE_KEYS.exercises, null);
  if (stored) {
    const sanitized = sanitizeExerciseList(stored);
    saveToStorage(STORAGE_KEYS.exercises, sanitized);
    return sanitized;
  }
  const initial = sanitizeExerciseList(defaultExercises);
  saveToStorage(STORAGE_KEYS.exercises, initial);
  return initial;
};

const seedPrograms = () => {
  const stored = loadFromStorage(STORAGE_KEYS.programs, null);
  if (stored) return stored;
  // Seed from the active program's plan
  const activePlan = loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper");
  const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
  const programs = { ...plan.programs };
  saveToStorage(STORAGE_KEYS.programs, programs);
  return programs;
};

const seedSchedule = () => {
  const stored = loadFromStorage(STORAGE_KEYS.schedule, null);
  if (stored) return stored;
  const activePlan = loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper");
  const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
  const schedule = { ...plan.defaultSchedule };
  saveToStorage(STORAGE_KEYS.schedule, schedule);
  return schedule;
};

// ── Exercise Slice ──
export const createExerciseSlice = (set, get) => ({
  // State
  exercises: seedExercises(),
  programs: seedPrograms(),
  weeklySchedule: seedSchedule(),
  activeProgram: loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper"),
  purgeAndSyncDatabase,

  // Getters
  getExerciseById: (id) => {
    if (!id) return null;
    const found = get().exercises.find((e) => e.id === id);
    if (found) return found;

    // Graceful fallback for legacy unmatched exercise IDs in history/PRs
    const fallbackName = String(id)
      .replace(/^(chest_|back_|sh_|leg_|arm_|core_)/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      id,
      name: fallbackName || "Exercise",
      nameAr: "",
      primaryMuscle: "chest",
      muscle: "Other",
      targetAngle: "mid_chest",
      equipment: "dumbbell",
      category: "compound",
      defaultSets: 3,
      defaultReps: 10,
      default_sets: 3,
      default_reps: 10,
      image: `/exercises/${id}.png`,
      tips: "",
      isFallback: true,
    };
  },
  getAllExercises: () => get().exercises,
  getPrograms: () => get().programs,
  getSchedule: () => get().weeklySchedule,
  getActiveProgram: () => get().activeProgram,
  getActivePlanData: () => trainingPlans[get().activeProgram] || trainingPlans.ppl_upper,

  // ── Switch Training Program ──
  setActiveProgram: (planId) => {
    const plan = trainingPlans[planId];
    if (!plan) return;

    const newPrograms = { ...plan.programs };
    const newSchedule = { ...plan.defaultSchedule };

    saveToStorage(STORAGE_KEYS.activeProgram, planId);
    saveToStorage(STORAGE_KEYS.programs, newPrograms);
    saveToStorage(STORAGE_KEYS.schedule, newSchedule);

    set({
      activeProgram: planId,
      programs: newPrograms,
      weeklySchedule: newSchedule,
      activeWorkout: null, // cancel any in-progress workout
    });
  },

  // CRUD: Exercises
  addExercise: (exercise) => {
    set((state) => {
      const newExercise = {
        id: generateId(),
        name: exercise.name || "New Exercise",
        nameAr: exercise.nameAr || "",
        primaryMuscle: (exercise.muscle || "Chest").toLowerCase(),
        muscle: exercise.muscle || "Chest",
        targetAngle: exercise.targetAngle || "mid_chest",
        equipment: exercise.equipment || "dumbbell",
        category: exercise.category || "compound",
        defaultSets: exercise.default_sets || exercise.defaultSets || 3,
        defaultReps: exercise.default_reps || exercise.defaultReps || 10,
        default_sets: exercise.default_sets || exercise.defaultSets || 3,
        default_reps: exercise.default_reps || exercise.defaultReps || 10,
        image: exercise.image || null,
        tips: exercise.tips || "",
        isCustom: true,
      };
      const updated = sanitizeExerciseList([...state.exercises, newExercise]);
      saveToStorage(STORAGE_KEYS.exercises, updated);
      return { exercises: updated };
    });
  },

  updateExercise: (id, updates) => {
    set((state) => {
      const updated = sanitizeExerciseList(
        state.exercises.map((ex) =>
          ex.id === id ? { ...ex, ...updates } : ex,
        )
      );
      saveToStorage(STORAGE_KEYS.exercises, updated);
      return { exercises: updated };
    });
  },

  deleteExercise: (id) => {
    set((state) => {
      const updated = sanitizeExerciseList(state.exercises.filter((ex) => ex.id !== id));
      const updatedPrograms = { ...state.programs };
      Object.keys(updatedPrograms).forEach((key) => {
        updatedPrograms[key] = {
          ...updatedPrograms[key],
          exercises: updatedPrograms[key].exercises.filter(
            (exId) => exId !== id,
          ),
        };
      });
      saveToStorage(STORAGE_KEYS.exercises, updated);
      saveToStorage(STORAGE_KEYS.programs, updatedPrograms);
      return { exercises: updated, programs: updatedPrograms };
    });
  },

  // CRUD: Programs
  addProgram: (program) => {
    const id = generateId();
    set((state) => {
      const newProgram = {
        id,
        name: program.name || "New Program",
        muscles: program.muscles || [],
        exercises: program.exercises || [],
        isCustom: true,
      };
      const updated = { ...state.programs, [id]: newProgram };
      saveToStorage(STORAGE_KEYS.programs, updated);
      return { programs: updated };
    });
    return id;
  },

  updateProgram: (id, updates) => {
    set((state) => {
      const updated = {
        ...state.programs,
        [id]: { ...state.programs[id], ...updates },
      };
      saveToStorage(STORAGE_KEYS.programs, updated);
      return { programs: updated };
    });
  },

  deleteProgram: (id) => {
    set((state) => {
      const updated = { ...state.programs };
      delete updated[id];
      const updatedSchedule = { ...state.weeklySchedule };
      Object.keys(updatedSchedule).forEach((day) => {
        if (updatedSchedule[day] === id) updatedSchedule[day] = null;
      });
      saveToStorage(STORAGE_KEYS.programs, updated);
      saveToStorage(STORAGE_KEYS.schedule, updatedSchedule);
      return { programs: updated, weeklySchedule: updatedSchedule };
    });
  },

  // Schedule
  setSchedule: (dayIndex, programId) => {
    set((state) => {
      const updated = { ...state.weeklySchedule, [dayIndex]: programId };
      saveToStorage(STORAGE_KEYS.schedule, updated);
      return { weeklySchedule: updated };
    });
  },

  // Reorder
  reorderExerciseInProgram: (programId, fromIndex, toIndex) => {
    set((state) => {
      const program = state.programs[programId];
      if (!program) return state;
      const exercises = [...program.exercises];
      const [moved] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, moved);
      const updatedPrograms = {
        ...state.programs,
        [programId]: { ...program, exercises },
      };
      saveToStorage(STORAGE_KEYS.programs, updatedPrograms);
      return { programs: updatedPrograms };
    });
  },

  // Reset to Defaults (respects active program)
  resetToDefaults: () => {
    const activePlan = get().activeProgram || "ppl_upper";
    const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;

    const sanitizedDefaults = sanitizeExerciseList(defaultExercises);
    saveToStorage(STORAGE_KEYS.exercises, sanitizedDefaults);
    saveToStorage(STORAGE_KEYS.programs, plan.programs);
    saveToStorage(STORAGE_KEYS.schedule, plan.defaultSchedule);
    set({
      exercises: sanitizedDefaults,
      programs: { ...plan.programs },
      weeklySchedule: { ...plan.defaultSchedule },
    });
  },
});
