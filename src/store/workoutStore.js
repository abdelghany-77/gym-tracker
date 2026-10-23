import { create } from "zustand";
import { createWorkoutSlice } from "./workoutSlice";
import { createNutritionSlice } from "./nutritionSlice";
import { createProfileSlice } from "./profileSlice";
import { createExerciseSlice } from "./exerciseSlice";
import { createReminderSlice } from "./reminderSlice";
import { createMeasurementSlice } from "./measurementSlice";
import { createMealSlice } from "./mealSlice";
import { createCardioSlice } from "./cardioSlice";
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  loadActiveSession,
  mergeCustomOverrides,
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
  ...createCardioSlice(set, get),

  // ── Theme (item 13) ──
  theme: loadFromStorage(STORAGE_KEYS.theme, "dark"), // "dark" | "light"
  setTheme: (theme) => {
    set({ theme });
    saveToStorage(STORAGE_KEYS.theme, theme);
    document.documentElement.setAttribute("data-theme", theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    saveToStorage(STORAGE_KEYS.theme, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  },

  // ── Onboarding (item 12) ──
  onboardingComplete: loadFromStorage(STORAGE_KEYS.onboarding, false),
  completeOnboarding: () => {
    set({ onboardingComplete: true });
    saveToStorage(STORAGE_KEYS.onboarding, true);
  },

  // ── Rest timer per exercise (item 6) ──
  exerciseRestTimes: loadFromStorage(STORAGE_KEYS.restTimes, {}),
  setExerciseRestTime: (exerciseId, seconds) => {
    set((state) => {
      const updated = { ...state.exerciseRestTimes, [exerciseId]: seconds };
      saveToStorage(STORAGE_KEYS.restTimes, updated);
      return { exerciseRestTimes: updated };
    });
  },
  getRestTimeForExercise: (exerciseId) => {
    const { exerciseRestTimes } = get();
    return exerciseRestTimes[exerciseId] || 60; // default 60s
  },

  // ── Reactive Rehydration ──
  rehydrateFromStorage: () => {
    set({
      history: loadFromStorage(STORAGE_KEYS.history, []),
      personalRecords: loadFromStorage(STORAGE_KEYS.prs, {}),
      exercises: loadFromStorage(STORAGE_KEYS.exercises, get().exercises),
      programs: loadFromStorage(STORAGE_KEYS.programs, get().programs),
      weeklySchedule: loadFromStorage(STORAGE_KEYS.schedule, get().weeklySchedule),
      customProgramOverrides: mergeCustomOverrides(),
      activeProgram: loadFromStorage(STORAGE_KEYS.activeProgram, "ppl_upper"),
      userProfile: loadFromStorage(STORAGE_KEYS.profile, get().userProfile),
      measurements: loadFromStorage(STORAGE_KEYS.measurements, get().measurements || []),
      theme: loadFromStorage(STORAGE_KEYS.theme, "dark"),
      activeWorkout: loadActiveSession(),
      // Cardio rehydration
      cardioHistory: loadFromStorage(STORAGE_KEYS.cardioHistory, []),
      cardioGoal: loadFromStorage(STORAGE_KEYS.cardioGoal, get().cardioGoal),
    });
  },
}));

export default useWorkoutStore;
