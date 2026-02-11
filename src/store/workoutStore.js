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

const getNextWorkout = () => {
  const today = new Date().getDay(); // 0=Sun
  // Map JS day (0=Sun) to schedule index (0=Mon)
  const scheduleMap = [6, 0, 1, 2, 3, 4, 5]; // Sun=6, Mon=0, Tue=1...

  for (let offset = 0; offset < 7; offset++) {
    const jsDay = (today + offset) % 7;
    const schedIdx = scheduleMap[jsDay];
    const programId = weeklySchedule[schedIdx];
    if (programId) {
      return {
        program: workoutPrograms[programId],
        daysUntil: offset,
      };
    }
  }
  return null;
};

// ── Zustand Store ──
const useWorkoutStore = create((set, get) => ({
  // ── State ──
  history: loadFromStorage("gym_history", []),
  dailyChecklist: loadFromStorage("gym_checklist_" + todayKey(), {
    vitamin: false,
    creatine: false,
    water: 0,
  }),
  activeWorkout: null, // { programId, startedAt, exercises: [ { exerciseId, sets: [{ weight, reps, done }] } ] }
  restTimerTrigger: 0, // Timestamp when a set is marked done, triggering the timer
  personalRecords: loadFromStorage("gym_prs", {}),

  // ── Getters ──
  getExerciseById: (id) => exercises.find((e) => e.id === id),
  getAllExercises: () => exercises,
  getPrograms: () => workoutPrograms,
  getSchedule: () => weeklySchedule,

  getNextWorkout: () => {
    const { history } = get();
    return getNextWorkout(history);
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
    });

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
