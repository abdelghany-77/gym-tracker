import { create } from "zustand";
import defaultExercises, {
  workoutPrograms as defaultPrograms,
  weeklySchedule as defaultSchedule,
} from "../data/exercises";

// ── Helper: localStorage read/write ──
const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
};

// ── Helpers ──
const todayKey = () => new Date().toISOString().split("T")[0];
const generateId = () =>
  `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Seed logic: use localStorage if present, otherwise seed from defaults ──
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

// ── Helper: Calculate Macros ──
const calculateMacros = (profile) => {
  const { weight, height, age } = profile;
  if (!weight || !height) return defaultNutritionTargets;

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
    fiber: 35, // General guideline
    calcium: 1000,
    water: Math.ceil((weight * 33) / 250), // Glasses (approx)
  };
};

// ── Zustand Store ──
const useWorkoutStore = create((set, get) => ({
  // ── State ──
  history: loadFromStorage("gym_history", []),
  dailyChecklist: loadFromStorage("gym_checklist_" + todayKey(), {
    vitamin: false,
    water: 0,
    mealPlanFollowed: false,
    caloriesConsumed: 0,
  }),
  userProfile: loadFromStorage("gym_profile", {
    name: "",
    weight: 70, // Default weight to avoid 0 div
    height: 175, // Default height
    age: 24,
  }),
  weeklySchedule: loadFromStorage("gym_schedule", defaultSchedule),
  activeWorkout: null,
  restTimerTrigger: 0,
  personalRecords: loadFromStorage("gym_prs", {}),
  showConfetti: false,

  // ── Dynamic Data (seeded from localStorage or defaults) ──
  exercises: seedExercises(),
  programs: seedPrograms(),

  // ── Nutrition ──
  nutritionTargets: loadFromStorage("gym_nutrition", defaultNutritionTargets),

  // ── Getters ──
  getExerciseById: (id) => get().exercises.find((e) => e.id === id),
  getAllExercises: () => get().exercises,
  getPrograms: () => get().programs,
  getSchedule: () => get().weeklySchedule,

  getAchievements: () => {
    const { history, personalRecords } = get();
    const achievements = [];
    const total = history.length;
    const prCount = Object.keys(personalRecords).length;
    const totalSets = history.reduce(
      (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
      0,
    );

    if (total >= 1)
      achievements.push({
        id: "first_workout",
        label: "First Step",
        desc: "Completed your first workout",
        icon: "flag",
        earned: true,
      });
    else
      achievements.push({
        id: "first_workout",
        label: "First Step",
        desc: "Complete your first workout",
        icon: "flag",
        earned: false,
      });

    if (total >= 10)
      achievements.push({
        id: "ten_workouts",
        label: "Dedicated",
        desc: "Completed 10 workouts",
        icon: "dumbbell",
        earned: true,
      });
    else
      achievements.push({
        id: "ten_workouts",
        label: "Dedicated",
        desc: `Complete 10 workouts (${total}/10)`,
        icon: "dumbbell",
        earned: false,
      });

    if (total >= 25)
      achievements.push({
        id: "25_workouts",
        label: "Consistent",
        desc: "Completed 25 workouts",
        icon: "flame",
        earned: true,
      });
    else
      achievements.push({
        id: "25_workouts",
        label: "Consistent",
        desc: `Complete 25 workouts (${total}/25)`,
        icon: "flame",
        earned: false,
      });

    if (total >= 50)
      achievements.push({
        id: "50_workouts",
        label: "Iron Will",
        desc: "Completed 50 workouts",
        icon: "zap",
        earned: true,
      });
    else
      achievements.push({
        id: "50_workouts",
        label: "Iron Will",
        desc: `Complete 50 workouts (${total}/50)`,
        icon: "zap",
        earned: false,
      });

    if (total >= 100)
      achievements.push({
        id: "100_workouts",
        label: "Legend",
        desc: "Completed 100 workouts",
        icon: "crown",
        earned: true,
      });
    else
      achievements.push({
        id: "100_workouts",
        label: "Legend",
        desc: `Complete 100 workouts (${total}/100)`,
        icon: "crown",
        earned: false,
      });

    if (prCount >= 1)
      achievements.push({
        id: "first_pr",
        label: "Record Breaker",
        desc: "Set your first personal record",
        icon: "trophy",
        earned: true,
      });
    else
      achievements.push({
        id: "first_pr",
        label: "Record Breaker",
        desc: "Set your first personal record",
        icon: "trophy",
        earned: false,
      });

    if (prCount >= 10)
      achievements.push({
        id: "ten_prs",
        label: "PR Machine",
        desc: "Set 10 personal records",
        icon: "target",
        earned: true,
      });
    else
      achievements.push({
        id: "ten_prs",
        label: "PR Machine",
        desc: `Set 10 personal records (${prCount}/10)`,
        icon: "target",
        earned: false,
      });

    if (totalSets >= 100)
      achievements.push({
        id: "100_sets",
        label: "Volume King",
        desc: "Completed 100 total sets",
        icon: "bar-chart",
        earned: true,
      });
    else
      achievements.push({
        id: "100_sets",
        label: "Volume King",
        desc: `Complete 100 sets (${totalSets}/100)`,
        icon: "bar-chart",
        earned: false,
      });

    if (totalSets >= 500)
      achievements.push({
        id: "500_sets",
        label: "Unstoppable",
        desc: "Completed 500 total sets",
        icon: "rocket",
        earned: true,
      });
    else
      achievements.push({
        id: "500_sets",
        label: "Unstoppable",
        desc: `Complete 500 sets (${totalSets}/500)`,
        icon: "rocket",
        earned: false,
      });

    return achievements;
  },

  getWeeklyTrend: () => {
    const { history } = get();
    const weeks = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1 - w * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = history.filter((s) => {
        const d = new Date(s.date);
        return d >= weekStart && d < weekEnd;
      }).length;
      const label = w === 0 ? "This" : w === 1 ? "Last" : `${w}w`;
      weeks.push({ label, count });
    }
    return weeks;
  },

  getNextWorkout: () => {
    const { weeklySchedule, programs } = get();
    const today = new Date().getDay();
    const scheduleMap = [6, 0, 1, 2, 3, 4, 5];

    for (let offset = 0; offset < 7; offset++) {
      const jsDay = (today + offset) % 7;
      const schedIdx = scheduleMap[jsDay];
      const programId = weeklySchedule[schedIdx];

      if (programId === "rest") {
        return { isRest: true, daysUntil: offset, dayIndex: schedIdx };
      }

      if (programId && programId !== "rest") {
        return {
          program: programs[programId],
          daysUntil: offset,
          dayIndex: schedIdx,
        };
      }
    }
    return null;
  },

  getLastSession: () => {
    const { history } = get();
    if (history.length === 0) return null;
    return history[history.length - 1];
  },

  getGhostData: (exerciseId) => {
    const { history } = get();
    for (let i = history.length - 1; i >= 0; i--) {
      const session = history[i];
      const exerciseData = session.exercises?.find(
        (e) => e.exerciseId === exerciseId,
      );
      if (exerciseData) {
        return { date: session.date, sets: exerciseData.sets };
      }
    }
    return null;
  },

  getHeatmapData: () => {
    const { history } = get();
    const map = {};
    history.forEach((session) => {
      const date = session.date;
      map[date] = (map[date] || 0) + 1;
    });
    return map;
  },

  getWaterGoal: () => {
    const { userProfile } = get();
    if (!userProfile.weight) return 8;
    const dailyMl = userProfile.weight * 33;
    return Math.ceil(dailyMl / 250);
  },

  // ── BMI & Calorie Calculations ──
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
    // Mifflin-St Jeor (male) + muscle building surplus
    const bmr =
      10 * userProfile.weight + 6.25 * userProfile.height - 5 * age + 5;
    const tdee = Math.round(bmr * 1.55); // moderate activity
    const surplus = Math.round(tdee + 500); // bulk surplus
    return { bmr: Math.round(bmr), tdee, surplus };
  },

  // ══════════════════════════════════════════
  // ── CRUD: Exercises ──
  // ══════════════════════════════════════════
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
      // Also remove from all programs
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

  // ══════════════════════════════════════════
  // ── CRUD: Programs ──
  // ══════════════════════════════════════════
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
      // Remove from schedule if referenced
      const updatedSchedule = { ...state.weeklySchedule };
      Object.keys(updatedSchedule).forEach((day) => {
        if (updatedSchedule[day] === id) updatedSchedule[day] = null;
      });
      saveToStorage("gym_programs", updated);
      saveToStorage("gym_schedule", updatedSchedule);
      return { programs: updated, weeklySchedule: updatedSchedule };
    });
  },

  // ══════════════════════════════════════════
  // ── Swap & Reorder ──
  // ══════════════════════════════════════════
  swapExercise: (exerciseIndex, newExerciseId, permanent = false) => {
    set((state) => {
      if (!state.activeWorkout) return state;

      const exercises = [...state.activeWorkout.exercises];
      const oldExerciseId = exercises[exerciseIndex].exerciseId;
      const newExercise = state.exercises.find((e) => e.id === newExerciseId);
      if (!newExercise) return state;

      // Replace in active workout with fresh sets
      exercises[exerciseIndex] = {
        exerciseId: newExerciseId,
        sets: Array.from({ length: newExercise.default_sets || 3 }, () => ({
          weight: "",
          reps: "",
          done: false,
        })),
      };

      const result = {
        activeWorkout: { ...state.activeWorkout, exercises },
      };

      // Permanent swap: update the program definition
      if (permanent && state.activeWorkout.programId) {
        const updatedPrograms = { ...state.programs };
        const program = updatedPrograms[state.activeWorkout.programId];
        if (program) {
          const updatedExercises = program.exercises.map((exId) =>
            exId === oldExerciseId ? newExerciseId : exId,
          );
          updatedPrograms[state.activeWorkout.programId] = {
            ...program,
            exercises: updatedExercises,
          };
          saveToStorage("gym_programs", updatedPrograms);
          result.programs = updatedPrograms;
        }
      }

      return result;
    });
  },

  reorderExerciseInWorkout: (fromIndex, toIndex) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercises = [...state.activeWorkout.exercises];
      const [moved] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, moved);
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
      };
    });
  },

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

  // ══════════════════════════════════════════
  // ── Reset to Defaults ──
  // ══════════════════════════════════════════
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

  // ══════════════════════════════════════════
  // ── Nutrition ──
  // ══════════════════════════════════════════
  updateNutritionTargets: (targets) => {
    set((state) => {
      const updated = { ...state.nutritionTargets, ...targets };
      saveToStorage("gym_nutrition", updated);
      return { nutritionTargets: updated };
    });
  },

  updateCaloriesConsumed: (calories) => {
    set((state) => {
      const updated = { ...state.dailyChecklist, caloriesConsumed: calories };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  toggleMealPlan: () => {
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        mealPlanFollowed: !state.dailyChecklist.mealPlanFollowed,
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

  // ══════════════════════════════════════════
  // ── Actions: Daily Checklist ──
  // ══════════════════════════════════════════
  toggleChecklistItem: (item) => {
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
    set((state) => {
      const updated = {
        ...state.dailyChecklist,
        water: Math.max(0, state.dailyChecklist.water - 1),
      };
      saveToStorage("gym_checklist_" + todayKey(), updated);
      return { dailyChecklist: updated };
    });
  },

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

  setSchedule: (dayIndex, programId) => {
    set((state) => {
      const updated = { ...state.weeklySchedule, [dayIndex]: programId };
      saveToStorage("gym_schedule", updated);
      return { weeklySchedule: updated };
    });
  },

  // ══════════════════════════════════════════
  // ── Actions: Active Workout ──
  // ══════════════════════════════════════════
  startWorkout: (programId) => {
    const { programs, exercises } = get();
    const program = programs[programId];
    if (!program) return;

    const workoutExercises = program.exercises.map((exId) => {
      const ex = exercises.find((e) => e.id === exId);
      const sets = Array.from({ length: ex?.default_sets || 3 }, () => ({
        weight: "",
        reps: "",
        done: false,
      }));
      return { exerciseId: exId, sets };
    });

    set({
      activeWorkout: {
        programId,
        programName: program.name,
        startedAt: new Date().toISOString(),
        exercises: workoutExercises,
      },
    });
  },

  updateSet: (exerciseIndex, setIndex, field, value) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercises = [...state.activeWorkout.exercises];
      const sets = [...exercises[exerciseIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
      };
    });
  },

  toggleSetDone: (exerciseIndex, setIndex) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercises = [...state.activeWorkout.exercises];
      const sets = [...exercises[exerciseIndex].sets];
      const newDoneState = !sets[setIndex].done;
      sets[setIndex] = { ...sets[setIndex], done: newDoneState };
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
        restTimerTrigger: newDoneState ? Date.now() : state.restTimerTrigger,
      };
    });
  },

  addSet: (exerciseIndex) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercises = [...state.activeWorkout.exercises];
      const sets = [
        ...exercises[exerciseIndex].sets,
        { weight: "", reps: "", done: false },
      ];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
      };
    });
  },

  removeSet: (exerciseIndex, setIndex) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercises = [...state.activeWorkout.exercises];
      const sets = exercises[exerciseIndex].sets.filter(
        (_, i) => i !== setIndex,
      );
      if (sets.length === 0) return state;
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
      };
    });
  },

  finishWorkout: () => {
    const { activeWorkout, history, personalRecords } = get();
    if (!activeWorkout) return;

    const session = {
      id: Date.now().toString(),
      date: todayKey(),
      programId: activeWorkout.programId,
      programName: activeWorkout.programName,
      startedAt: activeWorkout.startedAt,
      finishedAt: new Date().toISOString(),
      exercises: activeWorkout.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets
          .filter((s) => s.done)
          .map((s) => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
          })),
      })),
    };

    const updatedPRs = { ...personalRecords };
    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const currentPR = updatedPRs[ex.exerciseId] || 0;
        if (s.weight > currentPR) {
          updatedPRs[ex.exerciseId] = s.weight;
        }
      });
    });

    const updatedHistory = [...history, session];
    saveToStorage("gym_history", updatedHistory);
    saveToStorage("gym_prs", updatedPRs);

    set({
      history: updatedHistory,
      personalRecords: updatedPRs,
      activeWorkout: null,
      showConfetti: true,
    });

    setTimeout(() => set({ showConfetti: false }), 4000);
    return session;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
  },

  clearHistory: () => {
    saveToStorage("gym_history", []);
    saveToStorage("gym_prs", {});
    set({ history: [], personalRecords: {} });
  },
}));

export default useWorkoutStore;
