import { loadFromStorage, saveToStorage } from "./helpers";

const STORAGE_KEY = "gym_measurements";

const defaultMeasurements = {
  entries: [], // Array of { date, bodyFat, chest, waist, arms, thighs, notes }
};

// ── Body & InBody Measurements Slice ──
export const createMeasurementSlice = (set, get) => ({
  measurements: loadFromStorage(STORAGE_KEY, defaultMeasurements),

  addMeasurement: (entry) => {
    set((state) => {
      const userProfile = state.userProfile || {};
      const height = entry.height !== undefined && entry.height !== "" ? Number(entry.height) : userProfile.height || null;
      const weight = entry.weight !== undefined && entry.weight !== "" ? Number(entry.weight) : userProfile.weight || null;
      const age = entry.age !== undefined && entry.age !== "" ? Number(entry.age) : userProfile.age || null;

      const newEntry = {
        id: crypto.randomUUID(),
        date: entry.date || new Date().toLocaleDateString("en-CA"),
        height,
        weight,
        age,
        skeletalMuscleMass: entry.skeletalMuscleMass ? Number(entry.skeletalMuscleMass) : null,
        bodyFat: entry.bodyFat ? Number(entry.bodyFat) : null,
        bodyFatMass: entry.bodyFatMass ? Number(entry.bodyFatMass) : null,
        water: entry.water ? Number(entry.water) : null,
        visceralFat: entry.visceralFat ? Number(entry.visceralFat) : null,
        bmr: entry.bmr ? Number(entry.bmr) : null,
        boneMass: entry.boneMass ? Number(entry.boneMass) : null,
        chest: entry.chest ? Number(entry.chest) : null,
        waist: entry.waist ? Number(entry.waist) : null,
        arms: entry.arms ? Number(entry.arms) : null,
        thighs: entry.thighs ? Number(entry.thighs) : null,
        notes: entry.notes || "",
      };

      const updated = {
        ...state.measurements,
        entries: [...state.measurements.entries, newEntry],
      };
      saveToStorage(STORAGE_KEY, updated);

      // Auto sync height/weight/age with userProfile if syncProfile is not false
      if (entry.syncProfile !== false && (height || weight || age)) {
        const profileUpdates = {};
        if (weight) profileUpdates.weight = weight;
        if (height) profileUpdates.height = height;
        if (age) profileUpdates.age = age;
        
        if (typeof get().updateUserProfile === "function") {
          get().updateUserProfile(profileUpdates);
        }
      }

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
    if (!measurements || !measurements.entries || measurements.entries.length === 0) return null;
    return measurements.entries[measurements.entries.length - 1];
  },
});
