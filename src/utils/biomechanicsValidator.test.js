import { describe, it, expect } from 'vitest';
import {
  DAILY_ANGLE_REQUIREMENTS,
  detectDayType,
  auditRoutineAngles,
  getCandidatesForAngle,
} from './biomechanicsValidator';
import { exercisesDatabase } from '../data/exercises';

describe('Biomechanical Validator Engine (Requirement 1)', () => {
  const exMap = new Map(exercisesDatabase.map((e) => [e.id, e]));

  it('defines rules for all required workout splits', () => {
    expect(DAILY_ANGLE_REQUIREMENTS.chest_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.push_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.back_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.pull_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.shoulder_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.leg_day).toBeDefined();
    expect(DAILY_ANGLE_REQUIREMENTS.arm_day).toBeDefined();
  });

  describe('Angle Coverage Rules Verification', () => {
    it('verifies Chest Day rules: upper_chest, mid_chest, lower_chest, inner_chest', () => {
      const required = DAILY_ANGLE_REQUIREMENTS.chest_day.requiredAngles.map((a) => a.id);
      expect(required).toContain('upper_chest');
      expect(required).toContain('mid_chest');
      expect(required).toContain('lower_chest');
      expect(required).toContain('inner_chest');
    });

    it('verifies Back Day rules: vertical_pull, horizontal_row, unilateral_row, lat_isolation, upper_back_rear_delt', () => {
      const required = DAILY_ANGLE_REQUIREMENTS.back_day.requiredAngles.map((a) => a.id);
      expect(required).toContain('vertical_pull');
      expect(required).toContain('horizontal_row');
      expect(required).toContain('unilateral_row');
      expect(required).toContain('lat_isolation');
      expect(required).toContain('upper_back_rear_delt');
    });

    it('verifies Shoulder Day rules: anterior_delt, lateral_delt, posterior_delt, upper_traps', () => {
      const required = DAILY_ANGLE_REQUIREMENTS.shoulder_day.requiredAngles.map((a) => a.id);
      expect(required).toContain('anterior_delt');
      expect(required).toContain('lateral_delt');
      expect(required).toContain('posterior_delt');
      expect(required).toContain('upper_traps');
    });

    it('verifies Leg Day rules: quad_compound, quad_isolation, hamstring_hinge, hamstring_curl, calves', () => {
      const required = DAILY_ANGLE_REQUIREMENTS.leg_day.requiredAngles.map((a) => a.id);
      expect(required).toContain('quad_compound');
      expect(required).toContain('quad_isolation');
      expect(required).toContain('hamstring_hinge');
      expect(required).toContain('hamstring_curl');
      expect(required).toContain('calves');
    });

    it('verifies Arm Day rules: bicep_long_head, bicep_short_head, brachialis, tricep_long_head, tricep_lateral_medial', () => {
      const required = DAILY_ANGLE_REQUIREMENTS.arm_day.requiredAngles.map((a) => a.id);
      expect(required).toContain('bicep_long_head');
      expect(required).toContain('bicep_short_head');
      expect(required).toContain('brachialis');
      expect(required).toContain('tricep_long_head');
      expect(required).toContain('tricep_lateral_medial');
    });
  });

  describe('Auditing and Missing Angle Flagging', () => {
    it('flags missing Lower Lats when back routine lacks unilateral_row', () => {
      // Create back routine missing unilateral_row
      const incompleteBackRoutine = [
        exMap.get('back_wide_lat_pulldown'),   // vertical_pull
        exMap.get('back_bb_bent_over_row'),     // horizontal_row
        exMap.get('back_straight_arm_pulldown'),// lat_isolation
        exMap.get('back_face_pulls'),           // upper_back_rear_delt
      ];

      const audit = auditRoutineAngles(incompleteBackRoutine, 'back_day');
      expect(audit.isComplete).toBe(false);
      expect(audit.coveragePercent).toBeLessThan(100);

      const missingAngleIds = audit.missingAngles.map((m) => m.id);
      expect(missingAngleIds).toContain('unilateral_row');

      const lowerLatMissing = audit.missingAngles.find((m) => m.id === 'unilateral_row');
      expect(lowerLatMissing.suggestedExercise).toBeDefined();
      expect(lowerLatMissing.suggestedExercise.id).toBe('back_db_single_arm_row');
    });

    it('returns 100% complete audit when all required angles are covered', () => {
      const completeBackRoutine = [
        exMap.get('back_wide_lat_pulldown'),   // vertical_pull
        exMap.get('back_bb_bent_over_row'),     // horizontal_row
        exMap.get('back_db_single_arm_row'),    // unilateral_row
        exMap.get('back_straight_arm_pulldown'),// lat_isolation
        exMap.get('back_face_pulls'),           // upper_back_rear_delt
      ];

      const audit = auditRoutineAngles(completeBackRoutine, 'back_day');
      expect(audit.isComplete).toBe(true);
      expect(audit.coveragePercent).toBe(100);
      expect(audit.missingAngles.length).toBe(0);
      expect(audit.coveredAngles.length).toBe(5);
    });

    it('correctly auto-detects day type based on muscle frequency', () => {
      const chestExercises = [
        exMap.get('chest_bb_flat_bench'),
        exMap.get('chest_db_incline_press'),
        exMap.get('chest_dips'),
      ];
      expect(detectDayType(chestExercises)).toBe('chest_day');

      const legExercises = [
        exMap.get('leg_bb_back_squat'),
        exMap.get('leg_extension'),
        exMap.get('leg_bb_rdl'),
      ];
      expect(detectDayType(legExercises)).toBe('leg_day');
    });

    it('retrieves candidate exercises for a given angle', () => {
      const candidates = getCandidatesForAngle('unilateral_row');
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.every((c) => c.targetAngle === 'unilateral_row')).toBe(true);
      expect(candidates.some((c) => c.id === 'back_db_single_arm_row')).toBe(true);
    });
  });
});
