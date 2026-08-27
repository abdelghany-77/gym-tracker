import { describe, it, expect, beforeEach } from 'vitest';
import useWorkoutStore from './workoutStore';
import exercises, { trainingPlans } from '../data/exercises';

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

  it('verifies all exercises have biomechanical category, primaryMuscle, and targetAngle tags', () => {
    exercises.forEach((ex) => {
      expect(ex.id, `Exercise ${ex.id} missing ID`).toBeDefined();
      expect(ex.name, `Exercise ${ex.id} missing name`).toBeDefined();
      expect(['compound', 'isolation', 'stretch', 'machine']).toContain(ex.category);
      expect(['chest', 'back', 'shoulders', 'arms', 'legs', 'core']).toContain(ex.primaryMuscle);
      expect(ex.targetAngle).toBeDefined();
      expect(typeof ex.targetAngle).toBe('string');
      expect(ex.targetAngle.length).toBeGreaterThan(0);
    });
  });

  it('verifies Chest has all 5 comprehensive biomechanical angles', () => {
    const chestAngles = new Set(exercises.filter(e => e.primaryMuscle === 'chest').map(e => e.targetAngle));
    expect(chestAngles.has('upper_chest')).toBe(true);
    expect(chestAngles.has('mid_chest')).toBe(true);
    expect(chestAngles.has('lower_chest')).toBe(true);
    expect(chestAngles.has('inner_chest')).toBe(true);
    expect(chestAngles.has('machine_compound')).toBe(true);
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
    store.swapExercise(0, 'chest_machine_press', true);

    active = useWorkoutStore.getState().activeWorkout;
    expect(active.exercises[0].exerciseId).toBe('chest_machine_press');

    const overrides = useWorkoutStore.getState().customProgramOverrides;
    expect(overrides['push_day']).toBeDefined();
    expect(overrides['push_day'][originalFirstExercise]).toBe('chest_machine_press');

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
});
