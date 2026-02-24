import defaultExercises, {
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
  const programs = { ...defaultPrograms };
  saveToStorage("gym_programs", programs);
  return programs;
};

// ── Exercise Slice ──
export const createExerciseSlice = (set, get) => ({
  // State
  exercises: seedExercises(),
  programs: seedPrograms(),
  weeklySchedule: loadFromStorage("gym_schedule", defaultSchedule),

  // Getters
  getExerciseById: (id) => get().exercises.find((e) => e.id === id),
  getAllExercises: () => get().exercises,
  getPrograms: () => get().programs,
  getSchedule: () => get().weeklySchedule,

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

  // Reset to Defaults
  resetToDefaults: () => {
    saveToStorage("gym_exercises", defaultExercises);
    saveToStorage("gym_programs", defaultPrograms);
    saveToStorage("gym_schedule", defaultSchedule);
    set({
      exercises: defaultExercises,
      programs: { ...defaultPrograms },
      weeklySchedule: { ...defaultSchedule },
    });
  },
});
