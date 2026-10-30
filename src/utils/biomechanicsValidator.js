/**
 * Biomechanics Validator Engine
 * Audits daily workout routines to guarantee zero neglected muscle angles
 * per training split and provides intelligent biomechanical exercise recommendations.
 */

import { exercisesDatabase, angleLabels } from "../data/exercises";

/**
 * Required biomechanical target angles per training day / split
 */
export const DAILY_ANGLE_REQUIREMENTS = {
  // ── Push / Chest Day ──
  chest_day: {
    id: "chest_day",
    name: "Chest Day",
    nameAr: "يوم الصدر",
    muscles: ["chest"],
    requiredAngles: [
      {
        id: "upper_chest",
        label: "Upper Chest (Clavicular Head)",
        labelAr: "صدر علوي (ألياف الترقوة)",
        suggestedExerciseId: "chest_db_incline_press",
        rationale: "Required for complete clavicular pectoralis hypertrophy and shoulder line aesthetics.",
      },
      {
        id: "mid_chest",
        label: "Mid Chest (Sternal Head)",
        labelAr: "صدر أوسط (الألياف القصية)",
        suggestedExerciseId: "chest_bb_flat_bench",
        rationale: "Primary mass-builder targeting the bulk of the sternocostal head.",
      },
      {
        id: "lower_chest",
        label: "Lower Chest (Costal Head)",
        labelAr: "صدر سفلي (الألياف الضلعية)",
        suggestedExerciseId: "chest_high_to_low_cable_fly",
        rationale: "High-to-low convergence aligns with costal fiber direction.",
      },
      {
        id: "inner_chest",
        label: "Inner Chest (Adduction Squeeze)",
        labelAr: "صدر داخلي (عصر التقريب)",
        suggestedExerciseId: "chest_pec_deck_fly",
        rationale: "Maximizes peak active tension at full transverse shoulder adduction.",
      },
    ],
  },

  push_day: {
    id: "push_day",
    name: "Push Day",
    nameAr: "يوم الدفع",
    muscles: ["chest", "shoulders", "arms"],
    requiredAngles: [
      {
        id: "upper_chest",
        label: "Upper Chest (Clavicular Head)",
        labelAr: "صدر علوي",
        suggestedExerciseId: "chest_db_incline_press",
        rationale: "Incline pressing angle triggers upper pectoral motor units.",
      },
      {
        id: "mid_chest",
        label: "Mid Chest (Sternal Head)",
        labelAr: "صدر أوسط",
        suggestedExerciseId: "chest_bb_flat_bench",
        rationale: "Fundamental horizontal pushing motor pattern.",
      },
      {
        id: "lower_chest",
        label: "Lower Chest (Costal / Dips)",
        labelAr: "صدر سفلي / غطس",
        suggestedExerciseId: "chest_dips",
        rationale: "Declined angle targets inferior pectoralis insertion.",
      },
      {
        id: "inner_chest",
        label: "Inner Chest (Adduction Squeeze)",
        labelAr: "عصر الصدر الداخلي",
        suggestedExerciseId: "chest_pec_deck_fly",
        rationale: "Isolates horizontal adduction without tricep dominance.",
      },
      {
        id: "anterior_delt",
        label: "Front Delts (Overhead Press)",
        labelAr: "كتف أمامي",
        suggestedExerciseId: "sh_standing_bb_ohp",
        rationale: "Vertical overhead push for anterior deltoid strength.",
      },
      {
        id: "lateral_delt",
        label: "Lateral Delts (Side Abduction)",
        labelAr: "كتف جانبي",
        suggestedExerciseId: "sh_db_lateral_raise",
        rationale: "Coronal plane abduction for shoulder width.",
      },
      {
        id: "tricep_lateral_medial",
        label: "Triceps Lateral / Medial Head",
        labelAr: "ترايسبس جانبي/أوسط",
        suggestedExerciseId: "arm_rope_pushdown",
        rationale: "Elbow extension with pronation lockout.",
      },
      {
        id: "tricep_long_head",
        label: "Triceps Long Head (Overhead)",
        labelAr: "ترايسبس رأس طويل",
        suggestedExerciseId: "arm_overhead_cable_ext",
        rationale: "Places the triceps long head on maximum eccentric stretch.",
      },
    ],
  },

  // ── Pull / Back Day ──
  back_day: {
    id: "back_day",
    name: "Back Day",
    nameAr: "يوم الظهر",
    muscles: ["back"],
    requiredAngles: [
      {
        id: "vertical_pull",
        label: "Vertical Pull (Upper Lat Width)",
        labelAr: "سحب عمودي (عرض المجنص العلوي)",
        suggestedExerciseId: "back_wide_lat_pulldown",
        rationale: "Direct coronal plane pull for latissimus dorsi width.",
      },
      {
        id: "horizontal_row",
        label: "Horizontal Row (Mid-Back / Rhomboids)",
        labelAr: "سحب أفقي (وسط الظهر والماسي)",
        suggestedExerciseId: "back_bb_bent_over_row",
        rationale: "Scapular retraction builder for back thickness.",
      },
      {
        id: "unilateral_row",
        label: "Unilateral Row (Lower Lats)",
        labelAr: "سحب أحادي (أسفل المجنص)",
        suggestedExerciseId: "back_db_single_arm_row",
        rationale: "Tight elbow track targeting iliocostal lower lat fibers.",
      },
      {
        id: "lat_isolation",
        label: "Lat Isolation (Sweeping Arc Stretch)",
        labelAr: "عزل المجنص (استطالة دورانية)",
        suggestedExerciseId: "back_straight_arm_pulldown",
        rationale: "Pure shoulder extension without biceps involvement.",
      },
      {
        id: "upper_back_rear_delt",
        label: "Upper Back / Rear Delt",
        labelAr: "أعلى الظهر / كتف خلفي",
        suggestedExerciseId: "back_face_pulls",
        rationale: "Horizontal abduction and external rotation for postural balance.",
      },
    ],
  },

  pull_day: {
    id: "pull_day",
    name: "Pull Day",
    nameAr: "يوم السحب",
    muscles: ["back", "arms", "shoulders"],
    requiredAngles: [
      {
        id: "vertical_pull",
        label: "Vertical Pull (Upper Lats)",
        labelAr: "سحب عمودي",
        suggestedExerciseId: "back_wide_lat_pulldown",
        rationale: "Vertical pulling motion for lat spread.",
      },
      {
        id: "horizontal_row",
        label: "Horizontal Row (Mid Back)",
        labelAr: "سحب أفقي",
        suggestedExerciseId: "back_seated_cable_row",
        rationale: "Horizontal rowing motion for mid-back density.",
      },
      {
        id: "unilateral_row",
        label: "Unilateral Row (Lower Lats)",
        labelAr: "سحب أحادي",
        suggestedExerciseId: "back_db_single_arm_row",
        rationale: "Single-arm row maximizing lower lat engagement.",
      },
      {
        id: "lat_isolation",
        label: "Lat Isolation (Straight-Arm Pulldown)",
        labelAr: "عزل المجنص",
        suggestedExerciseId: "back_straight_arm_pulldown",
        rationale: "Isolates the lats at peak contraction.",
      },
      {
        id: "upper_back_rear_delt",
        label: "Upper Back & Rear Delts",
        labelAr: "أعلى الظهر والكتف الخلفي",
        suggestedExerciseId: "back_face_pulls",
        rationale: "Rear delt and rhomboid strengthening.",
      },
      {
        id: "bicep_long_head",
        label: "Biceps Long Head (Peak)",
        labelAr: "بايسبس - رأس طويل",
        suggestedExerciseId: "arm_db_incline_curl",
        rationale: "Shoulder extension positioning isolates long head peak.",
      },
      {
        id: "brachialis",
        label: "Brachialis (Arm Thickness)",
        labelAr: "عضلة عضدية",
        suggestedExerciseId: "arm_db_hammer_curl",
        rationale: "Neutral grip curl for lateral upper arm thickness.",
      },
    ],
  },

  // ── Shoulder Day ──
  shoulder_day: {
    id: "shoulder_day",
    name: "Shoulder Day",
    nameAr: "يوم الأكتاف",
    muscles: ["shoulders"],
    requiredAngles: [
      {
        id: "anterior_delt",
        label: "Anterior Delt (Front Head)",
        labelAr: "كتف أمامي",
        suggestedExerciseId: "sh_standing_bb_ohp",
        rationale: "Vertical overhead pressing pattern.",
      },
      {
        id: "lateral_delt",
        label: "Lateral Delt (Side Head)",
        labelAr: "كتف جانبي",
        suggestedExerciseId: "sh_db_lateral_raise",
        rationale: "Scapular plane lateral raise for maximum 3D shoulder width.",
      },
      {
        id: "posterior_delt",
        label: "Posterior Delt (Rear Head)",
        labelAr: "كتف خلفي",
        suggestedExerciseId: "sh_reverse_pec_deck",
        rationale: "Transverse abduction for 3D shoulder roundness and posture.",
      },
      {
        id: "upper_traps",
        label: "Upper Trapezius",
        labelAr: "ترابيز علوي",
        suggestedExerciseId: "sh_db_shrugs",
        rationale: "Direct scapular elevation against gravity.",
      },
    ],
  },

  // ── Leg Day ──
  leg_day: {
    id: "leg_day",
    name: "Leg Day",
    nameAr: "يوم الأرجل",
    muscles: ["legs"],
    requiredAngles: [
      {
        id: "quad_compound",
        label: "Quad Compound (Squat / Press)",
        labelAr: "رباعية مركب (سكوات / مكبس)",
        suggestedExerciseId: "leg_bb_back_squat",
        rationale: "Multi-joint knee and hip extension mass-builder.",
      },
      {
        id: "quad_isolation",
        label: "Quad Isolation (Leg Extension)",
        labelAr: "عزل رباعية (رفرفة أمامي)",
        suggestedExerciseId: "leg_extension",
        rationale: "Isolates rectus femoris at shortened quadriceps position.",
      },
      {
        id: "hamstring_hinge",
        label: "Hamstring Hinge (RDL / Deadlift)",
        labelAr: "خلفيات - مفصلي (ديدليفت روماني)",
        suggestedExerciseId: "leg_bb_rdl",
        rationale: "Loaded hip hinge placing hamstrings under deep eccentric stretch.",
      },
      {
        id: "hamstring_curl",
        label: "Hamstring Curl (Knee Flexion)",
        labelAr: "خلفيات - كيرل (ثني الركبة)",
        suggestedExerciseId: "leg_seated_curl",
        rationale: "Direct knee flexion targeting all 3 hamstring heads.",
      },
      {
        id: "calves",
        label: "Calves (Gastrocnemius / Soleus)",
        labelAr: "سمانة",
        suggestedExerciseId: "leg_standing_calf_raise",
        rationale: "Full plantarflexion through deep dorsiflexion stretch.",
      },
    ],
  },

  // ── Arm Day ──
  arm_day: {
    id: "arm_day",
    name: "Arm Day",
    nameAr: "يوم الذراعين",
    muscles: ["arms"],
    requiredAngles: [
      {
        id: "bicep_long_head",
        label: "Biceps Long Head (Peak / Incline)",
        labelAr: "بايسبس - رأس طويل",
        suggestedExerciseId: "arm_db_incline_curl",
        rationale: "Eccentric shoulder extension for maximum peak recruitment.",
      },
      {
        id: "bicep_short_head",
        label: "Biceps Short Head (Inner Thickness)",
        labelAr: "بايسبس - رأس قصير",
        suggestedExerciseId: "arm_preacher_curl",
        rationale: "Shoulder flexion position emphasizing short head tension.",
      },
      {
        id: "brachialis",
        label: "Brachialis (Hammer Grip)",
        labelAr: "عضلة عضدية (قبضة محايدة)",
        suggestedExerciseId: "arm_db_hammer_curl",
        rationale: "Neutral grip elbow flexion pushing bicep upward for arm thickness.",
      },
      {
        id: "tricep_long_head",
        label: "Triceps Long Head (Overhead / Skull Crushers)",
        labelAr: "ترايسبس - رأس طويل (فوق الرأس)",
        suggestedExerciseId: "arm_ez_skull_crushers",
        rationale: "Long head requires shoulder elevation for full stretch.",
      },
      {
        id: "tricep_lateral_medial",
        label: "Triceps Lateral / Medial Head (Pushdown)",
        labelAr: "ترايسبس - رأس جانبي / أوسط",
        suggestedExerciseId: "arm_rope_pushdown",
        rationale: "Elbow extension for the visible horseshoe lateral head.",
      },
    ],
  },

  // ── Upper Body Day (for PPL + Upper Split) ──
  upper_day: {
    id: "upper_day",
    name: "Upper Body Day",
    nameAr: "يوم الجزء العلوي",
    muscles: ["chest", "back", "shoulders", "arms"],
    requiredAngles: [
      {
        id: "upper_chest",
        label: "Upper Chest",
        labelAr: "صدر علوي",
        suggestedExerciseId: "chest_machine_incline_press",
        rationale: "Clavicular head development.",
      },
      {
        id: "inner_chest",
        label: "Chest Adduction",
        labelAr: "صدر داخلي / تقريب",
        suggestedExerciseId: "chest_pec_deck_fly",
        rationale: "Horizontal adduction squeeze.",
      },
      {
        id: "horizontal_row",
        label: "Mid-Back Row",
        labelAr: "سحب أفقي للظهر",
        suggestedExerciseId: "back_seated_cable_row",
        rationale: "Scapular retractors and mid-traps.",
      },
      {
        id: "posterior_delt",
        label: "Rear Deltoid",
        labelAr: "كتف خلفي",
        suggestedExerciseId: "sh_reverse_pec_deck",
        rationale: "Rear delt posture balancer.",
      },
      {
        id: "upper_traps",
        label: "Upper Trapezius",
        labelAr: "ترابيز",
        suggestedExerciseId: "sh_db_shrugs",
        rationale: "Scapular elevation.",
      },
      {
        id: "bicep_short_head",
        label: "Bicep Preacher",
        labelAr: "بايسبس",
        suggestedExerciseId: "arm_preacher_curl",
        rationale: "Short head bicep curl.",
      },
      {
        id: "tricep_long_head",
        label: "Tricep Extension",
        labelAr: "ترايسبس",
        suggestedExerciseId: "arm_ez_skull_crushers",
        rationale: "Overhead elbow extension.",
      },
    ],
  },
};

