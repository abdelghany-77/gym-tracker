import {
  loadFromStorage,
  loadProgramOverrides,
  saveToStorage,
  todayKey,
} from "./helpers";
import { parseLocalDate } from "../utils/dateUtils";

// ── Workout Slice ──
export const createWorkoutSlice = (set, get) => ({
  // State
  history: loadFromStorage("gym_history", []),
  activeWorkout: null,
  restTimerTrigger: 0,
  restTimerExerciseId: null,
  personalRecords: loadFromStorage("gym_prs", {}),
  showConfetti: false,
  customProgramOverrides: loadProgramOverrides(),

  // Getters
  getAchievements: () => {
    const { history, personalRecords } = get();
    const achievements = [];
    const total = history.length;
    const prCount = Object.keys(personalRecords).length;
    const totalSets = history.reduce(
      (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
      0,
    );

    const addAchievement = (id, label, desc, icon, earned, progress) => {
      achievements.push({ id, label, desc, icon, earned, progress });
    };

    if (total >= 1)
      addAchievement(
        "first_workout",
        "First Step",
        "Completed your first workout",
        "flag",
        true,
      );
    else
      addAchievement(
        "first_workout",
        "First Step",
        "Complete your first workout",
        "flag",
        false,
        `${total}/1`,
      );

    if (total >= 10)
      addAchievement(
        "ten_workouts",
        "Dedicated",
        "Completed 10 workouts",
        "dumbbell",
        true,
      );
    else
      addAchievement(
        "ten_workouts",
        "Dedicated",
        `Complete 10 workouts (${total}/10)`,
        "dumbbell",
        false,
        `${total}/10`,
      );

    if (total >= 25)
      addAchievement(
        "25_workouts",
        "Consistent",
        "Completed 25 workouts",
        "flame",
        true,
      );
    else
      addAchievement(
        "25_workouts",
        "Consistent",
        `Complete 25 workouts (${total}/25)`,
        "flame",
        false,
        `${total}/25`,
      );

    if (total >= 50)
      addAchievement(
        "50_workouts",
        "Iron Will",
        "Completed 50 workouts",
        "zap",
        true,
      );
    else
      addAchievement(
        "50_workouts",
        "Iron Will",
        `Complete 50 workouts (${total}/50)`,
        "zap",
        false,
        `${total}/50`,
      );

    if (total >= 100)
      addAchievement(
        "100_workouts",
        "Legend",
        "Completed 100 workouts",
        "crown",
        true,
      );
    else
      addAchievement(
        "100_workouts",
        "Legend",
        `Complete 100 workouts (${total}/100)`,
        "crown",
        false,
        `${total}/100`,
      );

    if (prCount >= 1)
      addAchievement(
        "first_pr",
        "Record Breaker",
        "Set your first personal record",
        "trophy",
        true,
      );
    else
      addAchievement(
        "first_pr",
        "Record Breaker",
        "Set your first personal record",
        "trophy",
        false,
        `${prCount}/1`,
      );

    if (prCount >= 10)
      addAchievement(
        "ten_prs",
        "PR Machine",
        "Set 10 personal records",
        "target",
        true,
      );
    else
      addAchievement(
        "ten_prs",
        "PR Machine",
        `Set 10 personal records (${prCount}/10)`,
        "target",
        false,
        `${prCount}/10`,
      );

    if (totalSets >= 100)
      addAchievement(
        "100_sets",
        "Volume King",
        "Completed 100 total sets",
        "bar-chart",
        true,
      );
    else
      addAchievement(
        "100_sets",
        "Volume King",
        `Complete 100 sets (${totalSets}/100)`,
        "bar-chart",
        false,
        `${totalSets}/100`,
      );

    if (totalSets >= 500)
      addAchievement(
        "500_sets",
        "Unstoppable",
        "Completed 500 total sets",
        "rocket",
        true,
      );
    else
      addAchievement(
        "500_sets",
        "Unstoppable",
        `Complete 500 sets (${totalSets}/500)`,
        "rocket",
        false,
        `${totalSets}/500`,
      );

    return achievements;
  },

  getWeeklyTrend: () => {
    const { history } = get();
    const weeks = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7) - w * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = history.filter((s) => {
        const d = parseLocalDate(s.date);
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
        (e) => e.exerciseId === exerciseId && e.sets?.length > 0,
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

  // ── Apply custom overrides to a program's exercise list ──
  getResolvedExercises: (programId) => {
    const { programs, customProgramOverrides } = get();
    const program = programs[programId];
    if (!program) return [];
    const overrides = customProgramOverrides[programId] || {};
    return program.exercises.map((exId) => overrides[exId] || exId);
  },

  // Workout lifecycle
  startWorkout: (programId) => {
    const {
      programs,
      exercises,
      customProgramOverrides,
      activeWorkout,
      activeProgram,
    } = get();
    if (activeWorkout) return;
    const program = programs[programId];
    if (!program) return;

    // Apply any custom overrides to the exercise list
    const overrides = customProgramOverrides[programId] || {};
    const resolvedExerciseIds = program.exercises.map(
      (exId) => overrides[exId] || exId,
    );

    const workoutExercises = resolvedExerciseIds.map((exId, index) => {
      const ex = exercises.find((e) => e.id === exId);
      const sets = Array.from({ length: ex?.default_sets || 3 }, () => ({
        weight: "",
        reps: "",
        done: false,
      }));
      return {
        exerciseId: exId,
        originalExerciseId: program.exercises[index],
        sets,
      };
    });

    set({
      restTimerExerciseId: null,
      activeWorkout: {
        programId,
        programName: program.name,
        trainingPlan: activeProgram || "ppl_upper",
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
        restTimerTrigger: newDoneState
          ? state.restTimerTrigger + 1
          : state.restTimerTrigger,
        restTimerExerciseId: newDoneState
          ? exercises[exerciseIndex].exerciseId
          : state.restTimerExerciseId,
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

  swapExercise: (exerciseIndex, newExerciseId, permanent = false) => {
    set((state) => {
      if (!state.activeWorkout) return state;

      const exercises = [...state.activeWorkout.exercises];
      const originalExerciseId =
        exercises[exerciseIndex].originalExerciseId ||
        exercises[exerciseIndex].exerciseId;
      const newExercise = state.exercises.find((e) => e.id === newExerciseId);
      if (!newExercise) return state;

      exercises[exerciseIndex] = {
        exerciseId: newExerciseId,
        originalExerciseId,
        sets: Array.from({ length: newExercise.default_sets || 3 }, () => ({
          weight: "",
          reps: "",
          done: false,
        })),
      };

      const result = {
        activeWorkout: { ...state.activeWorkout, exercises },
      };

      // Permanent swap: store in customProgramOverrides (not mutating base programs)
      if (permanent && state.activeWorkout.programId) {
        const programId = state.activeWorkout.programId;
        const updatedOverrides = { ...state.customProgramOverrides };
        const programOverrides = { ...(updatedOverrides[programId] || {}) };
        programOverrides[originalExerciseId] = newExerciseId;
        updatedOverrides[programId] = programOverrides;
        saveToStorage("gym_custom_program_overrides", updatedOverrides);
        result.customProgramOverrides = updatedOverrides;
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

  finishWorkout: () => {
    const { activeWorkout, history, personalRecords } = get();
    if (!activeWorkout) return;

    const session = {
      id: Date.now().toString(),
      date: todayKey(),
      programId: activeWorkout.programId,
      programName: activeWorkout.programName,
      trainingPlan:
        activeWorkout.trainingPlan || get().activeProgram || "ppl_upper",
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
      restTimerExerciseId: null,
      showConfetti: true,
    });

    setTimeout(() => set({ showConfetti: false }), 4000);
    return session;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null, restTimerExerciseId: null });
  },

  clearHistory: () => {
    saveToStorage("gym_history", []);
    saveToStorage("gym_prs", {});
    set({ history: [], personalRecords: {} });
  },
});
