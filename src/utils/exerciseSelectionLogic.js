// ════════════════════════════════════════════════════════════════════════════════
// EXERCISE SELECTION & PROGRAM COVERAGE ENGINE
// Intelligent biomechanical verification, volume auditing, and gap analysis
// ════════════════════════════════════════════════════════════════════════════════

import {
  EXERCISE_TAXONOMY,
  ANATOMICAL_REQUIREMENTS,
  DEFAULT_INDIRECT_WEIGHT,
} from "../data/exerciseTaxonomy";

/**
 * Retrieves normalized taxonomy metadata for an exercise.
 * If not in database taxonomy, creates a safe unverified record.
 */
export const getExerciseTaxonomy = (exercise) => {
  if (!exercise) return null;
  const exId = typeof exercise === "string" ? exercise : exercise.id;
  const known = EXERCISE_TAXONOMY[exId];

  if (known) {
    return {
      id: exId,
      name: exercise.name || exId,
      primaryMuscle: known.primaryMuscle,
      targetZone: known.targetZone,
      secondaryMuscles: known.secondaryMuscles || [],
      movementPattern: known.movementPattern,
      functionalAction: known.functionalAction,
      jointMechanics: known.jointMechanics,
      primaryRole: known.primaryRole,
      alternatives: known.alternatives || [],
      rationaleEn: known.rationaleEn,
      rationaleAr: known.rationaleAr,
      isVerified: true,
    };
  }

  // Graceful fallback for custom or unmapped exercises
  const primaryMuscle = (
    exercise.primaryMuscle ||
    exercise.muscle ||
    "other"
  ).toLowerCase();

  return {
    id: exId,
    name: exercise.name || exId,
    primaryMuscle,
    targetZone: exercise.targetAngle || "general",
    secondaryMuscles: [],
    movementPattern: "unspecified",
    functionalAction: "unspecified",
    jointMechanics: exercise.category || "compound",
    primaryRole: "custom",
    alternatives: [],
    rationaleEn: "Custom exercise without verified taxonomy.",
    rationaleAr: "تمرين مخصص يحتاج إلى مراجعة وتدقيق التصنيف التشريحي.",
    isVerified: false,
  };
};

/**
 * Calculates estimated workout session duration in minutes.
 * - Compounds: ~3.5 min/exercise (warmup/rest)
 * - Isolations: ~2.5 min/exercise
 */
export const estimateSessionDurationMinutes = (exercises) => {
  if (!Array.isArray(exercises) || exercises.length === 0) return 0;
  return exercises.reduce((acc, exOrId) => {
    const exId = typeof exOrId === "string" ? exOrId : exOrId.id;
    const tax = EXERCISE_TAXONOMY[exId];
    if (tax?.jointMechanics === "compound") return acc + 3.5;
    return acc + 2.5;
  }, 0);
};

/**
 * Detects duplicate or functionally redundant exercises within a single workout session.
 * E.g., two identical flat presses or multiple identical lateral raises.
 */
export const detectSessionRedundancies = (exerciseIds) => {
  const redundancies = [];
  const patternMap = new Map();

  exerciseIds.forEach((exId, index) => {
    const tax = EXERCISE_TAXONOMY[exId];
    if (!tax) return;

    // Movement pattern + targetZone signature
    const signature = `${tax.primaryMuscle}__${tax.targetZone}__${tax.movementPattern}`;

    if (patternMap.has(signature)) {
      const prev = patternMap.get(signature);
      redundancies.push({
        exerciseA: prev.id,
        exerciseB: exId,
        muscle: tax.primaryMuscle,
        movementPattern: tax.movementPattern,
        reasonEn: `Both exercises target "${tax.targetZone}" using the same "${tax.movementPattern}" pattern. One can be pruned or replaced with a complementary function.`,
        reasonAr: `التمرينان يستهدفان نفس المنطقة (${tax.targetZone}) بنفس نمط الحركة (${tax.movementPattern}). يمكن الاستغناء عن أحدهما أو استبداله بوظيفة تكميلية لسد فجوة حقيقية.`,
      });
    } else {
      patternMap.set(signature, { id: exId, index });
    }
  });

  return redundancies;
};

