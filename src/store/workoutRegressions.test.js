import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "./workoutStore";
import { exportUserData, importUserData, DATABASE_VERSION } from "./helpers";
import { purgeAndSyncDatabase } from "./exerciseSlice";
import { trainingPlans } from "../data/exercises";

describe("workout and backup regressions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useWorkoutStore.setState({
      activeWorkout: null,
      history: [],
      personalRecords: {},
      customProgramOverrides: {},
      restTimerTrigger: 0,
      restTimerExerciseId: null,
      programs: trainingPlans.ppl_upper.programs,
      activeProgram: "ppl_upper",
      measurements: { entries: [] },
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("round-trips measurements, overrides, and database version without a reload purge", () => {
    const overrides = {
      push_day: { chest_bb_flat_bench: "chest_db_flat_press" },
    };
    const measurements = {
      entries: [{ id: "scan", date: "2026-10-01", weight: 75 }],
    };
    const programs = { custom: { id: "custom", exercises: [] } };
    localStorage.setItem("gym_db_version", DATABASE_VERSION);
    localStorage.setItem("gym_custom_overrides", JSON.stringify(overrides));
    localStorage.setItem("gym_measurements", JSON.stringify(measurements));
    localStorage.setItem("gym_programs", JSON.stringify(programs));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const backup = exportUserData();
    localStorage.clear();
    expect(
      importUserData(backup, useWorkoutStore.getState().rehydrateFromStorage)
        .success,
    ).toBe(true);
    expect(useWorkoutStore.getState().measurements).toEqual(measurements);
    expect(useWorkoutStore.getState().customProgramOverrides).toEqual(
      overrides,
    );
    purgeAndSyncDatabase();
    expect(JSON.parse(localStorage.getItem("gym_programs"))).toEqual(programs);
  });

  it("normalizes legacy measurement arrays to the entries shape", () => {
    const entries = [{ id: "old-scan", date: "2026-10-01", weight: 70 }];
    expect(
      importUserData(
        { history: [], measurements: entries },
        useWorkoutStore.getState().rehydrateFromStorage,
      ).success,
    ).toBe(true);
    expect(useWorkoutStore.getState().measurements).toEqual({ entries });
    expect(() =>
      useWorkoutStore
        .getState()
        .addMeasurement({ weight: 72, syncProfile: false }),
    ).not.toThrow();
  });

  it.each([
    {},
    { history: [null] },
    {
      history: [
        {
          id: "bad",
          date: "2026-10-01",
          exercises: [{ exerciseId: "x", sets: null }],
        },
      ],
    },
    { history: [], measurements: { entries: null } },
    { history: [], programs: null },
    { history: null },
    { history: [], personalRecords: { bench: { weight: 100 } } },
    { history: [], programs: { broken: {} } },
    { history: [], measurements: { entries: [null] } },
  ])(
    "rejects malformed backups before modifying existing data: %j",
    (payload) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("gym_history", '["keep"]');
      const rehydrate = vi.fn();
      expect(importUserData(payload, rehydrate).success).toBe(false);
      expect(localStorage.getItem("gym_history")).toBe('["keep"]');
      expect(rehydrate).not.toHaveBeenCalled();
    },
  );

  it("does not erase history when importing only measurements", () => {
    localStorage.setItem("gym_history", '["keep"]');
    expect(importUserData({ measurements: { entries: [] } }).success).toBe(
      true,
    );
    expect(localStorage.getItem("gym_history")).toBe('["keep"]');
  });

  it("reports storage failures and rolls back a partially written import", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("gym_history", '["keep"]');
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      function (key, value) {
        if (key === "gym_prs")
          throw new DOMException("Storage full", "QuotaExceededError");
        return originalSetItem.call(this, key, value);
      },
    );
    const rehydrate = vi.fn();
    expect(
      importUserData({ history: [], prs: { bench: 60 } }, rehydrate).success,
    ).toBe(false);
    expect(localStorage.getItem("gym_history")).toBe('["keep"]');
    expect(rehydrate).not.toHaveBeenCalled();
  });

  it("accepts the quoted version marker produced by older imports without purging", () => {
    localStorage.setItem("gym_db_version", JSON.stringify(DATABASE_VERSION));
    localStorage.setItem("gym_programs", '{"keep":true}');
    purgeAndSyncDatabase();
    expect(localStorage.getItem("gym_programs")).toBe('{"keep":true}');
  });

  it("keeps repeated permanent replacements on the original template slot", () => {
    const store = useWorkoutStore.getState();
    store.startWorkout("push_day");
    store.swapExercise(0, "chest_machine_flat_press", true);
    store.cancelWorkout();
    store.startWorkout("push_day");
    store.swapExercise(0, "chest_db_flat_press", true);
    store.cancelWorkout();
    store.rehydrateFromStorage();
    store.startWorkout("push_day");
    expect(
      useWorkoutStore.getState().activeWorkout.exercises[0].exerciseId,
    ).toBe("chest_db_flat_press");
    store.resetToDefaults();
    expect(useWorkoutStore.getState().getResolvedExercises("push_day")).toEqual(
      trainingPlans.ppl_upper.programs.push_day.exercises,
    );
  });

  it("does not let skipped exercises erase the last completed ghost sets", () => {
    useWorkoutStore.setState({
      history: [
        {
          date: "2026-10-01",
          exercises: [{ exerciseId: "x", sets: [{ weight: 40, reps: 10 }] }],
        },
        { date: "2026-10-02", exercises: [{ exerciseId: "x", sets: [] }] },
      ],
    });
    expect(useWorkoutStore.getState().getGhostData("x").sets).toEqual([
      { weight: 40, reps: 10 },
    ]);
  });

  it("emits distinct rest events with the actual completed exercise at the same timestamp", () => {
    const store = useWorkoutStore.getState();
    store.startWorkout("push_day");
    store.toggleSetDone(1, 0);
    const firstTrigger = useWorkoutStore.getState().restTimerTrigger;
    store.toggleSetDone(0, 0);
    expect(useWorkoutStore.getState().restTimerTrigger).toBeGreaterThan(
      firstTrigger,
    );
    expect(useWorkoutStore.getState().restTimerExerciseId).toBe(
      useWorkoutStore.getState().activeWorkout.exercises[0].exerciseId,
    );
  });

  it("counts Sunday in the current Monday-start week", () => {
    vi.setSystemTime(new Date(2026, 9, 25, 12));
    useWorkoutStore.setState({
      history: [
        { date: "2026-10-19" },
        { date: "2026-10-25" },
        { date: "2026-10-26" },
      ],
    });
    expect(useWorkoutStore.getState().getWeeklyTrend().at(-1)).toEqual({
      label: "This",
      count: 2,
    });
  });
});
