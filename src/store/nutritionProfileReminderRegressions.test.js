import { create } from "zustand";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNutritionSlice } from "./nutritionSlice";
import { createProfileSlice } from "./profileSlice";
import { createReminderSlice } from "./reminderSlice";
import { createMealSlice } from "./mealSlice";
import { todayKey } from "./helpers";

const makeStore = () => create((set, get) => ({
  ...createNutritionSlice(set, get),
  ...createProfileSlice(set, get),
  ...createReminderSlice(set, get),
  ...createMealSlice(set, get),
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29, 12));
});
afterEach(() => vi.useRealTimers());

describe("nutrition and profile accounting", () => {
  it("does not replace custom nutrition targets when editing a name", () => {
    const store = makeStore();
    store.getState().updateNutritionTargets({ calories: 2200, protein: 140 });
    store.getState().updateUserProfile({ name: "Alex" });
    expect(store.getState().nutritionTargets).toMatchObject({ calories: 2200, protein: 140 });
    store.getState().updateUserProfile({ weight: 80 });
    expect(store.getState().nutritionTargets.protein).toBe(168);
  });

  it("rejects invalid profile and nutrition numbers without poisoning derived values", () => {
    const store = makeStore();
    store.getState().updateUserProfile({ weight: -10, height: Infinity, age: 2.5 });
    expect(store.getState().userProfile).toMatchObject({ weight: 70, height: 175, age: 24 });
    store.getState().updateNutritionTargets({ calories: 0, protein: NaN });
    expect(store.getState().nutritionTargets).toMatchObject({ calories: 3510, protein: 235 });
    store.getState().updateCaloriesConsumed(NaN);
    expect(store.getState().dailyChecklist.caloriesConsumed).toBe(0);
    store.setState({ userProfile: { weight: -5, height: 175 } });
    expect(store.getState().getBMI()).toBeNull();
    expect(store.getState().getWaterGoal()).toBe(8);
  });

  it.each([2201, 3003, 3510])("allocates exactly %i calories and the requested protein across meals", (calories) => {
    const store = makeStore();
    store.getState().updateNutritionTargets({ calories, protein: 137 });
    const meals = store.getState().getMealPlan();
    expect(meals.reduce((sum, meal) => sum + meal.calories, 0)).toBe(calories);
    expect(meals.reduce((sum, meal) => sum + meal.protein, 0)).toBe(137);
  });

  it("undoes the originally logged calories after targets change, preserving manual calories", () => {
    const store = makeStore();
    store.getState().updateCaloriesConsumed(100);
    store.getState().toggleMealEaten(0);
    const logged = store.getState().dailyChecklist.mealCalories[0];
    expect(store.getState().dailyChecklist.caloriesConsumed).toBe(100 + logged);
    store.getState().updateNutritionTargets({ calories: 2000 });
    store.getState().toggleMealEaten(0);
    expect(store.getState().dailyChecklist).toMatchObject({ caloriesConsumed: 100, mealsEaten: [], mealCalories: {} });
    expect(JSON.parse(localStorage.getItem("gym_checklist_" + todayKey())).caloriesConsumed).toBe(100);
  });

  it("validates meal indices and completes only when every meal is logged", () => {
    const store = makeStore();
    for (const index of [-1, 6, NaN, 1.5, "0"]) store.getState().toggleMealEaten(index);
    expect(store.getState().dailyChecklist.mealsEaten).toEqual([]);
    for (let index = 0; index < 6; index++) store.getState().toggleMealEaten(index);
    expect(store.getState().dailyChecklist).toMatchObject({ mealPlanFollowed: true, caloriesConsumed: 3510 });
    store.getState().toggleMealEaten(4);
    expect(store.getState().dailyChecklist.mealPlanFollowed).toBe(false);
  });

  it("rolls over before mutations without copying yesterday's tracking into today", () => {
    const store = makeStore();
    store.getState().incrementWater();
    store.getState().toggleChecklistItem("vitamin");
    store.getState().toggleMealEaten(0);
    const yesterdayKey = "gym_checklist_" + todayKey();
    const yesterday = localStorage.getItem(yesterdayKey);
    vi.setSystemTime(new Date(2026, 9, 30, 0, 1));
    store.getState().incrementWater();
    expect(store.getState().dailyChecklist).toMatchObject({ water: 1, vitamin: false, mealsEaten: [], caloriesConsumed: 0 });
    expect(localStorage.getItem(yesterdayKey)).toBe(yesterday);
    expect(store.getState().dailyChecklistDate).toBe(todayKey());
  });

  it("loads an existing checklist when resuming on another day", () => {
    const store = makeStore();
    vi.setSystemTime(new Date(2026, 9, 30, 9));
    localStorage.setItem("gym_checklist_" + todayKey(), JSON.stringify({ water: 3, vitamin: true, mealsEaten: [1] }));
    store.getState().ensureDailyChecklist();
    expect(store.getState().dailyChecklist).toMatchObject({ water: 3, vitamin: true, mealsEaten: [1] });
  });
});

describe("reminder settings and custom meal integrity", () => {
  it("clamps intervals to the supported range and rejects non-finite values", () => {
    const store = makeStore();
    store.getState().setWaterInterval(500);
    expect(store.getState().waterIntervalMinutes).toBe(180);
    store.getState().setWaterInterval(-10);
    expect(store.getState().waterIntervalMinutes).toBe(10);
    store.getState().setWaterInterval(NaN);
    expect(makeStore().getState().waterIntervalMinutes).toBe(10);
    localStorage.setItem("gym_reminders", JSON.stringify({ waterIntervalMinutes: null }));
    expect(makeStore().getState().waterIntervalMinutes).toBe(60);
  });

  it("persists the vitamin reminder date across reloads and settings changes", () => {
    const store = makeStore();
    store.getState().markVitaminReminderSent();
    store.getState().toggleSound();
    expect(makeStore().getState().lastVitaminReminderDate).toBe(todayKey());
  });

  it("preserves custom plan identity and prevents dangling active IDs", () => {
    const store = makeStore();
    store.getState().addCustomMealPlan({ name: "Original", meals: [] });
    const plan = store.getState().customMealData.customMealPlans[0];
    store.getState().setActiveMealPlan(plan.id);
    store.getState().updateCustomMealPlan(plan.id, { id: "replacement", createdAt: "changed", name: "Updated" });
    expect(store.getState().getActiveCustomMealPlan()).toMatchObject({ id: plan.id, createdAt: plan.createdAt, name: "Updated" });
    store.getState().setActiveMealPlan("missing");
    expect(store.getState().customMealData.activePlanId).toBe(plan.id);
    store.getState().deleteCustomMealPlan(plan.id);
    expect(store.getState().getActiveCustomMealPlan()).toBeNull();
    expect(makeStore().getState().customMealData.activePlanId).toBeNull();
  });
});