/**
 * Comprehensive coverage, volume, and gap analysis for a single workout or an entire weekly plan.
 *
 * @param {Object} options
 * @param {Array<string>} [options.exerciseIds] - list of exercise IDs for a single session
 * @param {Object} [options.programs] - dictionary of programs { [id]: { exercises: [] } }
 * @param {Object} [options.schedule] - weekly schedule { [day]: programId }
 * @param {Array} [options.catalog] - exercise catalog for metadata lookup
 * @param {number} [options.indirectWeight=0.5] - configurable weight for secondary muscle volume
 * @param {string} [options.userLevel='intermediate'] - 'beginner' | 'intermediate' | 'advanced'
 */
export const analyzeProgramCoverage = ({
  exerciseIds = null,
  programs = null,
  schedule = null,
  catalog = [],
  indirectWeight = DEFAULT_INDIRECT_WEIGHT,
  userLevel = "intermediate",
} = {}) => {
  // Build fast exercise lookup
  const catalogMap = new Map();
  catalog.forEach((e) => catalogMap.set(e.id, e));

  // Determine all exercises to evaluate (either single workout or all scheduled workouts)
  let sessionsToAnalyze = [];

  if (Array.isArray(exerciseIds)) {
    sessionsToAnalyze.push({ id: "single_session", name: "Session", exercises: exerciseIds });
  } else if (programs) {
    if (schedule) {
      // Evaluate actual scheduled days
      Object.entries(schedule).forEach(([dayIndex, progId]) => {
        if (progId && programs[progId]) {
          sessionsToAnalyze.push({
            id: `${progId}_day_${dayIndex}`,
            name: programs[progId].name || progId,
            dayIndex: Number(dayIndex),
            exercises: programs[progId].exercises || [],
          });
        }
      });
    } else {
      // Evaluate all program templates
      Object.entries(programs).forEach(([progId, prog]) => {
        sessionsToAnalyze.push({
          id: progId,
          name: prog.name || progId,
          exercises: prog.exercises || [],
        });
      });
    }
  }

  // Aggregation buckets
  const muscleStats = {
    chest: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
    back: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
    shoulders: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
    legs: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
    arms: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
    core: { directSets: 0, indirectSets: 0, exercises: [], zones: new Set(), patterns: new Set() },
  };

  const detectedRedundancies = [];
  const unverifiedExercises = [];
  let totalExercisesCount = 0;

  // Process each session
  sessionsToAnalyze.forEach((session) => {
    const sessionRedundancies = detectSessionRedundancies(session.exercises, catalogMap);
    if (sessionRedundancies.length > 0) {
      detectedRedundancies.push(...sessionRedundancies.map((r) => ({ ...r, sessionName: session.name })));
    }

    session.exercises.forEach((exId) => {
      totalExercisesCount++;
      const tax = EXERCISE_TAXONOMY[exId];
      const exObj = catalogMap.get(exId);
      const defaultSets = exObj?.default_sets || exObj?.defaultSets || 3;

      if (!tax) {
        unverifiedExercises.push(exId);
        return;
      }

      const primary = tax.primaryMuscle;
      if (muscleStats[primary]) {
        muscleStats[primary].directSets += defaultSets;
        muscleStats[primary].exercises.push({
          id: exId,
          name: exObj?.name || exId,
          nameAr: exObj?.nameAr || "",
          sets: defaultSets,
          zone: tax.targetZone,
          pattern: tax.movementPattern,
          role: tax.primaryRole,
          rationale: tax.rationaleAr || tax.rationaleEn,
        });
        muscleStats[primary].zones.add(tax.targetZone);
        muscleStats[primary].patterns.add(tax.movementPattern);
      }

      // Track secondary / indirect muscle contributions
      (tax.secondaryMuscles || []).forEach((sec) => {
        let mappedMuscle = null;
        if (sec.includes("delt") || sec === "upper_traps") mappedMuscle = "shoulders";
        else if (sec === "triceps" || sec.includes("tricep") || sec === "biceps" || sec.includes("bicep") || sec === "forearms" || sec === "brachialis") mappedMuscle = "arms";
        else if (sec === "chest" || sec.includes("chest")) mappedMuscle = "chest";
        else if (sec === "lats" || sec === "upper_back" || sec === "spinal_erectors" || sec === "rhomboids") mappedMuscle = "back";
        else if (sec === "glutes" || sec === "hamstrings" || sec === "calves" || sec === "adductors") mappedMuscle = "legs";
        else if (sec === "core") mappedMuscle = "core";

        if (mappedMuscle && muscleStats[mappedMuscle] && mappedMuscle !== primary) {
          muscleStats[mappedMuscle].indirectSets += defaultSets;
        }
      });
    });
  });

  // Calculate final effective sets per muscle
  const weeklyMuscleVolume = {};
  Object.entries(muscleStats).forEach(([muscle, stats]) => {
    const effectiveSets = stats.directSets + Math.round(stats.indirectSets * indirectWeight * 10) / 10;
    weeklyMuscleVolume[muscle] = {
      directSets: stats.directSets,
      indirectSets: stats.indirectSets,
      effectiveSets,
      indirectWeightApplied: indirectWeight,
    };
  });

  // ── AUDIT GAPS ACCORDING TO USER REQUIREMENTS (Section II & III) ──
  const gaps = [];

  // 1. CHEST AUDIT
  const chestZ = muscleStats.chest.zones;
  const chestP = muscleStats.chest.patterns;
  if (!chestZ.has("upper_chest") && !chestP.has("incline_press")) {
    gaps.push({
      muscle: "chest",
      zone: "upper_chest",
      severity: "high",
      issueEn: "Upper chest (clavicular head) lacks dedicated incline pressing.",
      issueAr: "الصدر العلوي يفتقر إلى تمرين ضغط مائل مخصص (Incline Press).",
      recommendation: "chest_db_incline_press",
    });
  }
  if (!chestZ.has("mid_chest") && !chestP.has("horizontal_press")) {
    gaps.push({
      muscle: "chest",
      zone: "mid_chest",
      severity: "high",
      issueEn: "Mid-chest horizontal pressing compound is missing.",
      issueAr: "تمرين الضغط الأفقي الأساسي للصدر الأوسط غير موجود.",
      recommendation: "chest_bb_flat_bench",
    });
  }
  if (!chestP.has("chest_adduction")) {
    gaps.push({
      muscle: "chest",
      zone: "horizontal_adduction",
      severity: "medium",
      issueEn: "Horizontal adduction fly pattern (cable or pec deck) is missing.",
      issueAr: "حركة تقريب الذراع أفقيًا (تفتيح كابل أو Pec Deck) غير مغطاة.",
      recommendation: "chest_pec_deck_fly",
    });
  }

  // 2. BACK AUDIT
  const backP = muscleStats.back.patterns;
  const backZ = muscleStats.back.zones;
  if (!backP.has("vertical_pull")) {
    gaps.push({
      muscle: "back",
      zone: "vertical_pull",
      severity: "high",
      issueEn: "Vertical pulling pattern (Lat Pulldown or Pull-ups) is missing.",
      issueAr: "نمط السحب الرأسي (Lat Pulldown أو Pull-ups) مفقود تمامًا من البرنامج.",
      recommendation: "back_wide_lat_pulldown",
    });
  }
  if (!backP.has("horizontal_row")) {
    gaps.push({
      muscle: "back",
      zone: "horizontal_row",
      severity: "high",
      issueEn: "Horizontal rowing pattern is missing.",
      issueAr: "نمط السحب الأفقي (Horizontal Row) مفقود.",
      recommendation: "back_bb_bent_over_row",
    });
  }
  if (!backZ.has("spinal_erectors") && !backP.has("back_extension")) {
    // Check if covered by deadlifts / RDL in legs
    const hasRdl = muscleStats.legs.zones.has("hamstring_hinge");
    if (!hasRdl) {
      gaps.push({
        muscle: "back",
        zone: "spinal_erectors",
        severity: "low",
        issueEn: "Spinal erectors posterior chain extension is not directly addressed.",
        issueAr: "باسطات العمود الفقري تفتقر إلى تمرين مباشر لتقوية الحزام الخلفي.",
        recommendation: "back_hyperextension",
      });
    }
  }

  // 3. SHOULDERS AUDIT
  const shZ = muscleStats.shoulders.zones;
  const shP = muscleStats.shoulders.patterns;
  if (!shZ.has("lateral_delt") && !shP.has("lateral_raise")) {
    gaps.push({
      muscle: "shoulders",
      zone: "lateral_delt",
      severity: "high",
      issueEn: "Lateral delts lack direct abduction work (overhead press alone is insufficient).",
      issueAr: "الرأس الجانبي للكتف يفتقر للتدريب المباشر (ضغط الكتف وحده لا يغني عن الرفرفة الجانبية).",
      recommendation: "sh_db_lateral_raise",
    });
  }
  if (!shZ.has("posterior_delt") && !shP.has("rear_delt_fly") && !backP.has("face_pull")) {
    gaps.push({
      muscle: "shoulders",
      zone: "posterior_delt",
      severity: "high",
      issueEn: "Rear deltoid is neglected without dedicated flyes or face pulls.",
      issueAr: "الرأس الخلفي للكتف مهمل بدون تمرين رفرفة خلفية أو Face Pulls.",
      recommendation: "sh_reverse_pec_deck",
    });
  }
  // Front delt volume check: If chest pressing is high (>9 direct sets), caution against excessive front delt isolation
  if (muscleStats.chest.directSets >= 9 && muscleStats.shoulders.directSets >= 9 && shZ.has("anterior_delt")) {
    gaps.push({
      muscle: "shoulders",
      zone: "anterior_delt_overkill",
      severity: "low",
      issueEn: "Heavy anterior delt direct volume detected alongside high chest pressing volume.",
      issueAr: "حمل مباشر كبير على الكتف الأمامي مع وجود حجم ضغط صدر مرتفع بالفعل.",
      recommendation: null,
    });
  }

  // 4. ARMS AUDIT
  const armZ = muscleStats.arms.zones;
  const armP = muscleStats.arms.patterns;
  // Rule 6: Triceps long head cannot rely on pushdowns alone!
  if (armP.has("elbow_extension_pushdown") && !armP.has("elbow_extension_overhead")) {
    gaps.push({
      muscle: "arms",
      zone: "tricep_long_head",
      severity: "high",
      issueEn: "Triceps long head is undertrained: pushdowns alone do not provide stretched overhead stimulus.",
      issueAr: "الرأس الطويل للترايسبس غير مغطى بالكامل: تمارين الدفع لأسفل وحدها لا تكفي بدون تمديد فوق الرأس.",
      recommendation: "arm_overhead_cable_ext",
    });
  }
  if (!armP.has("elbow_flexion_neutral") && !armZ.has("brachialis")) {
    gaps.push({
      muscle: "arms",
      zone: "brachialis",
      severity: "medium",
      issueEn: "Neutral grip elbow flexion (hammer curl for brachialis/brachioradialis) is missing.",
      issueAr: "ثني المرفق بالقبضة المحايدة (Hammer Curl للعضلة العضدية) غير ممثل.",
      recommendation: "arm_db_hammer_curl",
    });
  }

  // 5. LEGS AUDIT
  const legZ = muscleStats.legs.zones;
  const legP = muscleStats.legs.patterns;
  // Rule 5: Hip hinge and Knee curl must NOT be conflated as one!
  const hasHinge = legZ.has("hamstring_hinge") || legP.has("hip_hinge");
  const hasCurl = legZ.has("hamstring_curl") || legP.has("knee_flexion");
  if (!hasHinge) {
    gaps.push({
      muscle: "legs",
      zone: "hamstring_hinge",
      severity: "high",
      issueEn: "Hamstring hip hinge (e.g. Romanian Deadlift) is missing.",
      issueAr: "وظيفة مد الورك للخلفيات (Hip Hinge مثل RDL) مفقودة.",
      recommendation: "leg_bb_rdl",
    });
  }
  if (!hasCurl) {
    gaps.push({
      muscle: "legs",
      zone: "hamstring_curl",
      severity: "high",
      issueEn: "Hamstring knee flexion (Leg Curl) is missing; RDL alone does not fully train knee flexor fibers.",
      issueAr: "وظيفة ثني الركبة للخلفيات (Leg Curl) مفقودة؛ تمرين RDL وحده لا يكفي لوظيفة ثني الركبة.",
      recommendation: "leg_seated_curl",
    });
  }
  if (!legZ.has("calves") && !legP.has("calf_raise")) {
    gaps.push({
      muscle: "legs",
      zone: "calves",
      severity: "medium",
      issueEn: "Calves are missing from leg programming.",
      issueAr: "عضلات السمانة غير مدرجة في تدريب الأرجل.",
      recommendation: "leg_standing_calf_raise",
    });
  }

  // 6. CORE AUDIT
  const coreP = muscleStats.core.patterns;
  if (!coreP.has("anti_extension") && !coreP.has("lateral_stability") && !coreP.has("anti_rotation")) {
    gaps.push({
      muscle: "core",
      zone: "functional_core",
      severity: "medium",
      issueEn: "Core relies solely on flexion/crunches without anti-extension or rotational stability.",
      issueAr: "تدريب البطن يعتمد على الكرنش وحده ويفتقر إلى مقاومة المد (Anti-extension) أو الثبات الجانبي.",
      recommendation: "core_weighted_plank",
    });
  }

  // ── OVERLAP & CONFLICT AUDIT FOR SCHEDULES (Consecutive day interference) ──
  const scheduleConflicts = [];
  if (schedule && programs) {
    for (let i = 0; i < 6; i++) {
      const todayProgId = schedule[i];
      const tomorrowProgId = schedule[i + 1];
      if (todayProgId && tomorrowProgId && todayProgId !== "rest" && tomorrowProgId !== "rest") {
        const todayProg = programs[todayProgId];
        const tomorrowProg = programs[tomorrowProgId];
        if (todayProg && tomorrowProg) {
          // Check Chest -> Shoulders interference
          const todayHasChest = todayProg.muscles?.includes("Chest");
          const tomorrowHasShoulders = tomorrowProg.muscles?.includes("Shoulders");
          if (todayHasChest && tomorrowHasShoulders) {
            scheduleConflicts.push({
              days: [i, i + 1],
              programs: [todayProg.name, tomorrowProg.name],
              issueEn: "Chest day immediately followed by Shoulder day may cause anterior delt and triceps overuse.",
              issueAr: "يوم الصدر متبوع مباشرة بيوم الكتف قد يسبب إجهاداً مفرطاً للكتف الأمامي والترايسبس دون وقت استشفاء.",
            });
          }
          // Check Back -> Arms interference (biceps pre-exhaustion)
          const todayHasBack = todayProg.muscles?.includes("Back");
          const tomorrowHasArms = tomorrowProg.muscles?.includes("Arms");
          if (todayHasBack && tomorrowHasArms) {
            scheduleConflicts.push({
              days: [i, i + 1],
              programs: [todayProg.name, tomorrowProg.name],
              issueEn: "Back day followed immediately by Arm day limits bicep recovery and performance.",
              issueAr: "يوم الظهر متبوع مباشرة بيوم الذراع يقلل استشفاء وأداء البايسبس.",
            });
          }
        }
      }
    }
  }

  // Overall status
  let status = "complete";
  if (unverifiedExercises.length > 0) {
    status = "needs_data_review";
  } else if (gaps.some((g) => g.severity === "high")) {
    status = "partial";
  }

  return {
    status, // "complete" | "partial" | "needs_data_review"
    statusAr:
      status === "complete"
        ? "مكتمل وفق معايير البرنامج"
        : status === "partial"
        ? "تغطية جزئية"
        : "يحتاج إلى مراجعة البيانات",
    userLevel,
    totalExercisesCount,
    muscleStats: Object.fromEntries(
      Object.entries(muscleStats).map(([m, s]) => [
        m,
        {
          ...s,
          zones: Array.from(s.zones),
          patterns: Array.from(s.patterns),
        },
      ])
    ),
    weeklyMuscleVolume,
    gaps,
    detectedRedundancies,
    scheduleConflicts,
    unverifiedExercises,
  };
};

