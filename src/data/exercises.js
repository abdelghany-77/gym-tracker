// ════════════════════════════════════════════════════════════════════════════════
// EXERCISE DATABASE — Biomechanically Complete, Angle-Categorized
// ════════════════════════════════════════════════════════════════════════════════
//
// Every exercise has:
//   id            — unique key (NEVER renamed, preserves gym_history / gym_prs)
//   name          — English display name
//   nameAr        — Arabic display name
//   muscle        — legacy muscle group label (Chest/Back/Shoulders/Arms/Legs/Core)
//   category      — movement pattern: compound | isolation | stretch | machine
//   primaryMuscle — canonical lowercase key: chest | back | shoulders | arms | legs | core
//   targetAngle   — biomechanical angle tag for swap-engine matching
//   image, tips, video, default_sets, default_reps — unchanged from original
//
// TARGET ANGLE REFERENCE:
//   Back:      vertical_pull | horizontal_row | unilateral_row | lat_isolation | upper_back_rear_delt | lower_back_posterior
//   Chest:     upper_chest | mid_chest | lower_chest | inner_chest | machine_compound
//   Shoulders: anterior_delt | lateral_delt | posterior_delt | upper_traps
//   Legs:      quad_compound | quad_isolation | hamstring_hinge | hamstring_curl | calves | core_abs
//   Arms:      bicep_long_head | bicep_short_head | brachialis | tricep_long_head | tricep_lateral_medial
//   Core:      core_abs (also used in legs context)
// ════════════════════════════════════════════════════════════════════════════════

// Human-readable labels for target angles (EN + AR)
export const angleLabels = {
  // Back
  vertical_pull:        { en: "Vertical Pull",           ar: "سحب عمودي" },
  horizontal_row:       { en: "Horizontal Row",          ar: "سحب أفقي" },
  unilateral_row:       { en: "Unilateral Row",          ar: "سحب أحادي" },
  lat_isolation:        { en: "Lat Isolation",            ar: "عزل المجنص" },
  upper_back_rear_delt: { en: "Upper Back / Rear Delt",  ar: "أعلى الظهر / كتف خلفي" },
  lower_back_posterior: { en: "Lower Back",              ar: "أسفل الظهر" },
  // Chest
  upper_chest:          { en: "Upper Chest",              ar: "صدر علوي" },
  mid_chest:            { en: "Mid Chest",                ar: "صدر أوسط" },
  lower_chest:          { en: "Lower Chest",              ar: "صدر سفلي" },
  inner_chest:          { en: "Inner Chest",              ar: "صدر داخلي" },
  machine_compound:     { en: "Machine Compound",         ar: "ضغط آلي مركب" },
  // Shoulders
  anterior_delt:        { en: "Front Delt",               ar: "كتف أمامي" },
  lateral_delt:         { en: "Lateral Delt",             ar: "كتف جانبي" },
  posterior_delt:       { en: "Rear Delt",                ar: "كتف خلفي" },
  upper_traps:          { en: "Upper Traps",              ar: "ترابيز علوي" },
  // Legs
  quad_compound:        { en: "Quad Compound",            ar: "رباعية مركب" },
  quad_isolation:       { en: "Quad Isolation",           ar: "عزل رباعية" },
  hamstring_hinge:      { en: "Hamstring Hinge",          ar: "خلفيات - مفصلي" },
  hamstring_curl:       { en: "Hamstring Curl",           ar: "خلفيات - كيرل" },
  calves:               { en: "Calves",                   ar: "سمانة" },
  // Arms
  bicep_long_head:      { en: "Bicep Long Head",          ar: "بايسبس - رأس طويل" },
  bicep_short_head:     { en: "Bicep Short Head",         ar: "بايسبس - رأس قصير" },
  brachialis:           { en: "Brachialis",               ar: "عضلة عضدية" },
  tricep_long_head:     { en: "Tricep Long Head",         ar: "ترايسبس - رأس طويل" },
  tricep_lateral_medial:{ en: "Tricep Lateral/Medial",    ar: "ترايسبس - جانبي" },
  // Core
  core_abs:             { en: "Core & Abs",               ar: "بطن و Core" },
};

