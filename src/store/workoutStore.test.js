import { describe, it, expect, beforeEach } from 'vitest';
import useWorkoutStore from './workoutStore';
import exercises, { trainingPlans, CORE_SPLIT_ANGLES } from '../data/exercises';

describe('WorkoutStore & Biomechanical Database', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({
      activeWorkout: null,
      history: [],
      dailyChecklist: { water: 0, vitamin: false, proteinShake: false, mealsEaten: [] },
      customProgramOverrides: {},
    });
  });

  it('should initialize with default state and dual split training plans', () => {
    const state = useWorkoutStore.getState();
    expect(state.history).toEqual([]);
    expect(state.activeWorkout).toBeNull();
    expect(trainingPlans.ppl_upper).toBeDefined();
    expect(trainingPlans.bro_split).toBeDefined();
  });

  it('verifies 94-exercise catalog with every core split angle covered by 3+ exercises and no duplicates', () => {
    expect(exercises.length).toBe(94);

    const ids = exercises.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(94);

    const muscleCounts = { chest: 13, back: 19, shoulders: 13, legs: 19, arms: 16, core: 12, glutes: 1, forearms: 1 };
    Object.entries(muscleCounts).forEach(([m, expected]) => {
      const count = exercises.filter(e => e.primaryMuscle === m).length;
      expect(count, `Expected ${expected} exercises for ${m}, found ${count}`).toBe(expected);
    });

    // Every core split biomechanical angle has at least 3 distinct exercises
    const angleCounts = {};
    exercises.forEach((e) => {
      angleCounts[e.targetAngle] = (angleCounts[e.targetAngle] || 0) + 1;
    });
    CORE_SPLIT_ANGLES.forEach((angle) => {
      const count = angleCounts[angle] || 0;
      expect(count, `Core angle ${angle} has only ${count} exercise(s); need at least 3`).toBeGreaterThanOrEqual(3);
    });
  });

  it('verifies equipment-swap links are bidirectional and capped at 3 per exercise', () => {
    const byId = new Map(exercises.map(e => [e.id, e]));
    exercises.forEach((e) => {
      expect(Array.isArray(e.alternatives), `${e.id} missing alternatives`).toBe(true);
      expect(e.alternatives.length, `${e.id} has too many swap links`).toBeLessThanOrEqual(3);
      e.alternatives.forEach((altId) => {
        const alt = byId.get(altId);
        expect(alt, `${e.id} links to unknown exercise ${altId}`).toBeDefined();
        // Same biomechanical angle required for a valid swap
        expect(alt.targetAngle, `${e.id} -> ${altId} angle mismatch`).toBe(e.targetAngle);
        // Bidirectionality: B must list A back
        expect(
          alt.alternatives.includes(e.id),
          `${e.id} lists ${altId} but ${altId} does not list ${e.id} back`,
        ).toBe(true);
      });
    });
  });

  it('verifies all exercises have biomechanical category, primaryMuscle, and targetAngle tags', () => {
    exercises.forEach((ex) => {
      expect(ex.id, `Exercise ${ex.id} missing ID`).toBeDefined();
      expect(ex.name, `Exercise ${ex.id} missing name`).toBeDefined();
      expect(['compound', 'isolation', 'stretch', 'machine']).toContain(ex.category);
      expect(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'forearms']).toContain(ex.primaryMuscle);
      expect(ex.targetAngle).toBeDefined();
      expect(typeof ex.targetAngle).toBe('string');
      expect(ex.targetAngle.length).toBeGreaterThan(0);
    });
  });

  it('verifies Chest has all essential biomechanical angles', () => {
    const chestAngles = new Set(exercises.filter(e => e.primaryMuscle === 'chest').map(e => e.targetAngle));
    expect(chestAngles.has('upper_chest')).toBe(true);
    expect(chestAngles.has('mid_chest')).toBe(true);
    expect(chestAngles.has('lower_chest')).toBe(true);
    expect(chestAngles.has('inner_chest')).toBe(true);
  });

  it('verifies Back has all 6 comprehensive biomechanical angles', () => {
    const backAngles = new Set(exercises.filter(e => e.primaryMuscle === 'back').map(e => e.targetAngle));
    expect(backAngles.has('vertical_pull')).toBe(true);
    expect(backAngles.has('horizontal_row')).toBe(true);
    expect(backAngles.has('unilateral_row')).toBe(true);
    expect(backAngles.has('lat_isolation')).toBe(true);
    expect(backAngles.has('upper_back_rear_delt')).toBe(true);
    expect(backAngles.has('lower_back_posterior')).toBe(true);
  });

  it('verifies Shoulders have all 4 biomechanical angles', () => {
    const shoulderAngles = new Set(exercises.filter(e => e.primaryMuscle === 'shoulders').map(e => e.targetAngle));
    expect(shoulderAngles.has('anterior_delt')).toBe(true);
    expect(shoulderAngles.has('lateral_delt')).toBe(true);
    expect(shoulderAngles.has('posterior_delt')).toBe(true);
    expect(shoulderAngles.has('upper_traps')).toBe(true);
  });

  it('verifies Legs & Core have all 6 biomechanical angles', () => {
    const legAndCoreAngles = new Set(exercises.filter(e => e.primaryMuscle === 'legs' || e.primaryMuscle === 'core').map(e => e.targetAngle));
    expect(legAndCoreAngles.has('quad_compound')).toBe(true);
    expect(legAndCoreAngles.has('quad_isolation')).toBe(true);
    expect(legAndCoreAngles.has('hamstring_hinge')).toBe(true);
    expect(legAndCoreAngles.has('hamstring_curl')).toBe(true);
    expect(legAndCoreAngles.has('calves')).toBe(true);
    expect(legAndCoreAngles.has('core_abs')).toBe(true);
  });

  it('verifies Arms have all 5 biomechanical angles', () => {
    const armAngles = new Set(exercises.filter(e => e.primaryMuscle === 'arms').map(e => e.targetAngle));
    expect(armAngles.has('bicep_long_head')).toBe(true);
    expect(armAngles.has('bicep_short_head')).toBe(true);
    expect(armAngles.has('brachialis')).toBe(true);
    expect(armAngles.has('tricep_long_head')).toBe(true);
    expect(armAngles.has('tricep_lateral_medial')).toBe(true);
  });

  it('should support swapping an exercise permanently via customProgramOverrides without altering base template', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('push_day');
    
    let active = useWorkoutStore.getState().activeWorkout;
    expect(active).not.toBeNull();
    const originalFirstExercise = active.exercises[0].exerciseId;

    // Swap to machine chest press permanently
    store.swapExercise(0, 'chest_machine_flat_press', true);

    active = useWorkoutStore.getState().activeWorkout;
    expect(active.exercises[0].exerciseId).toBe('chest_machine_flat_press');

    const overrides = useWorkoutStore.getState().customProgramOverrides;
    expect(overrides['push_day']).toBeDefined();
    expect(overrides['push_day'][originalFirstExercise]).toBe('chest_machine_flat_press');

    // Base template remains pristine
    expect(trainingPlans.ppl_upper.programs.push_day.exercises[0]).toBe(originalFirstExercise);
  });

  it('should increment water and toggle checklist items', () => {
    const store = useWorkoutStore.getState();
    store.incrementWater();
    expect(useWorkoutStore.getState().dailyChecklist.water).toBe(1);

    store.toggleChecklistItem('vitamin');
    expect(useWorkoutStore.getState().dailyChecklist.vitamin).toBe(true);
    store.toggleChecklistItem('vitamin');
    expect(useWorkoutStore.getState().dailyChecklist.vitamin).toBe(false);
  });

  it('verifies non-destructive migration upgrades schema to 4.0.0 while preserving custom user exercises and overrides', async () => {
    localStorage.setItem('gym_db_version', '3.0.0');
    localStorage.setItem('gym_exercises', JSON.stringify([{ id: 'user_custom_1', name: 'My Custom Lift', muscle: 'Chest' }]));
    localStorage.setItem('gym_programs', JSON.stringify({ custom_prog: { id: 'custom_prog', name: 'Custom', exercises: ['user_custom_1'] } }));
    localStorage.setItem('gym_custom_program_overrides', JSON.stringify({ push_day: { chest_bb_flat_bench: 'chest_db_flat_press' } }));

    const { purgeAndSyncDatabase } = await import('../store/exerciseSlice');
    purgeAndSyncDatabase();

    expect(localStorage.getItem('gym_db_version')).toBe('4.0.0');
    const syncedExercises = JSON.parse(localStorage.getItem('gym_exercises'));
    expect(syncedExercises.length).toBe(95); // 94 built-ins + 1 preserved custom exercise
    expect(syncedExercises.some(e => e.id === 'chest_bb_flat_bench')).toBe(true);
    expect(syncedExercises.some(e => e.id === 'glute_bb_hip_thrust')).toBe(true);
    expect(syncedExercises.some(e => e.id === 'forearm_farmer_walk')).toBe(true);
    expect(syncedExercises.some(e => e.id === 'user_custom_1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('gym_custom_program_overrides'))).toEqual({
      push_day: { chest_bb_flat_bench: 'chest_db_flat_press' },
    });
  });
});
