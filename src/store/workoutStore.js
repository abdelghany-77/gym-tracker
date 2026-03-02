import { create } from "zustand";
import { createWorkoutSlice } from "./workoutSlice";
import { createNutritionSlice } from "./nutritionSlice";
import { createProfileSlice } from "./profileSlice";
import { createExerciseSlice } from "./exerciseSlice";
import { createReminderSlice } from "./reminderSlice";

// ── Zustand Store (composed from domain slices) ──
const useWorkoutStore = create((set, get) => ({
  ...createWorkoutSlice(set, get),
  ...createNutritionSlice(set, get),
  ...createProfileSlice(set, get),
  ...createExerciseSlice(set, get),
  ...createReminderSlice(set, get),
}));

export default useWorkoutStore;
