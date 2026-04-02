import { describe, it, expect, beforeEach } from 'vitest';
import useWorkoutStore from './workoutStore';

describe('WorkoutStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({
      activeWorkout: null,
      history: [],
      dailyChecklist: { water: 0, vitamin: false, proteinShake: false, mealsEaten: [] },
    });
  });

  it('should initialize with default state', () => {
    const state = useWorkoutStore.getState();
    expect(state.history).toEqual([]);
    expect(state.activeWorkout).toBeNull();
  });

  it('should increment water count', () => {
    const store = useWorkoutStore.getState();
    store.incrementWater();
    expect(useWorkoutStore.getState().dailyChecklist.water).toBe(1);
  });

  it('should toggle vitamin status', () => {
    const store = useWorkoutStore.getState();
    store.toggleChecklistItem('vitamin');
    expect(useWorkoutStore.getState().dailyChecklist.vitamin).toBe(true);
    store.toggleChecklistItem('vitamin');
    expect(useWorkoutStore.getState().dailyChecklist.vitamin).toBe(false);
  });
});
