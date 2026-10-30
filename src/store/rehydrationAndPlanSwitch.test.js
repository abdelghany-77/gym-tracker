import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "./workoutStore";
import { calculateMacros } from "./nutritionSlice";
import { exportUserData, importUserData } from "./helpers";
import defaultExercises, { trainingPlans } from "../data/exercises";

const profile = { name: "Restored", weight: 85, height: 185, age: 30 };
const customTargets = {
  calories: 2200,
  protein: 170,
  carbs: 230,
  fat: 65,
  fiber: 30,
  calcium: 900,
};
const previousTargets = { calories: 1800, protein: 120, carbs: 200, fat: 50 };

describe("profile rehydration and ongoing workout safety", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useWorkoutStore.setState({
      activeWorkout: null,
      activeProgram: "ppl_upper",
      history: [],
      personalRecords: {},
      exercises: defaultExercises,
      programs: trainingPlans.ppl_upper.programs,
      weeklySchedule: trainingPlans.ppl_upper.defaultSchedule,
      customProgramOverrides: {},
      userProfile: { name: "Current", weight: 70, height: 175, age: 24 },
      nutritionTargets: previousTargets,
      measurements: { entries: [] },
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("derives nutrition from a valid imported profile when no targets are stored", () => {
    expect(
      importUserData(
        { userProfile: profile },
        useWorkoutStore.getState().rehydrateFromStorage,
      ).success,
    ).toBe(true);
    expect(useWorkoutStore.getState().userProfile).toEqual(profile);
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(
      calculateMacros(profile),
    );
    expect(localStorage.getItem("gym_nutrition")).toBeNull();
    const nextProfile = { ...profile, weight: 90 };
    expect(
      importUserData(
        { userProfile: nextProfile },
        useWorkoutStore.getState().rehydrateFromStorage,
      ).success,
    ).toBe(true);
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(
      calculateMacros(nextProfile),
    );
  });

  it("restores saved custom targets instead of recalculating them from the profile", () => {
    localStorage.setItem("gym_nutrition", JSON.stringify(customTargets));
    expect(
      importUserData(
        { userProfile: profile },
        useWorkoutStore.getState().rehydrateFromStorage,
      ).success,
    ).toBe(true);
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(customTargets);
    expect(JSON.parse(localStorage.getItem("gym_nutrition"))).toEqual(
      customTargets,
    );
  });

  it.each([
    { ...profile, weight: 0 },
    { ...profile, height: -1 },
    { ...profile, weight: "85" },
    { ...profile, age: "invalid" },
    { ...profile, age: -1 },
    { ...profile, age: 2.5 },
    { ...profile, height: null },
    {},
  ])(
    "does not derive targets from invalid restored profile %j",
    (invalidProfile) => {
      localStorage.setItem("gym_profile", JSON.stringify(invalidProfile));
      useWorkoutStore.getState().rehydrateFromStorage();
      expect(useWorkoutStore.getState().nutritionTargets).toEqual(
        previousTargets,
      );
    },
  );

  it("does not derive from the in-memory profile when no profile was restored", () => {
    useWorkoutStore.getState().rehydrateFromStorage();
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(
      previousTargets,
    );
  });

  it("uses the default age when a valid restored profile has no age", () => {
    const withoutAge = { weight: 85, height: 185 };
    localStorage.setItem("gym_profile", JSON.stringify(withoutAge));
    useWorkoutStore.getState().rehydrateFromStorage();
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(
      calculateMacros(withoutAge),
    );
  });

  it("round-trips custom nutrition targets in a backup", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    localStorage.setItem("gym_profile", JSON.stringify(profile));
    localStorage.setItem("gym_nutrition", JSON.stringify(customTargets));
    const backup = exportUserData();
    expect(backup.gym_nutrition).toEqual(customTargets);
    localStorage.clear();
    expect(
      importUserData(backup, useWorkoutStore.getState().rehydrateFromStorage)
        .success,
    ).toBe(true);
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(customTargets);
    expect(JSON.parse(localStorage.getItem("gym_nutrition"))).toEqual(
      customTargets,
    );
  });

  it("imports nutritionTargets shorthand without a profile", () => {
    expect(
      importUserData(
        { nutritionTargets: customTargets },
        useWorkoutStore.getState().rehydrateFromStorage,
      ).success,
    ).toBe(true);
    expect(useWorkoutStore.getState().nutritionTargets).toEqual(customTargets);
  });

  it.each([
    [null],
    [[]],
    [{ calories: -1 }],
    [{ calories: 2000, protein: "bad" }],
  ])(
    "rejects invalid imported nutrition targets without changing storage: %j",
    (targets) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("gym_nutrition", JSON.stringify(customTargets));
      const rehydrate = vi.fn();
      expect(
        importUserData(
          { userProfile: profile, gym_nutrition: targets },
          rehydrate,
        ).success,
      ).toBe(false);
      expect(JSON.parse(localStorage.getItem("gym_nutrition"))).toEqual(
        customTargets,
      );
      expect(localStorage.getItem("gym_profile")).toBeNull();
      expect(rehydrate).not.toHaveBeenCalled();
    },
  );

  it("preserves a logged session through a plan switch and saves its original plan", () => {
    const store = useWorkoutStore.getState();
    store.startWorkout("push_day");
    store.updateSet(0, 0, "weight", 60);
    store.updateSet(0, 0, "reps", 10);
    store.toggleSetDone(0, 0);
    const snapshot = useWorkoutStore.getState().activeWorkout;
    const trigger = useWorkoutStore.getState().restTimerTrigger;
    store.setActiveProgram("bro_split");
    expect(useWorkoutStore.getState().activeWorkout).toBe(snapshot);
    expect(useWorkoutStore.getState().restTimerTrigger).toBe(trigger);
    expect(useWorkoutStore.getState().activeProgram).toBe("bro_split");
    const session = store.finishWorkout();
    expect(session.trainingPlan).toBe("ppl_upper");
    expect(session.exercises[0].sets).toEqual([{ weight: 60, reps: 10 }]);
  });

  it("does not replace an ongoing workout when starting another routine", () => {
    const store = useWorkoutStore.getState();
    store.startWorkout("push_day");
    const snapshot = useWorkoutStore.getState().activeWorkout;
    store.startWorkout("pull_day");
    expect(useWorkoutStore.getState().activeWorkout).toBe(snapshot);
  });

  it.each(["reset", "import"])(
    "preserves an ongoing snapshot during %s and permits finishing it",
    (action) => {
      const store = useWorkoutStore.getState();
      store.startWorkout("push_day");
      store.updateSet(0, 0, "weight", 45);
      store.updateSet(0, 0, "reps", 8);
      store.toggleSetDone(0, 0);
      const snapshot = useWorkoutStore.getState().activeWorkout;
      if (action === "reset") {
        store.setActiveProgram("bro_split");
        store.resetToDefaults();
      } else {
        expect(
          importUserData(
            {
              activeProgram: "bro_split",
              programs: trainingPlans.bro_split.programs,
            },
            store.rehydrateFromStorage,
          ).success,
        ).toBe(true);
      }
      expect(useWorkoutStore.getState().activeWorkout).toBe(snapshot);
      expect(store.finishWorkout()).toMatchObject({
        trainingPlan: "ppl_upper",
        programId: "push_day",
      });
    },
  );

  it("ignores invalid plan switches without changing state or storage", () => {
    const store = useWorkoutStore.getState();
    store.startWorkout("push_day");
    const snapshot = useWorkoutStore.getState().activeWorkout;
    store.setActiveProgram("not-a-plan");
    expect(useWorkoutStore.getState().activeWorkout).toBe(snapshot);
    expect(useWorkoutStore.getState().activeProgram).toBe("ppl_upper");
    expect(localStorage.getItem("gym_active_program")).toBeNull();
  });

  it("does not invent a fallback image URL for an unknown exercise", () => {
    expect(
      useWorkoutStore.getState().getExerciseById("removed_exercise"),
    ).toMatchObject({ image: null, isFallback: true });
    expect(
      useWorkoutStore.getState().getExerciseById(defaultExercises[0].id),
    ).toBe(defaultExercises[0]);
  });
});