/**
 * Intelligent Day Type Detector
 * Determines the training day rules based on program ID, name, or exercises
 */
export function detectDayType(programContext, exercisesList = []) {
  let contextStr = "";
  let list = [];

  if (Array.isArray(programContext)) {
    list = programContext;
    if (typeof exercisesList === "string") contextStr = exercisesList;
  } else {
    if (typeof programContext === "string") contextStr = programContext;
    else if (programContext?.id) contextStr = programContext.id;
    else if (programContext?.programName) contextStr = programContext.programName;

    if (Array.isArray(exercisesList)) list = exercisesList;
  }

  if (contextStr) {
    const key = contextStr.toLowerCase();
    if (DAILY_ANGLE_REQUIREMENTS[key]) return key;
    if (key.includes("chest") && !key.includes("back")) return "chest_day";
    if (key.includes("push")) return "push_day";
    if (key.includes("back") && !key.includes("chest")) return "back_day";
    if (key.includes("pull")) return "pull_day";
    if (key.includes("shoulder")) return "shoulder_day";
    if (key.includes("leg")) return "leg_day";
    if (key.includes("arm")) return "arm_day";
    if (key.includes("upper")) return "upper_day";
  }

  // Deduce from exercise target muscles
  const muscleFrequency = {};
  list.forEach((ex) => {
    if (!ex) return;
    const m = (ex.primaryMuscle || ex.muscle || "").toLowerCase();
    if (m) muscleFrequency[m] = (muscleFrequency[m] || 0) + 1;
  });

  const dominant = Object.entries(muscleFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (dominant === "chest") return "chest_day";
  if (dominant === "back") return "back_day";
  if (dominant === "shoulders") return "shoulder_day";
  if (dominant === "legs") return "leg_day";
  if (dominant === "arms") return "arm_day";

  return "push_day"; // Fallback standard
}

/**
 * Main Daily Biomechanical Audit Engine
 * @param {Array} routineExercises Array of exercise objects or IDs in the routine
 * @param {string|object} programContext Program ID or active workout object
 * @returns {object} Biomechanical audit result
 */
export function auditRoutineAngles(routineExercises = [], programContext = "") {
  const dayKey = detectDayType(programContext, routineExercises);
  const rule = DAILY_ANGLE_REQUIREMENTS[dayKey] || DAILY_ANGLE_REQUIREMENTS.push_day;

  // Resolve exercises into full objects
  const fullExercises = (routineExercises || [])
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") {
        return exercisesDatabase.find((e) => e.id === item) || { id: item };
      }
      if (item && item.exerciseId && !item.targetAngle) {
        const dbEx = exercisesDatabase.find((e) => e.id === item.exerciseId);
        return { ...dbEx, ...item };
      }
      return item;
    })
    .filter(Boolean);

  // Collect present angles in the routine
  const presentAngleSet = new Set();
  const coveredAngleDetails = [];

  fullExercises.forEach((ex) => {
    if (ex && ex.targetAngle) {
      presentAngleSet.add(ex.targetAngle);
      coveredAngleDetails.push({
        angleId: ex.targetAngle,
        label: angleLabels[ex.targetAngle]?.en || ex.targetAngle,
        labelAr: angleLabels[ex.targetAngle]?.ar || "",
        exerciseId: ex.id || ex.exerciseId,
        exerciseName: ex.name,
      });
    }
  });

  // Evaluate against required angles
  const required = rule.requiredAngles;
  const missingAngles = [];
  const coveredAngles = [];

  required.forEach((req) => {
    if (presentAngleSet.has(req.id)) {
      coveredAngles.push(req);
    } else {
      // Find optimal suggested exercise from catalog
      const suggestionObj =
        exercisesDatabase.find((e) => e.id === req.suggestedExerciseId) ||
        exercisesDatabase.find((e) => e.targetAngle === req.id) ||
        null;

      missingAngles.push({
        id: req.id,
        label: req.label,
        labelAr: req.labelAr,
        rationale: req.rationale,
        suggestedExercise: suggestionObj,
      });
    }
  });

  const totalRequired = required.length;
  const coveredCount = coveredAngles.length;
  const coveragePercent = Math.round((coveredCount / Math.max(1, totalRequired)) * 100);
  const isComplete = missingAngles.length === 0;

  return {
    dayType: dayKey,
    dayTitle: rule.name,
    dayTitleAr: rule.nameAr,
    totalRequired,
    coveredCount,
    coveragePercent,
    isComplete,
    coveredAngles,
    missingAngles,
    coveredAngleDetails,
    summaryText: isComplete
      ? "Optimal Biomechanical Coverage (100%)"
      : `Missing ${missingAngles.length} critical angle${missingAngles.length > 1 ? "s" : ""}`,
  };
}

/**
 * Get candidate alternative exercises for a specific angle
 */
export function getCandidatesForAngle(targetAngle, currentExerciseId = null) {
  return exercisesDatabase.filter((e) => {
    if (currentExerciseId && e.id === currentExerciseId) return false;
    return e.targetAngle === targetAngle;
  });
}
