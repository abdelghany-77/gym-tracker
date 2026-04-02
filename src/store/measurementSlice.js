import { loadFromStorage, saveToStorage } from "./helpers";

const STORAGE_KEY = "gym_measurements";

const defaultMeasurements = {
  entries: [], // Array of { date, bodyFat, chest, waist, arms, thighs, notes }
};

// ── Body Measurements Slice ──
export const createMeasurementSlice = (set, get) => ({
  measurements: loadFromStorage(STORAGE_KEY, defaultMeasurements),

  addMeasurement: (entry) => {
    set((state) => {
      const newEntry = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString("en-CA"),
        bodyFat: entry.bodyFat || null,
        chest: entry.chest || null,
        waist: entry.waist || null,
        arms: entry.arms || null,
        thighs: entry.thighs || null,
        notes: entry.notes || "",
        ...entry,
      };
      const updated = {
        ...state.measurements,
        entries: [...state.measurements.entries, newEntry],
      };
      saveToStorage(STORAGE_KEY, updated);
      return { measurements: updated };
    });
  },

  updateMeasurement: (id, updates) => {
    set((state) => {
      const entries = state.measurements.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      );
      const updated = { ...state.measurements, entries };
      saveToStorage(STORAGE_KEY, updated);
      return { measurements: updated };
    });
  },

  deleteMeasurement: (id) => {
    set((state) => {
      const entries = state.measurements.entries.filter((e) => e.id !== id);
      const updated = { ...state.measurements, entries };
      saveToStorage(STORAGE_KEY, updated);
      return { measurements: updated };
    });
  },

  getLatestMeasurement: () => {
    const { measurements } = get();
    if (measurements.entries.length === 0) return null;
    return measurements.entries[measurements.entries.length - 1];
  },
});
