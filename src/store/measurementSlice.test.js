import { describe, it, expect, beforeEach } from "vitest";
import useWorkoutStore from "./workoutStore";
import { calculateBMI, getVisceralFatStatus, calculateInbodyDeltas } from "../utils/inbodyUtils";

describe("InBody Measurements & Slice", () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({
      userProfile: { name: "Test User", weight: 75, height: 180, age: 25 },
      measurements: { entries: [] },
    });
  });

  it("should add an InBody measurement with height, age, and weight", () => {
    const store = useWorkoutStore.getState();
    store.addMeasurement({
      date: "2026-10-06",
      height: 180,
      age: 25,
      weight: 76.5,
      skeletalMuscleMass: 36.2,
      bodyFat: 14.2,
      visceralFat: 4,
      bmr: 1780,
    });

    const updatedMeasurements = useWorkoutStore.getState().measurements;
    expect(updatedMeasurements.entries.length).toBe(1);

    const entry = updatedMeasurements.entries[0];
    expect(entry.height).toBe(180);
    expect(entry.age).toBe(25);
    expect(entry.weight).toBe(76.5);
    expect(entry.skeletalMuscleMass).toBe(36.2);
    expect(entry.bodyFat).toBe(14.2);
    expect(entry.visceralFat).toBe(4);
    expect(entry.bmr).toBe(1780);
  });

  it("should sync profile height, age, and weight when adding InBody measurement", () => {
    const store = useWorkoutStore.getState();
    store.addMeasurement({
      date: "2026-10-06",
      height: 182,
      age: 26,
      weight: 78,
      skeletalMuscleMass: 37,
      syncProfile: true,
    });

    const userProfile = useWorkoutStore.getState().userProfile;
    expect(userProfile.height).toBe(182);
    expect(userProfile.age).toBe(26);
    expect(userProfile.weight).toBe(78);
  });

  it("should calculate BMI, visceral fat status and deltas correctly", () => {
    const bmi = calculateBMI(75, 180);
    expect(bmi.value).toBe(23.1);
    expect(bmi.category).toBe("Normal");

    const visceral = getVisceralFatStatus(5);
    expect(visceral.category).toBe("Healthy");

    const previousScan = { weight: 77, skeletalMuscleMass: 35.0, bodyFat: 16.0 };
    const currentScan = { weight: 75, skeletalMuscleMass: 36.0, bodyFat: 14.5 };
    const deltas = calculateInbodyDeltas(currentScan, previousScan);

    expect(deltas.weight).toBe(-2);
    expect(deltas.skeletalMuscleMass).toBe(1);
    expect(deltas.bodyFat).toBe(-1.5);
  });

  it("should support deleting an InBody measurement", () => {
    const store = useWorkoutStore.getState();
    store.addMeasurement({ date: "2026-10-01", weight: 70, height: 175, age: 24 });
    
    let entries = useWorkoutStore.getState().measurements.entries;
    expect(entries.length).toBe(1);
    const id = entries[0].id;

    store.deleteMeasurement(id);
    entries = useWorkoutStore.getState().measurements.entries;
    expect(entries.length).toBe(0);
  });
});
