import { loadFromStorage, saveToStorage, todayKey } from "./helpers";

// ── Default nutrition targets ──
const defaultNutritionTargets = {
  calories: 3510,
  protein: 235,
  carbs: 367,
  fat: 132,
  fiber: 59,
  calcium: 1550,
  age: 24,
};

const emptyChecklist = () => ({
  vitamin: false,
  water: 0,
  mealPlanFollowed: false,
  caloriesConsumed: 0,
  mealsEaten: [],
  mealCalories: {},
});

const currentChecklist = (state) =>
  state.dailyChecklistDate === todayKey()
    ? state.dailyChecklist
    : loadFromStorage("gym_checklist_" + todayKey(), emptyChecklist());

// ── Helper: Calculate Macros ──
export const calculateMacros = (profile) => {
  const { weight, height, age } = profile;
  if (![weight, height].every((value) => Number.isFinite(value) && value > 0))
    return { ...defaultNutritionTargets };

  // Mifflin-St Jeor (Male)
  const bmr = 10 * weight + 6.25 * height - 5 * (age || 24) + 5;
  const tdee = bmr * 1.55; // Moderate activity
  const calories = Math.round(tdee + 500); // Bulk surplus

  // Macro Split: Protein 2g/kg, Fat 0.9g/kg, Rest Carbs
  const protein = Math.round(weight * 2.1);
  const fat = Math.round(weight * 0.9);
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber: 35,
    calcium: 1000,
    water: Math.ceil((weight * 33) / 250),
  };
};

// ── Nutrition Slice ──
export const createNutritionSlice = (set, get) => ({
  // State
  nutritionTargets: loadFromStorage("gym_nutrition", defaultNutritionTargets),
  dailyChecklistDate: todayKey(),
  dailyChecklist: loadFromStorage(
    "gym_checklist_" + todayKey(),
    emptyChecklist(),
  ),

  // Actions
  ensureDailyChecklist: () => {
    if (get().dailyChecklistDate !== todayKey()) {
      set({
        dailyChecklist: currentChecklist(get()),
        dailyChecklistDate: todayKey(),
      });
    }
  },

  updateNutritionTargets: (targets) => {
    set((state) => {
      const validTargets = Object.fromEntries(
        Object.entries(targets).filter(
          ([key, value]) =>
            Object.hasOwn(defaultNutritionTargets, key) &&
            Number.isFinite(value) &&
            (key === "calories" ? value > 0 : value >= 0),
        ),
      );
      const updated = { ...state.nutritionTargets, ...validTargets };
      saveToStorage("gym_nutrition", updated);
      return { nutritionTargets: updated };
    });
  },

  updateCaloriesConsumed: (calories) => {
    if (!Number.isFinite(calories) || calories < 0) return;
    get().ensureDailyChecklist();
    set((state) => {
      const updated = { ...state.dailyChecklist, caloriesConsumed: calories };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  toggleMealPlan: () => {
    get().ensureDailyChecklist();
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        mealPlanFollowed: !state.dailyChecklist.mealPlanFollowed,
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  toggleMealEaten: (mealIndex) => {
    const meals = get().getMealPlan();
    if (!Number.isInteger(mealIndex) || !meals[mealIndex]) return;
    get().ensureDailyChecklist();
    set((state) => {
      const mealCalories = meals[mealIndex].calories;
      const loggedCalories = { ...state.dailyChecklist.mealCalories };
      const mealsEaten = [...new Set(state.dailyChecklist.mealsEaten || [])];
      const alreadyEaten = mealsEaten.includes(mealIndex);

      let newMeals;
      let caloriesDelta;
      if (alreadyEaten) {
        newMeals = mealsEaten.filter((i) => i !== mealIndex);
        // Undo the amount actually logged, not a newly calculated target.
        caloriesDelta = -(loggedCalories[mealIndex] ?? mealCalories);
        delete loggedCalories[mealIndex];
      } else {
        newMeals = [...mealsEaten, mealIndex];
        caloriesDelta = mealCalories;
        loggedCalories[mealIndex] = mealCalories;
      }

      const newCalories = Math.max(
        0,
        (state.dailyChecklist.caloriesConsumed || 0) + caloriesDelta,
      );
      const allMealsEaten =
        meals.length > 0 && meals.every((_, index) => newMeals.includes(index));

      const updated = {
        ...state.dailyChecklist,
        mealsEaten: newMeals,
        mealCalories: loggedCalories,
        caloriesConsumed: newCalories,
        mealPlanFollowed: allMealsEaten,
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  toggleChecklistItem: (item) => {
    if (item !== "vitamin") return;
    get().ensureDailyChecklist();
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        [item]: !state.dailyChecklist[item],
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  incrementWater: () => {
    get().ensureDailyChecklist();
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        water: state.dailyChecklist.water + 1,
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  decrementWater: () => {
    get().ensureDailyChecklist();
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        water: Math.max(0, state.dailyChecklist.water - 1),
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  getWaterGoal: () => {
    const { userProfile } = get();
    if (!Number.isFinite(userProfile.weight) || userProfile.weight <= 0)
      return 8;
    const dailyMl = userProfile.weight * 33;
    return Math.ceil(dailyMl / 250);
  },

  getMealPlan: (nutritionTargets = get().nutritionTargets) => {
    const totalCal = Math.round(nutritionTargets.calories || 3500);
    const totalProtein = Math.round(nutritionTargets.protein ?? 200);

    const mealRatios = [
      {
        time: "7:00 AM",
        name: "Breakfast",
        ratio: 0.2,
        proteinRatio: 0.19,
        items: [
          "6 egg whites + 2 whole eggs scrambled",
          "1 cup oatmeal with banana",
          "1 tbsp peanut butter",
          "1 glass whole milk",
        ],
      },
      {
        time: "10:00 AM",
        name: "Snack 1",
        ratio: 0.11,
        proteinRatio: 0.1,
        items: ["Greek yogurt (200g)", "Handful of almonds (30g)", "1 apple"],
      },
      {
        time: "1:00 PM",
        name: "Lunch",
        ratio: 0.22,
        proteinRatio: 0.22,
        items: [
          "250g grilled chicken breast",
          "1.5 cups brown rice",
          "Mixed vegetables",
          "1 tbsp olive oil",
        ],
      },
      {
        time: "4:00 PM",
        name: "Pre-Workout",
        ratio: 0.13,
        proteinRatio: 0.18,
        items: [
          "Protein shake (2 scoops)",
          "1 banana",
          "2 rice cakes with honey",
        ],
      },
      {
        time: "7:00 PM",
        name: "Dinner",
        ratio: 0.21,
        proteinRatio: 0.2,
        items: [
          "250g lean beef or salmon",
          "Sweet potato (200g)",
          "Steamed broccoli",
          "Mixed salad with olive oil",
        ],
      },
      {
        time: "9:30 PM",
        name: "Pre-Bed Snack",
        ratio: 0.13,
        proteinRatio: 0.11,
        items: ["Cottage cheese (200g)", "1 tbsp honey", "Handful of walnuts"],
      },
    ];

    // Round cumulative shares so meal totals exactly match the daily targets.
    let calorieShare = 0;
    let proteinShare = 0;
    return mealRatios.map((meal) => {
      const previousCalories = Math.round(totalCal * calorieShare);
      const previousProtein = Math.round(totalProtein * proteinShare);
      calorieShare += meal.ratio;
      proteinShare += meal.proteinRatio;
      return {
        ...meal,
        calories: Math.round(totalCal * calorieShare) - previousCalories,
        protein: Math.round(totalProtein * proteinShare) - previousProtein,
      };
    });
  },
});
