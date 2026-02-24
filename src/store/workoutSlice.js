import { loadFromStorage, saveToStorage, todayKey } from "./helpers";

// ── Workout Slice ──
export const createWorkoutSlice = (set, get) => ({
  // State
  history: loadFromStorage("gym_history", []),
  activeWorkout: null,
  restTimerTrigger: 0,
  personalRecords: loadFromStorage("gym_prs", {}),
  showConfetti: false,

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

  // Workout lifecycle
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

  swapExercise: (exerciseIndex, newExerciseId, permanent = false) => {
    set((state) => {
      if (!state.activeWorkout) return state;

      const exercises = [...state.activeWorkout.exercises];
      const oldExerciseId = exercises[exerciseIndex].exerciseId;
      const newExercise = state.exercises.find((e) => e.id === newExerciseId);
      if (!newExercise) return state;

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
});
