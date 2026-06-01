import defaultExercises, {
  trainingPlans,
  workoutPrograms as defaultPrograms,
  weeklySchedule as defaultSchedule,
} from "../data/exercises";
import { loadFromStorage, saveToStorage, generateId } from "./helpers";

// ── Seed logic ──
const seedExercises = () => {
  const stored = loadFromStorage("gym_exercises", null);
  if (stored) return stored;
  saveToStorage("gym_exercises", defaultExercises);
  return defaultExercises;
};

const seedPrograms = () => {
  const stored = loadFromStorage("gym_programs", null);
  if (stored) return stored;
  // Seed from the active program's plan
  const activePlan = loadFromStorage("gym_active_program", "ppl_upper");
  const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
  const programs = { ...plan.programs };
  saveToStorage("gym_programs", programs);
  return programs;
};

const seedSchedule = () => {
  const stored = loadFromStorage("gym_schedule", null);
  if (stored) return stored;
  const activePlan = loadFromStorage("gym_active_program", "ppl_upper");
  const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;
  const schedule = { ...plan.defaultSchedule };
  saveToStorage("gym_schedule", schedule);
  return schedule;
};

// ── Exercise Slice ──
export const createExerciseSlice = (set, get) => ({
  // State
  exercises: seedExercises(),
  programs: seedPrograms(),
  weeklySchedule: seedSchedule(),
  activeProgram: loadFromStorage("gym_active_program", "ppl_upper"),

  // Getters
  getExerciseById: (id) => get().exercises.find((e) => e.id === id),
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

    saveToStorage("gym_active_program", planId);
    saveToStorage("gym_programs", newPrograms);
    saveToStorage("gym_schedule", newSchedule);

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
        muscle: exercise.muscle || "Chest",
        image: exercise.image || null,
        tips: exercise.tips || "",
        default_sets: exercise.default_sets || 3,
        default_reps: exercise.default_reps || 10,
        isCustom: true,
      };
      const updated = [...state.exercises, newExercise];
      saveToStorage("gym_exercises", updated);
      return { exercises: updated };
    });
  },

  updateExercise: (id, updates) => {
    set((state) => {
      const updated = state.exercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex,
      );
      saveToStorage("gym_exercises", updated);
      return { exercises: updated };
    });
  },

  deleteExercise: (id) => {
    set((state) => {
      const updated = state.exercises.filter((ex) => ex.id !== id);
      const updatedPrograms = { ...state.programs };
      Object.keys(updatedPrograms).forEach((key) => {
        updatedPrograms[key] = {
          ...updatedPrograms[key],
          exercises: updatedPrograms[key].exercises.filter(
            (exId) => exId !== id,
          ),
        };
      });
      saveToStorage("gym_exercises", updated);
      saveToStorage("gym_programs", updatedPrograms);
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
      saveToStorage("gym_programs", updated);
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
      saveToStorage("gym_programs", updated);
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
      saveToStorage("gym_programs", updated);
      saveToStorage("gym_schedule", updatedSchedule);
      return { programs: updated, weeklySchedule: updatedSchedule };
    });
  },

  // Schedule
  setSchedule: (dayIndex, programId) => {
    set((state) => {
      const updated = { ...state.weeklySchedule, [dayIndex]: programId };
      saveToStorage("gym_schedule", updated);
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
      saveToStorage("gym_programs", updatedPrograms);
      return { programs: updatedPrograms };
    });
  },

  // Reset to Defaults (respects active program)
  resetToDefaults: () => {
    const activePlan = get().activeProgram || "ppl_upper";
    const plan = trainingPlans[activePlan] || trainingPlans.ppl_upper;

    saveToStorage("gym_exercises", defaultExercises);
    saveToStorage("gym_programs", plan.programs);
    saveToStorage("gym_schedule", plan.defaultSchedule);
    set({
      exercises: defaultExercises,
      programs: { ...plan.programs },
      weeklySchedule: { ...plan.defaultSchedule },
    });
  },
});
