import { create } from "zustand";
import { createWorkoutSlice } from "./workoutSlice";
import { createNutritionSlice } from "./nutritionSlice";
import { createProfileSlice } from "./profileSlice";
import { createExerciseSlice } from "./exerciseSlice";
import { createReminderSlice } from "./reminderSlice";
import { createMeasurementSlice } from "./measurementSlice";
import { createMealSlice } from "./mealSlice";
import { loadFromStorage, saveToStorage } from "./helpers";

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
}));

export default useWorkoutStore;