const exercises = [
  // ══════════════════════════════════════════════════════════════════════
  // CHEST (الصدر) — 5 Essential Angles
  // ══════════════════════════════════════════════════════════════════════

  // ── Upper Chest (Clavicular Head) ──
  {
    id: "chest_incline_db",
    name: "Incline Dumbbell Press",
    nameAr: "ضغط دمبل عالي/مائل",
    muscle: "Chest",
    category: "compound",
    primaryMuscle: "chest",
    targetAngle: "upper_chest",
    image: "/chest/chest2.png",
    tips: "Bench at 30-45 degrees. Press up and slightly in.",
    video: "https://www.youtube.com/results?search_query=incline+dumbbell+press+form",
    default_sets: 3,
    default_reps: 10,
  },

  // ── Mid Chest (Sternal Head Power) ──
  {
    id: "chest_barbell_bench",
    name: "Barbell Bench Press",
    nameAr: "ضغط بنش بالبار مستوي",
    muscle: "Chest",
    category: "compound",
    primaryMuscle: "chest",
    targetAngle: "mid_chest",
    image: "/chest/chest1.png",
    tips: "Grip slightly wider than shoulder width. Lower bar to mid-chest. Elbows at 45 degrees.",
    video: "https://www.youtube.com/results?search_query=barbell+bench+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "chest_flat_db_fly",
    name: "Flat Dumbbell Fly",
    nameAr: "تفتيح دمبل مستوي",
    muscle: "Chest",
    category: "isolation",
    primaryMuscle: "chest",
    targetAngle: "mid_chest",
    image: "/chest/chest5.png",
    tips: "Deep stretch at the bottom. Imagine hugging a tree.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_pushup",
    name: "Push-ups",
    nameAr: "ضغط أرضي",
    muscle: "Chest",
    category: "compound",
    primaryMuscle: "chest",
    targetAngle: "mid_chest",
    image: "/new/chest_pushup.png",
    tips: "Keep core tight. Lower until chest nearly touches the floor.",
    video: "https://www.youtube.com/results?search_query=proper+pushup+form",
    default_sets: 3,
    default_reps: 15,
  },

  // ── Lower Chest (Costal Head / Outline) ──
  {
    id: "chest_cable_fly",
    name: "High-to-Low Cable Fly",
    nameAr: "تجميع كابل عالي-منخفض",
    muscle: "Chest",
    category: "isolation",
    primaryMuscle: "chest",
    targetAngle: "lower_chest",
    image: "/chest/chest3.png",
    tips: "Focus on the squeeze at the bottom. Keep a slight bend in elbows.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_dips",
    name: "Dips (Chest Version)",
    nameAr: "الغطس - نسخة الصدر",
    muscle: "Chest",
    category: "compound",
    primaryMuscle: "chest",
    targetAngle: "lower_chest",
    image: "/chest/chest6.png",
    tips: "Lean forward to target chest. Go deep.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "chest_decline_bench",
    name: "Decline Barbell Bench",
    nameAr: "ضغط بنش مائل سفلي",
    muscle: "Chest",
    category: "compound",
    primaryMuscle: "chest",
    targetAngle: "lower_chest",
    image: "/new/chest_decline_bench.png",
    tips: "Secure legs tightly. Targets the lower chest fibers.",
    video: "https://www.youtube.com/results?search_query=decline+bench+press+form",
    default_sets: 3,
    default_reps: 10,
  },

  // ── Inner Chest (Sternal Adduction / Squeeze) ──
  {
    id: "chest_pec_deck",
    name: "Pec Deck Fly",
    nameAr: "جهاز الفراشة للصدر",
    muscle: "Chest",
    category: "machine",
    primaryMuscle: "chest",
    targetAngle: "inner_chest",
    image: "/chest/chest4.png",
    tips: "Keep elbows high. Squeeze chest hard at the peak.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_low_to_high_fly",
    name: "Low-to-High Cable Fly",
    nameAr: "تجميع كابل منخفض-عالي",
    muscle: "Chest",
    category: "isolation",
    primaryMuscle: "chest",
    targetAngle: "inner_chest",
    image: "/chest/chest3.png",
    tips: "Start from low pulleys, sweep upward crossing midline. Squeeze inner chest at the top.",
    video: "https://www.youtube.com/results?search_query=low+to+high+cable+fly+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_svend_press",
    name: "Svend Press",
    nameAr: "سفيند بريس",
    muscle: "Chest",
    category: "isolation",
    primaryMuscle: "chest",
    targetAngle: "inner_chest",
    image: "/new/chest_svend_press.png",
    tips: "Squeeze plates together hard. Excellent for inner chest activation.",
    video: "https://www.youtube.com/results?search_query=svend+press+form",
    default_sets: 3,
    default_reps: 15,
  },

  // ── Machine Compound (Mechanical Drop) ──
  {
    id: "chest_machine_press",
    name: "Machine Chest Press",
    nameAr: "ضغط صدر على الجهاز",
    muscle: "Chest",
    category: "machine",
    primaryMuscle: "chest",
    targetAngle: "machine_compound",
    image: "/new/chest_machine_press.png",
    tips: "Keep back flat against the pad. Press until arms are fully extended.",
    video: "https://www.youtube.com/results?search_query=machine+chest+press+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_incline_machine_press",
    name: "Incline Machine Press",
    nameAr: "ضغط صدر عالي على الجهاز",
    muscle: "Chest",
    category: "machine",
    primaryMuscle: "chest",
    targetAngle: "machine_compound",
    image: "/new/chest_machine_press.png",
    tips: "Adjust seat so handles are at upper-chest level. Press and squeeze at the top.",
    video: "https://www.youtube.com/results?search_query=incline+machine+press+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ══════════════════════════════════════════════════════════════════════
  // BACK (الظهر) — 6 Essential Angles
  // ══════════════════════════════════════════════════════════════════════

  // ── Vertical Pull (Width / Upper Lats) ──
  {
    id: "back_lat_pulldown",
    name: "Wide Grip Lat Pulldown",
    nameAr: "سحب عالي للظهر",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "vertical_pull",
    image: "/back/back1.png",
    tips: "Pull to upper chest. Squeeze lats.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_pullups",
    name: "Pull Ups",
    nameAr: "عقلة",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "vertical_pull",
    image: "/back/back4.png",
    tips: "Full range of motion. Chest to bar if possible.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "back_neutral_grip_pulldown",
    name: "Neutral-Grip Lat Pulldown",
    nameAr: "سحب عالي قبضة متوازية",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "vertical_pull",
    image: "/back/back1.png",
    tips: "Use V-handle or neutral grip attachment. Pull to chest, elbows close to body for lower lat focus.",
    video: "https://www.youtube.com/results?search_query=neutral+grip+lat+pulldown+form",
    default_sets: 3,
    default_reps: 10,
  },

  // ── Horizontal Row (Mid-Back / Rhomboids Thickness) ──
  {
    id: "back_bent_row",
    name: "Bent Over Barbell Row",
    nameAr: "سحب بالبار مائل",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "horizontal_row",
    image: "/back/back2.png",
    tips: "Keep back flat. Pull to waist.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_cable_row",
    name: "Seated Cable Row",
    nameAr: "سحب أرضي قبضة ضيقة",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "horizontal_row",
    image: "/back/back3.png",
    tips: "Keep torso upright. Pull handle to stomach.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "back_t_bar_row",
    name: "T-Bar Row",
    nameAr: "تي بار رو",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "horizontal_row",
    image: "/new/back_t_bar_row.png",
    tips: "Use a V-grip handle. Keep lower back straight and pull towards your stomach.",
    video: "https://www.youtube.com/results?search_query=t-bar+row+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_reverse_bb_row",
    name: "Reverse Grip Row / Variation",
    nameAr: "سحب قبضة عكسية",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "horizontal_row",
    image: "/back/back8.png",
    tips: "Underhand grip to target lower lats.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Unilateral Row (Lower Lats Focus) ──
  {
    id: "back_single_db_row",
    name: "Single Arm Dumbbell Row",
    nameAr: "منشار بالدمبل للظهر",
    muscle: "Back",
    category: "compound",
    primaryMuscle: "back",
    targetAngle: "unilateral_row",
    image: "/back/back5.png",
    tips: "Support on bench. Pull dumbbell to hip.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Lat Isolation (Direct Stretch & Sweeping Arc) ──
  {
    id: "back_straight_arm_pulldown",
    name: "Straight Arm Pulldown",
    nameAr: "سحب بالذراع مفرود للمجنص",
    muscle: "Back",
    category: "isolation",
    primaryMuscle: "back",
    targetAngle: "lat_isolation",
    image: "/new/back_straight_arm_pulldown.png",
    tips: "Keep arms straight with a slight bend. Push down using your lats.",
    video: "https://www.youtube.com/results?search_query=straight+arm+pulldown+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "back_db_pullover",
    name: "Dumbbell Pullover",
    nameAr: "بلوفر بالدمبل",
    muscle: "Back",
    category: "stretch",
    primaryMuscle: "back",
    targetAngle: "lat_isolation",
    image: "/back/back5.png",
    tips: "Lie across a bench. Lower dumbbell behind head with slight elbow bend. Feel the lat stretch.",
    video: "https://www.youtube.com/results?search_query=dumbbell+pullover+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Upper Back & Rear Delts (Scapular Retraction) ──
  {
    id: "back_face_pulls",
    name: "Face Pulls",
    nameAr: "فيس بول بالكابل لصحة الكتف الخلفي",
    muscle: "Back",
    category: "isolation",
    primaryMuscle: "back",
    targetAngle: "upper_back_rear_delt",
    image: "/back/back6.png",
    tips: "Pull rope to forehead. External rotation at the end.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "back_cable_rear_delt_fly",
    name: "Cable Rear Delt Fly",
    nameAr: "تفتيح كتف خلفي بالكابل",
    muscle: "Back",
    category: "isolation",
    primaryMuscle: "back",
    targetAngle: "upper_back_rear_delt",
    image: "/back/back6.png",
    tips: "Stand between cable pulleys, arms crossed. Pull handles outward squeezing rear delts and upper back.",
    video: "https://www.youtube.com/results?search_query=cable+rear+delt+fly+form",
    default_sets: 3,
    default_reps: 15,
  },

  // ── Lower Back & Posterior Chain (Spinal Erectors) ──
  {
    id: "back_extensions",
    name: "Hyperextension",
    nameAr: "قطنية على الجهاز لتقوية أسفل الظهر",
    muscle: "Back",
    category: "isolation",
    primaryMuscle: "back",
    targetAngle: "lower_back_posterior",
    image: "/back/back7.png",
    tips: "Hinge at hips. Squeeze glutes and lower back at top.",
    default_sets: 3,
    default_reps: 15,
  },

  // ══════════════════════════════════════════════════════════════════════
  // SHOULDERS (الأكتاف) — 4 Essential Angles
  // ══════════════════════════════════════════════════════════════════════

  // ── Anterior Deltoid (Front) ──
  {
    id: "sh_overhead_press",
    name: "Overhead Press",
    nameAr: "ضغط كتف بالبار",
    muscle: "Shoulders",
    category: "compound",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/shoulders/shoulder1.png",
    tips: "Press bar overhead. Lock out at top/keep core tight.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "sh_seated_db_press",
    name: "Seated Dumbbell Shoulder Press",
    nameAr: "ضغط كتف بالدمبل جالس",
    muscle: "Shoulders",
    category: "compound",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/shoulders/shoulder1.png",
    tips: "Sit with back support. Press dumbbells up from shoulder height. Keep core braced.",
    video: "https://www.youtube.com/results?search_query=seated+dumbbell+shoulder+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "sh_arnold_press",
    name: "Arnold Press",
    nameAr: "أرنولد بريس",
    muscle: "Shoulders",
    category: "compound",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/shoulders/shoulder5.png",
    tips: "Rotate palms as you press up.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "shoulders_arnold_press",
    name: "Arnold Press",
    nameAr: "أرنولد بريس",
    muscle: "Shoulders",
    category: "compound",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/new/shoulders_arnold_press.png",
    tips: "Start with palms facing you and rotate out as you press up.",
    video: "https://www.youtube.com/results?search_query=arnold+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "sh_front_raise",
    name: "Front Raise",
    nameAr: "رفع أمامي بالدمبل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/shoulders/shoulder3.png",
    tips: "Lift dumbbells in front to shoulder height.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulders_front_raise",
    name: "Dumbbell Front Raise",
    nameAr: "رفع أمامي بالدمبل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "anterior_delt",
    image: "/new/shoulders_front_raise.png",
    tips: "Raise the dumbbells in front of you until parallel to the floor.",
    video: "https://www.youtube.com/results?search_query=dumbbell+front+raise+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Lateral Deltoid (Width) ──
  {
    id: "sh_lateral_raise",
    name: "Lateral Raise",
    nameAr: "رفرفة جانبي بالدمبل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "lateral_delt",
    image: "/shoulders/shoulder2.png",
    tips: "Lift to shoulder height. Lead with elbows.",
    default_sets: 4,
    default_reps: 15,
  },
  {
    id: "sh_cable_lateral_raise",
    name: "Cable Lateral Raise (Behind Back)",
    nameAr: "رفرفة جانبية بالكابل من خلف الظهر",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "lateral_delt",
    image: "/shoulders/shoulder2.png",
    tips: "Stand sideways to cable, pull from behind your back for constant tension. Lead with elbow.",
    video: "https://www.youtube.com/results?search_query=cable+lateral+raise+behind+back",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "shoulders_upright_row",
    name: "Upright Row",
    nameAr: "سحب عمودي",
    muscle: "Shoulders",
    category: "compound",
    primaryMuscle: "shoulders",
    targetAngle: "lateral_delt",
    image: "/new/shoulders_upright_row.png",
    tips: "Pull the weight up leading with your elbows.",
    video: "https://www.youtube.com/results?search_query=upright+row+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Posterior Deltoid (3D Look) ──
  {
    id: "sh_reverse_fly",
    name: "Rear Delt Fly",
    nameAr: "رفرفة كتف خلفي بالدمبل/الجهاز",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "posterior_delt",
    image: "/shoulders/shoulder4.png",
    tips: "Squeeze rear delts. Maintain slight elbow bend.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "sh_bent_rear_delt_raise",
    name: "Bent-Over DB Rear Delt Raise",
    nameAr: "رفرفة خلفية مائل بالدمبل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "posterior_delt",
    image: "/shoulders/shoulder4.png",
    tips: "Bend at hips 90°, raise dumbbells to sides squeezing rear delts. Keep torso still.",
    video: "https://www.youtube.com/results?search_query=bent+over+rear+delt+raise+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "sh_face_pulls_sh",
    name: "Face Pulls (Shoulder Focus)",
    nameAr: "فيس بول للكتف الخلفي",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "posterior_delt",
    image: "/shoulders/shoulder6.png",
    tips: "Focus on rear delts and external rotation.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "shoulders_face_pulls",
    name: "Cable Face Pulls",
    nameAr: "فيس بول بالكابل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "posterior_delt",
    image: "/new/shoulders_face_pulls.png",
    tips: "Pull the rope towards your eyes, flaring elbows out.",
    video: "https://www.youtube.com/results?search_query=cable+face+pulls+form",
    default_sets: 3,
    default_reps: 15,
  },

  // ── Upper Trapezius ──
  {
    id: "sh_shrugs",
    name: "Barbell Shrugs",
    nameAr: "شراغ بالبار",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "upper_traps",
    image: "/shoulders/shoulder7.png",
    tips: "Lift shoulders to ears. Squeeze traps.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulders_shrugs",
    name: "Dumbbell Shrugs",
    nameAr: "شراغ بالدمبل",
    muscle: "Shoulders",
    category: "isolation",
    primaryMuscle: "shoulders",
    targetAngle: "upper_traps",
    image: "/new/shoulders_shrugs.png",
    tips: "Shrug your shoulders straight up towards your ears and hold.",
    video: "https://www.youtube.com/results?search_query=dumbbell+shrugs+form",
    default_sets: 3,
    default_reps: 15,
  },

  // ══════════════════════════════════════════════════════════════════════
  // ARMS (الذراعين) — 5 Essential Angles
  // ══════════════════════════════════════════════════════════════════════

  // ── Biceps Long Head (Stretch) ──
  {
    id: "arm_incline_curl",
    name: "Incline Dumbbell Curl",
    nameAr: "بايسبس دمبل مائل",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "bicep_long_head",
    image: "/arm/arm3.png",
    tips: "Full stretch at bottom. Keep elbows back.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Biceps Short Head (Peak) ──
  {
    id: "arm_barbell_curl",
    name: "Barbell Curl",
    nameAr: "بايسبس بالبار المستوي",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "bicep_short_head",
    image: "/arm/arm1.png",
    tips: "Keep elbows at sides. Squeeze biceps at top.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "arms_preacher_curl",
    name: "Preacher Curl",
    nameAr: "بايسبس على جهاز الارتكاز",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "bicep_short_head",
    image: "/new/arms_preacher_curl.png",
    tips: "Keep armpits flushed against the pad. Squeeze hard at the top.",
    video: "https://www.youtube.com/results?search_query=ez+bar+preacher+curl",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "arms_concentration_curl",
    name: "Concentration Curl",
    nameAr: "بايسبس تركيز",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "bicep_short_head",
    image: "/arm/arm3.png",
    tips: "Rest your elbow on your inner thigh for stability.",
    video: "https://www.youtube.com/results?search_query=concentration+curl+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Brachialis & Forearms (Arm Thickness) ──
  {
    id: "arm_hammer_curl",
    name: "Hammer Curl",
    nameAr: "تبادل هامر بالدمبل",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "brachialis",
    image: "/arm/arm2.png",
    tips: "Neutral grip. Targets brachialis.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_reverse_curl",
    name: "Reverse Barbell Curl",
    nameAr: "بايسبس قبضة عكسية",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "brachialis",
    image: "/arm/arm8.png",
    tips: "Overhand grip. Targets forearms/brachialis.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_wrist_curl",
    name: "Wrist Curls",
    nameAr: "ريست كيرل للساعد",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "brachialis",
    image: "/arm/arm7.png",
    tips: "Curl wrists up. Forearms on bench.",
    default_sets: 3,
    default_reps: 15,
  },

  // ── Triceps Long Head (Stretch) ──
  {
    id: "arm_overhead_ext",
    name: "Overhead Tricep Extension",
    nameAr: "ترايسبس فوق الرأس",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "tricep_long_head",
    image: "/arm/arm5.png",
    tips: "Stretch triceps overhead. Elbows pointing up.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arms_skull_crushers",
    name: "Skull Crushers",
    nameAr: "ترايسبس بالبار المستوي على البنش",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "tricep_long_head",
    image: "/arm/arm4.png",
    tips: "Lower the bar towards your forehead, keep elbows pointing up.",
    video: "https://www.youtube.com/results?search_query=ez+bar+skullcrushers",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "arm_close_grip_bench",
    name: "Close Grip Bench Press",
    nameAr: "ضغط بنش قبضة ضيقة",
    muscle: "Arms",
    category: "compound",
    primaryMuscle: "arms",
    targetAngle: "tricep_long_head",
    image: "/arm/arm6.png",
    tips: "Hands shoulder-width apart. Elbows tucked.",
    default_sets: 3,
    default_reps: 8,
  },

  // ── Triceps Lateral & Medial Heads ──
  {
    id: "arm_tricep_pushdown",
    name: "Rope Pushdown",
    nameAr: "ترايسبس كابل بالروب",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "tricep_lateral_medial",
    image: "/arm/arm4.png",
    tips: "Keep elbows pinned to sides. Full extension.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_straight_bar_pushdown",
    name: "Straight-Bar Pushdown",
    nameAr: "ترايسبس كابل بالبار المستقيم",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "tricep_lateral_medial",
    image: "/arm/arm4.png",
    tips: "Use a straight bar attachment. Lock elbows at sides, extend fully and squeeze lateral head.",
    video: "https://www.youtube.com/results?search_query=straight+bar+pushdown+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arms_tricep_kickback",
    name: "Dumbbell Tricep Kickback",
    nameAr: "ترايسبس كيك باك بالدمبل",
    muscle: "Arms",
    category: "isolation",
    primaryMuscle: "arms",
    targetAngle: "tricep_lateral_medial",
    image: "/arm/arm2.png",
    tips: "Keep elbows glued to your sides and extend the arm fully backwards.",
    video: "https://www.youtube.com/results?search_query=tricep+kickback+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ══════════════════════════════════════════════════════════════════════
  // LEGS (الأرجل) — 5 Essential Angles + Calves
  // ══════════════════════════════════════════════════════════════════════

  // ── Quad Dominant Compound (Knee Flexion) ──
  {
    id: "leg_squat",
    name: "Barbell Back Squat",
    nameAr: "سكوات بالبار",
    muscle: "Legs",
    category: "compound",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/legs/leg1.png",
    tips: "Keep chest up, back straight. Drive through heels.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "legs_hack_squat",
    name: "Hack Squat",
    nameAr: "هاك سكوات على الجهاز",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/new/legs_hack_squat.png",
    tips: "Place feet shoulder-width. Keep back tight against the pad and go deep.",
    video: "https://www.youtube.com/results?search_query=machine+hack+squat",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "leg_press",
    name: "Leg Press",
    nameAr: "ضغط رجلين على الجهاز",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/legs/leg2.png",
    tips: "Feet shoulder-width on platform. Don't lock knees.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "leg_lunges",
    name: "Dumbbell Lunges",
    nameAr: "طعنات بالدمبل",
    muscle: "Legs",
    category: "compound",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/legs/leg3.png",
    tips: "Step forward, back knee almost touches ground.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "legs_bulgarian",
    name: "Bulgarian Split Squat",
    nameAr: "سكوات بلغاري",
    muscle: "Legs",
    category: "compound",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/new/legs_bulgarian_split_squat.png",
    tips: "Keep chest up and drop the back knee straight down.",
    video: "https://www.youtube.com/results?search_query=bulgarian+split+squat+form",
    default_sets: 3,
    default_reps: 10,
  },

  // ── Quad Isolation (Terminal Knee Extension) ──
  {
    id: "leg_extension",
    name: "Leg Extension",
    nameAr: "جهاز أمامي للرجل",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "quad_isolation",
    image: "/legs/leg3.png",
    tips: "Extend legs fully. Squeeze quads at the top. Control the negative.",
    video: "https://www.youtube.com/results?search_query=leg+extension+machine+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Hamstrings (Hip Hinge / Length) ──
  {
    id: "leg_rdl",
    name: "Romanian Deadlift",
    nameAr: "رفعة رومانية بالدمبل/البار",
    muscle: "Legs",
    category: "compound",
    primaryMuscle: "legs",
    targetAngle: "hamstring_hinge",
    image: "/legs/leg4.png",
    tips: "Hinge at hips. Slight knee bend. Feel hamstring stretch.",
    default_sets: 3,
    default_reps: 10,
  },

  // ── Hamstrings (Knee Flexion Isolation) ──
  {
    id: "leg_curl",
    name: "Seated/Lying Leg Curl",
    nameAr: "كيرل خلفي للرجل",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "hamstring_curl",
    image: "/legs/leg5.png",
    tips: "Pull heels to glutes. Squeeze hamstrings.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "leg_seated_leg_curl",
    name: "Seated Leg Curl",
    nameAr: "كيرل خلفي جالس",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "hamstring_curl",
    image: "/legs/leg5.png",
    tips: "Sit tall, curl heels under the seat. Squeeze hamstrings at full contraction.",
    video: "https://www.youtube.com/results?search_query=seated+leg+curl+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ── Calves (Gastrocnemius & Soleus) ──
  {
    id: "leg_calf_raise",
    name: "Standing Calf Raises",
    nameAr: "سمانة واقف",
    muscle: "Legs",
    category: "isolation",
    primaryMuscle: "legs",
    targetAngle: "calves",
    image: "/legs/leg7.png",
    tips: "Full stretch at bottom. Peak contraction at top.",
    default_sets: 4,
    default_reps: 15,
  },
  {
    id: "legs_standing_calf",
    name: "Standing Calf Raises",
    nameAr: "سمانة واقف على الجهاز",
    muscle: "Legs",
    category: "isolation",
    primaryMuscle: "legs",
    targetAngle: "calves",
    image: "/new/legs_standing_calf_raises.png",
    tips: "Explode up, hold for a second, then lower slowly.",
    video: "https://www.youtube.com/results?search_query=standing+calf+raises+form",
    default_sets: 4,
    default_reps: 15,
  },
  {
    id: "leg_seated_calf_raise",
    name: "Seated Calf Raise",
    nameAr: "سمانة جالس",
    muscle: "Legs",
    category: "isolation",
    primaryMuscle: "legs",
    targetAngle: "calves",
    image: "/legs/leg7.png",
    tips: "Sit on calf raise machine. Full ROM — deep stretch at bottom, squeeze at top. Targets soleus.",
    video: "https://www.youtube.com/results?search_query=seated+calf+raise+form",
    default_sets: 4,
    default_reps: 15,
  },

  // ── Other Legs (Adductors / Glutes) ──
  {
    id: "leg_adductor",
    name: "Adductor Machine",
    nameAr: "جهاز المقربة",
    muscle: "Legs",
    category: "machine",
    primaryMuscle: "legs",
    targetAngle: "quad_compound",
    image: "/legs/leg6.png",
    tips: "Squeeze legs together.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "legs_glute_bridge",
    name: "Barbell Glute Bridge",
    nameAr: "جلوت بريدج بالبار",
    muscle: "Legs",
    category: "compound",
    primaryMuscle: "legs",
    targetAngle: "hamstring_hinge",
    image: "/new/legs_glute_bridge.png",
    tips: "Drive through your heels and squeeze your glutes at the top.",
    video: "https://www.youtube.com/results?search_query=barbell+glute+bridge+form",
    default_sets: 3,
    default_reps: 12,
  },

  // ══════════════════════════════════════════════════════════════════════
  // CORE (البطن و Core) — Core & Transverse Abdominis
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "core_hanging_leg_raise",
    name: "Hanging Leg Raise",
    nameAr: "رفع الرجلين على العقلة",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core2.png",
    tips: "Hang from a bar and raise straight legs up towards your chest.",
    video: "https://www.youtube.com/results?search_query=hanging+leg+raise+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "core_plank",
    name: "Plank",
    nameAr: "تمرين البلانك للبطن والـ Core",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core1.png",
    tips: "Hold a straight line from head to heels. Don't let hips sag. Engage abs throughout.",
    video: "https://www.youtube.com/results?search_query=plank+form+tips",
    default_sets: 3,
    default_reps: 1, // 1 = hold (time-based)
  },
  {
    id: "core_weighted_plank",
    name: "Weighted Plank",
    nameAr: "بلانك بأوزان",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core1.png",
    tips: "Place a weight plate on your upper back. Hold plank position with engaged core for progressive overload.",
    video: "https://www.youtube.com/results?search_query=weighted+plank+form",
    default_sets: 3,
    default_reps: 1, // time-based
  },
  {
    id: "core_russian_twist",
    name: "Russian Twists",
    nameAr: "تويست روسي",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core1.png",
    tips: "Rotate your torso, not just your arms. Use a weight if easy.",
    default_sets: 3,
    default_reps: 20,
  },
  {
    id: "core_ab_wheel",
    name: "Ab Wheel Rollout",
    nameAr: "عجلة البطن",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core3.png",
    tips: "Keep your lower back slightly rounded to protect the spine.",
    video: "https://www.youtube.com/results?search_query=ab+wheel+rollout+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "core_bicycle_crunches",
    name: "Bicycle Crunches",
    nameAr: "كرانش دراجة",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core4.png",
    tips: "Opposite elbow to opposite knee. Twist the torso completely.",
    video: "https://www.youtube.com/results?search_query=bicycle+crunches+form",
    default_sets: 3,
    default_reps: 20,
  },
  {
    id: "core_declined_situp",
    name: "Decline Sit-Ups",
    nameAr: "بطن مائل",
    muscle: "Core",
    category: "isolation",
    primaryMuscle: "core",
    targetAngle: "core_abs",
    image: "/core/core5.png",
    tips: "Perform regular sit-ups backwards on a decline bench for max tension.",
    video: "https://www.youtube.com/results?search_query=decline+sit-ups",
    default_sets: 3,
    default_reps: 15,
  },
];

// ════════════════════════════════════════════════════════════════════════════════
// TRAINING PLANS — Multi-Program System
// ════════════════════════════════════════════════════════════════════════════════

export const trainingPlans = {
  // ── PROGRAM A: PPL + Upper (4-Day Advanced Split) ──
  ppl_upper: {
    id: "ppl_upper",
    name: "PPL + Upper",
    nameAr: "نظام الدفع/السحب/الأرجل + علوي",
    description: "4-Day Advanced Split",
    descriptionAr: "نظام 4 أيام متقدم",
    tag: "4-Day High Efficiency",
    tagIcon: "⚡",
    daysPerWeek: 4,
    color: "neon-blue",
    programs: {
      push_day: {
        id: "push_day",
        name: "Push Day",
        nameAr: "الصدر، الكتف الأمامي والجانبي، الترايسبس",
        muscles: ["Chest", "Shoulders", "Arms"],
        exercises: [
          "chest_incline_db",       // 1. Upper Chest — Incline DB Press
          "chest_barbell_bench",    // 2. Mid Chest — Barbell Bench Press
          "chest_cable_fly",        // 3. Lower Chest — High-to-Low Cable Fly
          "sh_seated_db_press",     // 4. Anterior Delt — Seated DB Shoulder Press
          "sh_lateral_raise",       // 5. Lateral Delt — Lateral Raises
          "arm_tricep_pushdown",    // 6. Tricep Lateral/Medial — Rope Pushdown
          "chest_dips",             // 7. Lower Chest — Dips (Chest Version)
        ],
      },
      pull_day: {
        id: "pull_day",
        name: "Pull Day",
        nameAr: "الظهر بالكامل، الكتف الخلفي، البايسبس، السواعد",
        muscles: ["Back", "Shoulders", "Arms"],
        exercises: [
          "back_lat_pulldown",      // 1. Vertical Pull — Lat Pulldown
          "back_cable_row",         // 2. Horizontal Row — Seated Cable Row
          "back_db_pullover",       // 3. Lat Isolation — Dumbbell Pullover
          "sh_reverse_fly",         // 4. Posterior Delt — Rear Delt Fly
          "arm_barbell_curl",       // 5. Bicep Short Head — Barbell Curl
          "arm_hammer_curl",        // 6. Brachialis — Hammer Curls
          "back_extensions",        // 7. Lower Back — Hyperextension
        ],
      },
      legs_day: {
        id: "legs_day",
        name: "Leg Day",
        nameAr: "الفخذ الأمامي، الخلفيات، السمانة، والبطن",
        muscles: ["Legs", "Core"],
        exercises: [
          "leg_squat",              // 1. Quad Compound — Barbell Squat
          "leg_press",              // 2. Quad Compound — Leg Press
          "leg_extension",          // 3. Quad Isolation — Leg Extension
          "leg_rdl",                // 4. Hamstring Hinge — Romanian Deadlift
          "leg_curl",               // 5. Hamstring Curl — Leg Curl
          "leg_calf_raise",         // 6. Calves — Standing Calf Raise
          "core_hanging_leg_raise", // 7. Core — Hanging Leg Raise
        ],
      },
      upper_day: {
        id: "upper_day",
        name: "Upper Body",
        nameAr: "جزء علوي كامل - ضخ دم وعزل",
        muscles: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
          "chest_pec_deck",                // 1. Inner Chest — Pec Deck Fly
          "chest_incline_machine_press",   // 2. Machine Compound — Incline Machine Press
          "back_straight_arm_pulldown",    // 3. Lat Isolation — Straight Arm Pulldown
          "back_single_db_row",            // 4. Unilateral Row — One-Arm DB Row
          "back_face_pulls",               // 5. Upper Back/Rear Delt — Face Pulls
          "arms_preacher_curl",            // 6. Bicep Short Head — Preacher Curl
          "arms_skull_crushers",           // 7. Tricep Long Head — Skull Crushers
        ],
      },
    },
    defaultSchedule: {
      0: "push_day",   // Monday
      1: "pull_day",   // Tuesday
      2: null,         // Wednesday (rest)
      3: "legs_day",   // Thursday
      4: "upper_day",  // Friday
      5: null,         // Saturday (rest)
      6: null,         // Sunday (rest)
    },
  },

  // ── PROGRAM B: Bro Split (5-Day Classic) ──
  bro_split: {
    id: "bro_split",
    name: "Bro Split",
    nameAr: "النظام التقليدي - عضلة واحدة يومياً",
    description: "5-Day Classic Split",
    descriptionAr: "نظام 5 أيام كلاسيكي",
    tag: "5-Day Classic",
    tagIcon: "💪",
    daysPerWeek: 5,
    color: "neon-purple",
    programs: {
      chest_day: {
        id: "chest_day",
        name: "Chest Day",
        nameAr: "يوم الصدر",
        muscles: ["Chest"],
        exercises: [
          "chest_barbell_bench",          // 1. Mid Chest — BB Bench Press
          "chest_incline_db",             // 2. Upper Chest — Incline DB Press
          "chest_cable_fly",              // 3. Lower Chest — High-to-Low Cable Fly
          "chest_pec_deck",               // 4. Inner Chest — Pec Deck Fly
          "chest_incline_machine_press",  // 5. Machine Compound — Incline Machine Press
          "chest_dips",                   // 6. Lower Chest — Dips
        ],
      },
      back_day: {
        id: "back_day",
        name: "Back Day",
        nameAr: "يوم الظهر",
        muscles: ["Back"],
        exercises: [
          "back_lat_pulldown",            // 1. Vertical Pull — Lat Pulldown
          "back_bent_row",                // 2. Horizontal Row — Bent Over BB Row
          "back_cable_row",               // 3. Horizontal Row — Seated Cable Row
          "back_single_db_row",           // 4. Unilateral Row — Single Arm DB Row
          "back_straight_arm_pulldown",   // 5. Lat Isolation — Straight Arm Pulldown
          "back_face_pulls",              // 6. Upper Back/Rear Delt — Face Pulls
          "back_extensions",              // 7. Lower Back — Hyperextension
        ],
      },
      shoulder_day: {
        id: "shoulder_day",
        name: "Shoulder Day",
        nameAr: "يوم الكتف",
        muscles: ["Shoulders"],
        exercises: [
          "sh_overhead_press",     // 1. Anterior Delt — OHP
          "sh_lateral_raise",      // 2. Lateral Delt — Lateral Raise
          "sh_front_raise",        // 3. Anterior Delt — Front Raise
          "sh_reverse_fly",        // 4. Posterior Delt — Rear Delt Fly
          "sh_arnold_press",       // 5. Anterior Delt — Arnold Press
          "sh_shrugs",             // 6. Upper Traps — Barbell Shrugs
        ],
      },
      bro_leg_day: {
        id: "bro_leg_day",
        name: "Leg Day",
        nameAr: "يوم الأرجل والبطن",
        muscles: ["Legs", "Core"],
        exercises: [
          "leg_squat",              // 1. Quad Compound — Barbell Squat
          "leg_press",              // 2. Quad Compound — Leg Press
          "leg_rdl",                // 3. Hamstring Hinge — RDL
          "leg_curl",               // 4. Hamstring Curl — Leg Curl
          "leg_extension",          // 5. Quad Isolation — Leg Extension
          "leg_calf_raise",         // 6. Calves — Standing Calf Raise
          "core_hanging_leg_raise", // 7. Core — Hanging Leg Raise
          "core_plank",             // 8. Core — Plank
        ],
      },
      arm_day: {
        id: "arm_day",
        name: "Arm Day",
        nameAr: "يوم الذراعين",
        muscles: ["Arms"],
        exercises: [
          // Bicep
          "arm_barbell_curl",       // 1. Bicep Short Head — Barbell Curl
          "arm_hammer_curl",        // 2. Brachialis — Hammer Curl
          "arm_incline_curl",       // 3. Bicep Long Head — Incline DB Curl
          "arms_preacher_curl",     // 4. Bicep Short Head — Preacher Curl
          // Tricep
          "arm_tricep_pushdown",    // 5. Tricep Lateral/Medial — Rope Pushdown
          "arm_overhead_ext",       // 6. Tricep Long Head — Overhead Extension
          "arm_close_grip_bench",   // 7. Tricep Long Head — Close Grip Bench
          "arms_skull_crushers",    // 8. Tricep Long Head — Skull Crushers
        ],
      },
    },
    defaultSchedule: {
      0: "chest_day",     // Monday
      1: "back_day",      // Tuesday
      2: "shoulder_day",  // Wednesday
      3: "bro_leg_day",   // Thursday
      4: "arm_day",       // Friday
      5: null,            // Saturday (rest)
      6: null,            // Sunday (rest)
    },
  },
};

// ── Backward-compatible exports (default to ppl_upper) ──
export const workoutPrograms = trainingPlans.ppl_upper.programs;
export const weeklySchedule = trainingPlans.ppl_upper.defaultSchedule;

export default exercises;
