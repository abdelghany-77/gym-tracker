import { describe, it, expect, beforeEach, vi } from 'vitest';
import exercisesDatabase, { trainingPlans } from '../data/exercises';
import { exportUserData, importUserData, DATABASE_VERSION } from './helpers';
import useWorkoutStore from './workoutStore';

describe('Biomechanical Angle Coverage & Training Splits (Requirement 4)', () => {
  const exMap = Object.fromEntries(exercisesDatabase.map((e) => [e.id, e]));

  it('guarantees 100% (25/25) angle coverage for ppl_upper with ZERO neglected angles', () => {
    const plan = trainingPlans.ppl_upper;
    expect(plan).toBeDefined();

    const coveredAngles = new Set();
    Object.values(plan.programs).forEach((prog) => {
      prog.exercises.forEach((exId) => {
        const ex = exMap[exId];
        expect(ex, `Exercise ${exId} must exist in database`).toBeDefined();
        coveredAngles.add(ex.targetAngle);
      });
    });

    // All 25 angles represented in exercisesDatabase
    const allDbAngles = new Set(exercisesDatabase.map((e) => e.targetAngle));
    expect(allDbAngles.size).toBe(25);
    expect(coveredAngles.size).toBe(25);

    // Verify zero missing angles
    allDbAngles.forEach((angle) => {
      expect(coveredAngles.has(angle), `Angle ${angle} should be covered in ppl_upper`).toBe(true);
    });
  });

  it('guarantees 100% (25/25) angle coverage for bro_split with ZERO neglected angles', () => {
    const plan = trainingPlans.bro_split;
    expect(plan).toBeDefined();

    const coveredAngles = new Set();
    Object.values(plan.programs).forEach((prog) => {
      prog.exercises.forEach((exId) => {
        const ex = exMap[exId];
        expect(ex, `Exercise ${exId} must exist in database`).toBeDefined();
        coveredAngles.add(ex.targetAngle);
      });
    });

    const allDbAngles = new Set(exercisesDatabase.map((e) => e.targetAngle));
    expect(coveredAngles.size).toBe(25);

    allDbAngles.forEach((angle) => {
      expect(coveredAngles.has(angle), `Angle ${angle} should be covered in bro_split`).toBe(true);
    });
  });

  it('verifies exact specified exercise distribution in PPL + Upper', () => {
    const { push_day, pull_day, legs_day, upper_day } = trainingPlans.ppl_upper.programs;

    // Push Day
    expect(push_day.exercises).toEqual([
      'chest_db_incline_press',
      'chest_bb_flat_bench',
      'chest_high_to_low_cable_fly',
      'sh_seated_db_press',
      'sh_db_lateral_raise',
      'arm_rope_pushdown',
      'arm_overhead_cable_ext',
    ]);

    // Pull Day
    expect(pull_day.exercises).toEqual([
      'back_wide_lat_pulldown',
      'back_bb_bent_over_row',
      'back_db_single_arm_row',
      'back_straight_arm_pulldown',
      'back_face_pulls',
      'arm_db_incline_curl',
      'arm_db_hammer_curl',
    ]);

    // Leg Day
    expect(legs_day.exercises).toEqual([
      'leg_bb_back_squat',
      'leg_45_press',
      'leg_extension',
      'leg_bb_rdl',
      'leg_seated_curl',
      'leg_standing_calf_raise',
      'core_hanging_leg_raise',
    ]);

    // Upper Day
    expect(upper_day.exercises).toEqual([
      'chest_machine_incline_press',
      'chest_pec_deck_fly',
      'chest_dips',
      'back_seated_cable_row',
      'back_hyperextension',
      'sh_reverse_pec_deck',
      'sh_db_shrugs',
      'arm_preacher_curl',
      'arm_ez_skull_crushers',
    ]);
  });
});