/**
 * Intelligent Exercise Selector that respects user equipment, experience,
 * target functional zones, and eliminates duplicate movements.
 */
export const selectOptimalExercise = ({
  muscle,
  targetZone,
  movementPattern = null,
  availableEquipment = null, // array of equipment strings e.g. ['dumbbell', 'barbell']
  currentProgramExercises = [],
  catalog = [],
} = {}) => {
  const currentSet = new Set(currentProgramExercises);

  // Candidates from EXERCISE_TAXONOMY
  const candidates = Object.entries(EXERCISE_TAXONOMY)
    .filter(([id, tax]) => {
      if (currentSet.has(id)) return false;
      if (muscle && tax.primaryMuscle !== muscle.toLowerCase()) return false;
      if (targetZone && tax.targetZone !== targetZone) return false;
      if (movementPattern && tax.movementPattern !== movementPattern) return false;
      return true;
    })
    .map(([id, tax]) => {
      const dbEx = catalog.find((e) => e.id === id);
      return { id, ...tax, equipment: dbEx?.equipment || "unknown", name: dbEx?.name || id };
    });

  // Filter by equipment if provided
  let filtered = candidates;
  if (Array.isArray(availableEquipment) && availableEquipment.length > 0) {
    filtered = candidates.filter((c) => availableEquipment.includes(c.equipment));
  }

  if (filtered.length === 0 && candidates.length > 0) {
    // If strict equipment matched nothing, fall back to best candidate
    filtered = candidates;
  }

  if (filtered.length === 0) return null;

  // Prioritize primary compounds first
  filtered.sort((a, b) => {
    if (a.primaryRole === "primary_compound" && b.primaryRole !== "primary_compound") return -1;
    if (b.primaryRole === "primary_compound" && a.primaryRole !== "primary_compound") return 1;
    return 0;
  });

  return filtered[0];
};

/**
 * Provides equivalent substitutes for an exercise when equipment or machinery is unavailable,
 * guaranteeing target zone and movement pattern retention.
 */
export const getSmartSubstitutes = (exerciseId, catalog = []) => {
  const tax = EXERCISE_TAXONOMY[exerciseId];
  if (!tax) return [];

  const alternatives = tax.alternatives || [];
  const results = [];

  alternatives.forEach((altId) => {
    const altTax = EXERCISE_TAXONOMY[altId];
    const dbEx = catalog.find((e) => e.id === altId);
    if (altTax) {
      results.push({
        id: altId,
        name: dbEx?.name || altId,
        nameAr: dbEx?.nameAr || "",
        equipment: dbEx?.equipment || "dumbbell",
        targetZone: altTax.targetZone,
        movementPattern: altTax.movementPattern,
        rationale: altTax.rationaleAr || altTax.rationaleEn,
      });
    }
  });

  return results;
};
