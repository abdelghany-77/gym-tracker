import { loadFromStorage, saveToStorage } from "./helpers";

const STORAGE_KEY = "gym_custom_meals";

const defaultState = {
  customMealPlans: [], // Array of { id, name, meals: [{ name, time, items: [{name, calories, protein, carbs, fat}] }] }
  activePlanId: null,
};

// ── Custom Meal Plan Slice ──
export const createMealSlice = (set, get) => ({
  customMealData: loadFromStorage(STORAGE_KEY, defaultState),

  addCustomMealPlan: (plan) => {
    set((state) => {
      const newPlan = {
        id: crypto.randomUUID(),
        name: plan.name || "My Meal Plan",
        meals: plan.meals || [],
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...state.customMealData,
        customMealPlans: [...state.customMealData.customMealPlans, newPlan],
      };
      saveToStorage(STORAGE_KEY, updated);
      return { customMealData: updated };
    });
  },

  updateCustomMealPlan: (id, updates) => {
    set((state) => {
      const plans = state.customMealData.customMealPlans.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      );
      const updated = { ...state.customMealData, customMealPlans: plans };
      saveToStorage(STORAGE_KEY, updated);
      return { customMealData: updated };
    });
  },

  deleteCustomMealPlan: (id) => {
    set((state) => {
      const plans = state.customMealData.customMealPlans.filter(
        (p) => p.id !== id,
      );
      const activePlanId =
        state.customMealData.activePlanId === id
          ? null
          : state.customMealData.activePlanId;
      const updated = { ...state.customMealData, customMealPlans: plans, activePlanId };
      saveToStorage(STORAGE_KEY, updated);
      return { customMealData: updated };
    });
  },

  setActiveMealPlan: (id) => {
    set((state) => {
      const updated = { ...state.customMealData, activePlanId: id };
      saveToStorage(STORAGE_KEY, updated);
      return { customMealData: updated };
    });
  },

  getActiveCustomMealPlan: () => {
    const { customMealData } = get();
    if (!customMealData.activePlanId) return null;
    return customMealData.customMealPlans.find(
      (p) => p.id === customMealData.activePlanId,
    );
  },
});
