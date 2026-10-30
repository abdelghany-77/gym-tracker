import { create } from "zustand";
import { createWorkoutSlice } from "./workoutSlice";
import { calculateMacros, createNutritionSlice } from "./nutritionSlice";
import { createProfileSlice } from "./profileSlice";
import { createExerciseSlice } from "./exerciseSlice";
import { createReminderSlice } from "./reminderSlice";
import { createMeasurementSlice } from "./measurementSlice";
import { createMealSlice } from "./mealSlice";
import {
  loadFromStorage,
  isValidNutritionTargets,
  loadProgramOverrides,
  normalizeMeasurements,
  saveToStorage,
} from "./helpers";

// ── Zustand Store (composed from domain slices) ──
const useWorkoutStore = create((set, get) => ({
  ...createWorkoutSlice(set, get),
  ...createNutritionSlice(set, get),
  ...createProfileSlice(set, get),
  ...createExerciseSlice(set, get),
  ...createReminderSlice(set, get),
  ...createMeasurementSlice(set, get),
  ...createMealSlice(set, get),

  // ── Theme (item 13) ──
  theme: loadFromStorage("gym_theme", "dark"), // "dark" | "light"
  setTheme: (theme) => {
    set({ theme });
    saveToStorage("gym_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    saveToStorage("gym_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  },

  // ── Onboarding (item 12) ──
  onboardingComplete: loadFromStorage("gym_onboarding", false),
  completeOnboarding: () => {
    set({ onboardingComplete: true });
    saveToStorage("gym_onboarding", true);
  },

  // ── Rest timer per exercise (item 6) ──
  exerciseRestTimes: loadFromStorage("gym_rest_times", {}),
  setExerciseRestTime: (exerciseId, seconds) => {
    set((state) => {
      const updated = { ...state.exerciseRestTimes, [exerciseId]: seconds };
      saveToStorage("gym_rest_times", updated);
      return { exerciseRestTimes: updated };
    });
  },
  getRestTimeForExercise: (exerciseId) => {
    const { exerciseRestTimes } = get();
    return exerciseRestTimes[exerciseId] || 60; // default 60s
  },

  // ── Reactive Rehydration ──
  rehydrateFromStorage: () => {
    const restoredProfile = loadFromStorage("gym_profile", null);
    const storedTargets = loadFromStorage("gym_nutrition", null);
    const validProfile =
      restoredProfile &&
      [restoredProfile.weight, restoredProfile.height].every(
        (value) => Number.isFinite(value) && value > 0,
      ) &&
      (restoredProfile.age === undefined ||
        (Number.isInteger(restoredProfile.age) && restoredProfile.age >= 0));
    // Explicit saved targets take precedence over profile-derived defaults.
    const nutritionTargets = isValidNutritionTargets(storedTargets)
      ? storedTargets
      : validProfile
        ? calculateMacros(restoredProfile)
        : get().nutritionTargets;
    set({
      nutritionTargets,
      history: loadFromStorage("gym_history", []),
      personalRecords: loadFromStorage("gym_prs", {}),
      exercises: loadFromStorage("gym_exercises", get().exercises),
      programs: loadFromStorage("gym_programs", get().programs),
      weeklySchedule: loadFromStorage("gym_schedule", get().weeklySchedule),
      customProgramOverrides: loadProgramOverrides(),
      activeProgram: loadFromStorage("gym_active_program", "ppl_upper"),
      userProfile: restoredProfile ?? get().userProfile,
      measurements: normalizeMeasurements(
        loadFromStorage(
          "gym_measurements",
          get().measurements || { entries: [] },
        ),
      ),
      theme: loadFromStorage("gym_theme", "dark"),
    });
  },
}));

export default useWorkoutStore;
