import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  generateId,
  todayKey,
} from "./helpers";

// Default weekly goal: 150 moderate-equivalent minutes
const DEFAULT_GOAL = { moderateMinutes: 150 };

// ── Cardio Slice ──
export const createCardioSlice = (set, get) => ({
  // State
  cardioHistory: loadFromStorage(STORAGE_KEYS.cardioHistory, []),
  cardioGoal: loadFromStorage(STORAGE_KEYS.cardioGoal, DEFAULT_GOAL),

  // ── CRUD: Cardio Sessions ──
  addCardioSession: (session) => {
    set((state) => {
      const newSession = {
        id: generateId(),
        date: session.date || todayKey(),
        activityId: session.activityId,
        activityName: session.activityName || "",
        activityNameAr: session.activityNameAr || "",
        duration: Number(session.duration) || 0, // minutes
        distance: session.distance ? Number(session.distance) : null,
        intensity: session.intensity || "moderate", // light | moderate | vigorous
        rpe: session.rpe ? Number(session.rpe) : null, // 1-10 RPE
        heartRate: session.heartRate ? Number(session.heartRate) : null,
        estimatedCalories: session.estimatedCalories ? Number(session.estimatedCalories) : null,
        incline: session.incline ? Number(session.incline) : null,
        notes: session.notes || "",
        createdAt: new Date().toISOString(),
      };
      const updated = [...state.cardioHistory, newSession];
      saveToStorage(STORAGE_KEYS.cardioHistory, updated);
      return { cardioHistory: updated };
    });
  },

  updateCardioSession: (id, updates) => {
    set((state) => {
      const updated = state.cardioHistory.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      saveToStorage(STORAGE_KEYS.cardioHistory, updated);
      return { cardioHistory: updated };
    });
  },

  deleteCardioSession: (id) => {
    set((state) => {
      const updated = state.cardioHistory.filter((s) => s.id !== id);
      saveToStorage(STORAGE_KEYS.cardioHistory, updated);
      return { cardioHistory: updated };
    });
  },

  // ── Goal ──
  setCardioGoal: (goal) => {
    set({ cardioGoal: goal });
    saveToStorage(STORAGE_KEYS.cardioGoal, goal);
  },

  // ── Weekly Stats ──
  getCardioWeeklyStats: () => {
    const { cardioHistory } = get();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const thisWeek = cardioHistory.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart;
    });

    let totalModerateEquiv = 0;
    let totalDuration = 0;
    let totalDistance = 0;
    let hasDistance = false;

    thisWeek.forEach((s) => {
      const dur = s.duration || 0;
      totalDuration += dur;
      if (s.distance) {
        totalDistance += s.distance;
        hasDistance = true;
      }
      // Convert to moderate-equivalent minutes:
      // vigorous = 2x moderate, light = 0.5x moderate
      if (s.intensity === "vigorous") {
        totalModerateEquiv += dur * 2;
      } else if (s.intensity === "light") {
        totalModerateEquiv += dur * 0.5;
      } else {
        totalModerateEquiv += dur;
      }
    });

    return {
      sessions: thisWeek.length,
      totalDuration,
      totalDistance: hasDistance ? totalDistance : null,
      totalModerateEquiv: Math.round(totalModerateEquiv),
    };
  },

  // ── Monthly trend (last 8 weeks) ──
  getCardioTrend: () => {
    const { cardioHistory } = get();
    const now = new Date();
    const weeks = [];

    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1 - w * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      let minutes = 0;
      cardioHistory.forEach((s) => {
        const d = new Date(s.date);
        if (d >= weekStart && d < weekEnd) {
          const dur = s.duration || 0;
          if (s.intensity === "vigorous") minutes += dur * 2;
          else if (s.intensity === "light") minutes += dur * 0.5;
          else minutes += dur;
        }
      });

      const label = w === 0 ? "This" : w === 1 ? "Last" : `${w}w`;
      weeks.push({ label, minutes: Math.round(minutes) });
    }
    return weeks;
  },
});