describe('JSON Backup & Restore Engine (Requirement 3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports all 7 mandatory keys plus metadata correctly', () => {
    const mockHistory = [{ id: '1', date: '2026-10-17', exercises: [] }];
    const mockPrs = { chest_bb_flat_bench: 120 };
    const mockExercises = [{ id: 'ex_1', name: 'Custom Push' }];
    const mockPrograms = { custom_day: { id: 'custom_day', exercises: ['ex_1'] } };
    const mockSchedule = { 0: 'custom_day' };
    const mockOverrides = { push_day: { chest_bb_flat_bench: 'chest_db_flat_press' } };

    localStorage.setItem('gym_history', JSON.stringify(mockHistory));
    localStorage.setItem('gym_prs', JSON.stringify(mockPrs));
    localStorage.setItem('gym_exercises', JSON.stringify(mockExercises));
    localStorage.setItem('gym_programs', JSON.stringify(mockPrograms));
    localStorage.setItem('gym_schedule', JSON.stringify(mockSchedule));
    localStorage.setItem('gym_custom_program_overrides', JSON.stringify(mockOverrides));
    localStorage.setItem('gym_db_version', DATABASE_VERSION);

    const exported = exportUserData();
    expect(exported.gym_history).toEqual(mockHistory);
    expect(exported.gym_prs).toEqual(mockPrs);
    expect(exported.gym_exercises).toEqual(mockExercises);
    expect(exported.gym_programs).toEqual(mockPrograms);
    expect(exported.gym_schedule).toEqual(mockSchedule);
    expect(exported.gym_custom_program_overrides).toEqual(mockOverrides);
    expect(exported.gym_db_version).toBe(DATABASE_VERSION);
    expect(exported.exportedAt).toBeDefined();
  });

  it('imports, validates schema, sanitizes exercises, and writes to localStorage', () => {
    const onRehydrate = vi.fn();

    const backupPayload = {
      gym_history: [{ id: 'sess_1', date: '2026-10-10', exercises: [] }],
      gym_prs: { leg_bb_back_squat: 160 },
      // Duplicate exercise IDs to verify sanitization
      gym_exercises: [
        { id: 'ex_1', name: 'Exercise One' },
        { id: 'ex_1', name: 'Exercise One Duplicate' },
        { id: 'ex_2', name: 'Exercise Two' },
      ],
      gym_programs: { p1: { id: 'p1', exercises: ['ex_1'] } },
      gym_schedule: { 0: 'p1' },
      gym_custom_program_overrides: {},
      gym_db_version: '3.0.0',
    };

    const res = importUserData(backupPayload, onRehydrate);
    expect(res.success).toBe(true);
    expect(res.count.history).toBe(1);
    expect(res.count.prs).toBe(1);
    expect(res.count.exercises).toBe(2); // Sanitized from 3 to 2 unique

    expect(JSON.parse(localStorage.getItem('gym_history'))).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('gym_prs'))).toEqual({ leg_bb_back_squat: 160 });
    const storedExercises = JSON.parse(localStorage.getItem('gym_exercises'));
    expect(storedExercises).toHaveLength(2);
    expect(storedExercises.map((e) => e.id)).toEqual(['ex_1', 'ex_2']);
    expect(onRehydrate).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid backup schema gracefully without corrupting existing data', () => {
    localStorage.setItem('gym_history', JSON.stringify([{ id: 'existing_safe' }]));

    const badPayload = "{ not valid json";
    const res = importUserData(badPayload);
    expect(res.success).toBe(false);
    expect(res.message).toBeDefined();

    // Existing data is untainted
    expect(JSON.parse(localStorage.getItem('gym_history'))).toEqual([{ id: 'existing_safe' }]);
  });

  it('supports reactive re-hydration on Zustand workout store', () => {
    const newSession = { id: 'rehydrated_session', date: '2026-10-15', exercises: [] };
    const newPrs = { arm_preacher_curl: 50 };

    localStorage.setItem('gym_history', JSON.stringify([newSession]));
    localStorage.setItem('gym_prs', JSON.stringify(newPrs));

    useWorkoutStore.getState().rehydrateFromStorage();

    const state = useWorkoutStore.getState();
    expect(state.history).toHaveLength(1);
    expect(state.history[0].id).toBe('rehydrated_session');
    expect(state.personalRecords).toEqual(newPrs);
  });
});
