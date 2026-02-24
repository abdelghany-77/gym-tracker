import { loadFromStorage, saveToStorage } from "./helpers";
import { calculateMacros } from "./nutritionSlice";

// ── Profile Slice ──
export const createProfileSlice = (set, get) => ({
  // State
  userProfile: loadFromStorage("gym_profile", {
    name: "",
    weight: 70,
    height: 175,
    age: 24,
  }),

  // Actions
  updateUserProfile: (profile) => {
    set((state) => {
      const updatedProfile = { ...state.userProfile, ...profile };
      saveToStorage("gym_profile", updatedProfile);

      // Auto-update nutrition targets based on new profile
      if (updatedProfile.weight && updatedProfile.height) {
        const newTargets = calculateMacros(updatedProfile);
        saveToStorage("gym_nutrition", newTargets);
        return { userProfile: updatedProfile, nutritionTargets: newTargets };
      }

      return { userProfile: updatedProfile };
    });
  },

  // Getters
  getBMI: () => {
    const { userProfile } = get();
    if (!userProfile.weight || !userProfile.height) return null;
    const heightM = userProfile.height / 100;
    const value = parseFloat(
      (userProfile.weight / (heightM * heightM)).toFixed(1),
    );
    let category = "Normal";
    let color = "text-emerald-400";
    if (value < 18.5) {
      category = "Underweight";
      color = "text-amber-400";
    } else if (value >= 25 && value < 30) {
      category = "Overweight";
      color = "text-amber-400";
    } else if (value >= 30) {
      category = "Obese";
      color = "text-red-400";
    }
    return { value, category, color };
  },

  getSuggestedCalories: () => {
    const { userProfile } = get();
    if (!userProfile.weight || !userProfile.height) return null;
    const age = userProfile.age || 24;
    const bmr =
      10 * userProfile.weight + 6.25 * userProfile.height - 5 * age + 5;
    const tdee = Math.round(bmr * 1.55);
    const surplus = Math.round(tdee + 500);
    return { bmr: Math.round(bmr), tdee, surplus };
  },
});
