import { create } from "zustand";
import exercises, { workoutPrograms, weeklySchedule } from "../data/exercises";

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
const todayKey = () => new Date().toISOString().split("T")[0]; // "2026-02-12"

// ── Zustand Store ──
const useWorkoutStore = create((set, get) => ({
  // ── State ──
  history: loadFromStorage("gym_history", []),
  dailyChecklist: loadFromStorage("gym_checklist_" + todayKey(), {
    vitamin: false,
    water: 0,
  }),
  userProfile: loadFromStorage("gym_profile", {
    name: "",
    weight: 0,
    height: 0,
  }),
  // Initialize schedule from storage or fallback to default
  weeklySchedule: loadFromStorage("gym_schedule", weeklySchedule),
  activeWorkout: null, // { programId, startedAt, exercises: [ { exerciseId, sets: [{ weight, reps, done }] } ] }
  restTimerTrigger: 0, // Timestamp when a set is marked done, triggering the timer
  personalRecords: loadFromStorage("gym_prs", {}),
  exercises, // Static data from file
  showConfetti: false, // Trigger confetti on workout finish or PR

  // ── Getters ──
  getExerciseById: (id) => exercises.find((e) => e.id === id),
  getAllExercises: () => exercises,
  getPrograms: () => workoutPrograms,
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

    // Session milestones
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

    // PR milestones
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

    // Volume milestone
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
    // Re-implement logic using dynamic schedule from state
    const { weeklySchedule } = get();
    const today = new Date().getDay(); // 0=Sun
    const scheduleMap = [6, 0, 1, 2, 3, 4, 5]; // Sun=6, Mon=0, Tue=1...

    for (let offset = 0; offset < 7; offset++) {
      const jsDay = (today + offset) % 7;
      const schedIdx = scheduleMap[jsDay];
      const programId = weeklySchedule[schedIdx];

      if (programId === "rest") {
        return {
          isRest: true,
          daysUntil: offset,
          dayIndex: schedIdx,
        };
      }

      if (programId && programId !== "rest") {
        return {
          program: workoutPrograms[programId],
          daysUntil: offset,
          dayIndex: schedIdx, // return index to allow editing
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

  // Ghost replay — get last session data for a specific exercise
  getGhostData: (exerciseId) => {
    const { history } = get();
    // Search from most recent backwards
    for (let i = history.length - 1; i >= 0; i--) {
      const session = history[i];
      const exerciseData = session.exercises?.find(
        (e) => e.exerciseId === exerciseId,
      );
      if (exerciseData) {
        return {
          date: session.date,
          sets: exerciseData.sets,
        };
      }
    }
    return null;
  },

  // Heatmap data — returns map of date -> workout count for the year
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
    // 33ml per kg
    if (!userProfile.weight) return 8; // Default 8 glasses (approx 2L)
    const dailyMl = userProfile.weight * 33;
    return Math.ceil(dailyMl / 250); // 250ml per glass
  },

  // ── Actions: Daily Checklist ──
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
      const updated = { ...state.userProfile, ...profile };
      saveToStorage("gym_profile", updated);
      return { userProfile: updated };
    });
  },

  setSchedule: (dayIndex, programId) => {
    set((state) => {
      const updated = { ...state.weeklySchedule, [dayIndex]: programId };
      saveToStorage("gym_schedule", updated);
      return { weeklySchedule: updated };
    });
  },

  // ── Actions: Active Workout ──
  startWorkout: (programId) => {
    const program = workoutPrograms[programId];
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
      if (sets.length === 0) return state; // keep at least 1 set
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return {
        activeWorkout: { ...state.activeWorkout, exercises },
      };
    });
  },

  finishWorkout: () => {
    const { activeWorkout, history, personalRecords } = get();
    if (!activeWorkout) return;

    // Build completed session
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

    // Update personal records
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

    // Auto-dismiss confetti after 4s
    setTimeout(() => set({ showConfetti: false }), 4000);

    return session;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
  },

  // ── Actions: History Management ──
  clearHistory: () => {
    saveToStorage("gym_history", []);
    saveToStorage("gym_prs", {});
    set({ history: [], personalRecords: {} });
  },
}));

export default useWorkoutStore;
