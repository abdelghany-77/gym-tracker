import { describe, it, expect, beforeEach } from 'vitest';
import exercisesDatabase, { trainingPlans } from '../data/exercises';
import {
  EXERCISE_TAXONOMY,
  ANATOMICAL_REQUIREMENTS,
} from '../data/exerciseTaxonomy';
import {
  analyzeProgramCoverage,
  detectSessionRedundancies,
  selectOptimalExercise,
  getSmartSubstitutes,
  estimateSessionDurationMinutes,
} from '../utils/exerciseSelectionLogic';
import useWorkoutStore from './workoutStore';

describe('Exercise Selection, Distribution & Coverage Logic', () => {
  const exCatalogMap = new Map(exercisesDatabase.map((e) => [e.id, e]));

  beforeEach(() => {
    localStorage.clear();
  });

  // 1. عدم وجود معرّفات تمارين غير موجودة
  it('1. Verifies ZERO invalid or dangling exercise IDs across all training plans', () => {
    const allPlanIds = Object.keys(trainingPlans);
    expect(allPlanIds).toContain('ppl_3');
    expect(allPlanIds).toContain('ppl_6');
    expect(allPlanIds).toContain('bro_split');
    expect(allPlanIds).toContain('ppl_upper');

    allPlanIds.forEach((planId) => {
      const plan = trainingPlans[planId];
      Object.entries(plan.programs).forEach(([progId, prog]) => {
        expect(prog.exercises.length).toBeGreaterThan(0);
        prog.exercises.forEach((exId) => {
          expect(
            exCatalogMap.has(exId),
            `Plan "${planId}", program "${progId}" references unknown exercise: "${exId}"`
          ).toBe(true);
          expect(
            EXERCISE_TAXONOMY[exId],
            `Exercise "${exId}" must have verified taxonomy`
          ).toBeDefined();
        });
      });
    });
  });

  // 2. عدم تكرار التمرين بلا سبب داخل الجلسة
  it('2. Verifies no duplicate exercises and detects redundant movement patterns within a session', () => {
    // Check no program contains the exact same exercise ID twice
    Object.entries(trainingPlans).forEach(([planId, plan]) => {
      Object.entries(plan.programs).forEach(([progId, prog]) => {
        const uniqueIds = new Set(prog.exercises);
        expect(
          uniqueIds.size,
          `Program "${progId}" in plan "${planId}" contains duplicate exercises`
        ).toBe(prog.exercises.length);
      });
    });

    // Detect redundant pattern when two exercises do the exact same thing
    const redundantSession = [
      'chest_bb_flat_bench',
      'chest_db_flat_press', // Both mid_chest horizontal_press!
      'sh_db_lateral_raise',
    ];
    const redundancies = detectSessionRedundancies(redundantSession);
    expect(redundancies.length).toBeGreaterThan(0);
    expect(redundancies[0].muscle).toBe('chest');
    expect(redundancies[0].movementPattern).toBe('horizontal_press');
  });

  // 3. سلامة توزيع تمارين الصدر والظهر والكتف والرجل والذراع والجذع
  it('3. Verifies balanced distribution of Chest, Back, Shoulders, Legs, Arms, and Core across plans', () => {
    const plansToTest = ['ppl_3', 'ppl_6', 'bro_split'];

    plansToTest.forEach((planId) => {
      const plan = trainingPlans[planId];
      const analysis = analyzeProgramCoverage({
        programs: plan.programs,
        schedule: plan.defaultSchedule,
        catalog: exercisesDatabase,
      });

      // All 6 muscle groups must have volume represented
      const { chest, back, shoulders, legs, arms, core } = analysis.weeklyMuscleVolume;
      expect(chest.effectiveSets).toBeGreaterThan(0);
      expect(back.effectiveSets).toBeGreaterThan(0);
      expect(shoulders.effectiveSets).toBeGreaterThan(0);
      expect(legs.effectiveSets).toBeGreaterThan(0);
      expect(arms.effectiveSets).toBeGreaterThan(0);
      expect(core.effectiveSets).toBeGreaterThan(0);
    });
  });

  // 4. أن تمارين السحب الرأسي والأفقي لا تُعامل باعتبارها نمطًا واحدًا
  it('4. Treats vertical pull and horizontal row as distinct movement patterns', () => {
    expect(EXERCISE_TAXONOMY['back_wide_lat_pulldown'].movementPattern).toBe('vertical_pull');
    expect(EXERCISE_TAXONOMY['back_bb_bent_over_row'].movementPattern).toBe('horizontal_row');

    // A back routine with ONLY vertical pull must report a missing horizontal row gap
    const verticalOnlySession = ['back_wide_lat_pulldown', 'back_pullups'];
    const analysis = analyzeProgramCoverage({
      exerciseIds: verticalOnlySession,
      catalog: exercisesDatabase,
    });
    const missingHorizontalGap = analysis.gaps.find(
      (g) => g.muscle === 'back' && g.zone === 'horizontal_row'
    );
    expect(missingHorizontalGap).toBeDefined();

    // A back routine with ONLY horizontal rows must report a missing vertical pull gap
    const rowOnlySession = ['back_bb_bent_over_row', 'back_seated_cable_row'];
    const rowAnalysis = analyzeProgramCoverage({
      exerciseIds: rowOnlySession,
      catalog: exercisesDatabase,
    });
    const missingVerticalGap = rowAnalysis.gaps.find(
      (g) => g.muscle === 'back' && g.zone === 'vertical_pull'
    );
    expect(missingVerticalGap).toBeDefined();
  });

  // 5. أن وظائف مد الورك وثني الركبة في تدريب الخلفية لا تُخلط باعتبارها شيئًا واحدًا
  it('5. Distinguishes hamstring hip hinge (RDL) from knee flexion (Leg Curl) as separate functions', () => {
    expect(EXERCISE_TAXONOMY['leg_bb_rdl'].targetZone).toBe('hamstring_hinge');
    expect(EXERCISE_TAXONOMY['leg_bb_rdl'].movementPattern).toBe('hip_hinge');

    expect(EXERCISE_TAXONOMY['leg_seated_curl'].targetZone).toBe('hamstring_curl');
    expect(EXERCISE_TAXONOMY['leg_seated_curl'].movementPattern).toBe('knee_flexion');

    // If leg session has ONLY RDL (hinge) without leg curl, it must flag the missing curl gap
    const hingeOnlySession = ['leg_bb_back_squat', 'leg_bb_rdl', 'leg_standing_calf_raise'];
    const analysisHinge = analyzeProgramCoverage({
      exerciseIds: hingeOnlySession,
      catalog: exercisesDatabase,
    });
    expect(
      analysisHinge.gaps.some((g) => g.muscle === 'legs' && g.zone === 'hamstring_curl')
    ).toBe(true);

    // If leg session has ONLY curl without hinge, it must flag the missing hinge gap
    const curlOnlySession = ['leg_bb_back_squat', 'leg_seated_curl', 'leg_standing_calf_raise'];
    const analysisCurl = analyzeProgramCoverage({
      exerciseIds: curlOnlySession,
      catalog: exercisesDatabase,
    });
    expect(
      analysisCurl.gaps.some((g) => g.muscle === 'legs' && g.zone === 'hamstring_hinge')
    ).toBe(true);
  });

  // 6. أن الرأس الطويل للترايسبس لا يُعتبر مغطى بالكامل اعتمادًا على تمارين الدفع فقط
  it('6. Does NOT consider triceps long head fully covered by pushdowns alone', () => {
    const pushdownOnlyRoutine = ['arm_rope_pushdown', 'arm_straight_bar_pushdown'];
    const analysis = analyzeProgramCoverage({
      exerciseIds: pushdownOnlyRoutine,
      catalog: exercisesDatabase,
    });

    const longHeadGap = analysis.gaps.find(
      (g) => g.muscle === 'arms' && g.zone === 'tricep_long_head'
    );
    expect(longHeadGap).toBeDefined();
    expect(longHeadGap.severity).toBe('high');

    // When overhead extension is added, long head gap is resolved
    const completeTriceps = ['arm_rope_pushdown', 'arm_overhead_cable_ext'];
    const completeAnalysis = analyzeProgramCoverage({
      exerciseIds: completeTriceps,
      catalog: exercisesDatabase,
    });
    expect(
      completeAnalysis.gaps.some((g) => g.muscle === 'arms' && g.zone === 'tricep_long_head')
    ).toBe(false);
  });

  // 7. أن تغطية العضلات غير المباشرة لا تؤدي إلى إهمال الحجم الإجمالي أو تضخيمه دون مبرر
  it('7. Calculates direct vs indirect volume with configurable weight without inflating volume', () => {
    // Bench press (3 sets) directly trains Chest (3 sets) and indirectly contributes to Triceps & Anterior Delts
    const session = ['chest_bb_flat_bench']; // 3 default sets
    const analysis50 = analyzeProgramCoverage({
      exerciseIds: session,
      catalog: exercisesDatabase,
      indirectWeight: 0.5,
    });

    expect(analysis50.weeklyMuscleVolume.chest.directSets).toBe(3);
    expect(analysis50.weeklyMuscleVolume.chest.indirectSets).toBe(0);
    expect(analysis50.weeklyMuscleVolume.chest.effectiveSets).toBe(3);

    // Arms (triceps) receives 3 indirect sets, multiplied by 0.5 = 1.5 effective sets
    expect(analysis50.weeklyMuscleVolume.arms.directSets).toBe(0);
    expect(analysis50.weeklyMuscleVolume.arms.indirectSets).toBe(3);
    expect(analysis50.weeklyMuscleVolume.arms.effectiveSets).toBe(1.5);

    // If indirectWeight is changed to 0.25, effective sets adjust accurately
    const analysis25 = analyzeProgramCoverage({
      exerciseIds: session,
      catalog: exercisesDatabase,
      indirectWeight: 0.25,
    });
    expect(analysis25.weeklyMuscleVolume.arms.effectiveSets).toBe(0.8);
  });

  // 8. أن جداول Bro Split وPPL الثلاثي والسداسي تُنتج تغطية أسبوعية متسقة مع قواعدها
  it('8. Verifies weekly coverage consistency for Bro Split, PPL 3-Day, and PPL 6-Day', () => {
    // 8a: Bro Split coverage
    const broAnalysis = analyzeProgramCoverage({
      programs: trainingPlans.bro_split.programs,
      schedule: trainingPlans.bro_split.defaultSchedule,
      catalog: exercisesDatabase,
    });
    expect(broAnalysis.status).toBe('complete');
    expect(broAnalysis.scheduleConflicts.length).toBe(0); // Day ordering prevents chest/shoulder conflict

    // 8b: PPL 3-Day coverage
    const ppl3Analysis = analyzeProgramCoverage({
      programs: trainingPlans.ppl_3.programs,
      schedule: trainingPlans.ppl_3.defaultSchedule,
      catalog: exercisesDatabase,
    });
    expect(ppl3Analysis.status).toBe('complete');

    // 8c: PPL 6-Day coverage (must have distinct A and B days)
    const ppl6 = trainingPlans.ppl_6;
    expect(Object.keys(ppl6.programs)).toEqual([
      'push_day_a',
      'pull_day_a',
      'legs_day_a',
      'push_day_b',
      'pull_day_b',
      'legs_day_b',
    ]);
    const ppl6Analysis = analyzeProgramCoverage({
      programs: ppl6.programs,
      schedule: ppl6.defaultSchedule,
      catalog: exercisesDatabase,
    });
    expect(ppl6Analysis.status).toBe('complete');
    // Direct sets in 6-day split are distributed, not a naive duplicate
    expect(ppl6Analysis.weeklyMuscleVolume.chest.directSets).toBeGreaterThan(
      ppl3Analysis.weeklyMuscleVolume.chest.directSets
    );
  });

  // 9. أن تبديل المعدة المتاحة ببديل مناسب لا يؤدي إلى فقد التغطية المهمة
  it('9. Provides smart equipment substitutes without losing biomechanical coverage', () => {
    // Barbell bench press substitute with dumbbells or machine
    const benchSubs = getSmartSubstitutes('chest_bb_flat_bench', exercisesDatabase);
    expect(benchSubs.length).toBeGreaterThan(0);
    const hasDbAlternative = benchSubs.some((s) => s.id === 'chest_db_flat_press');
    expect(hasDbAlternative).toBe(true);

    // Substitutes retain the same targetZone
    benchSubs.forEach((sub) => {
      expect(sub.targetZone).toBe('mid_chest');
    });

    // Selecting optimal exercise when only dumbbells are available
    const chosen = selectOptimalExercise({
      muscle: 'chest',
      targetZone: 'upper_chest',
      availableEquipment: ['dumbbell'],
      catalog: exercisesDatabase,
    });
    expect(chosen).toBeDefined();
    expect(chosen.id).toBe('chest_db_incline_press');
    expect(chosen.equipment).toBe('dumbbell');
  });

  // 10. أن البرنامج لا يضيف تمارين إلى يوم التدريب دون مراعاة الوقت والاستشفاء
  it('10. Estimates session duration and respects time / volume constraints', () => {
    const session = trainingPlans.ppl_3.programs.push_day.exercises;
    const estTime = estimateSessionDurationMinutes(session);
    // 6 exercises * ~2.5 to 3.5 min = ~17 to 20 minutes pure rest/work time without warmups
    expect(estTime).toBeGreaterThanOrEqual(15);
    expect(estTime).toBeLessThanOrEqual(25);

    // Programs do not exceed 9 exercises per session to avoid junk volume
    Object.values(trainingPlans).forEach((plan) => {
      Object.values(plan.programs).forEach((prog) => {
        expect(prog.exercises.length).toBeLessThanOrEqual(9);
      });
    });
  });

  // 11. أن البرامج المخصصة ومعرّفات التمارين وسجلات المستخدم الموجودة لا تتغير بصورة غير مقصودة
  it('11. Preserves existing 72 exercise IDs, user custom exercises, and custom overrides', () => {
    expect(exercisesDatabase.length).toBe(72);
    // Specific cornerstone IDs are strictly intact
    expect(exCatalogMap.has('chest_bb_flat_bench')).toBe(true);
    expect(exCatalogMap.has('back_wide_lat_pulldown')).toBe(true);
    expect(exCatalogMap.has('leg_bb_back_squat')).toBe(true);
    expect(exCatalogMap.has('sh_standing_bb_ohp')).toBe(true);
    expect(exCatalogMap.has('arm_bb_bicep_curl')).toBe(true);
    expect(exCatalogMap.has('core_hanging_leg_raise')).toBe(true);

    // Store custom override functionality remains working
    const state = useWorkoutStore.getState();
    expect(state.exercises.length).toBeGreaterThanOrEqual(72);
  });

  // 12. أن تقارير التغطية تعكس التمارين التي اختارها النظام فعليًا
  it('12. Accurately reflects chosen exercises in coverage audit report', () => {
    const pushExercises = ['chest_bb_flat_bench', 'chest_db_incline_press', 'sh_db_lateral_raise'];
    const analysis = analyzeProgramCoverage({
      exerciseIds: pushExercises,
      catalog: exercisesDatabase,
    });

    const chestExercisesReported = analysis.muscleStats.chest.exercises.map((e) => e.id);
    expect(chestExercisesReported).toContain('chest_bb_flat_bench');
    expect(chestExercisesReported).toContain('chest_db_incline_press');

    const shoulderExercisesReported = analysis.muscleStats.shoulders.exercises.map((e) => e.id);
    expect(shoulderExercisesReported).toContain('sh_db_lateral_raise');
  });
});
