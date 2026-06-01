const exercises = [
  // ── CHEST (6 Exercises) ──
  {
    id: "chest_barbell_bench",
    name: "Barbell Bench Press",
    nameAr: "ضغط بنش بالبار مستوي",
    muscle: "Chest",
    image: "/chest/chest1.png",
    tips: "Grip slightly wider than shoulder width. Lower bar to mid-chest. elbows at 45 degrees.",
    video:
      "https://www.youtube.com/results?search_query=barbell+bench+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "chest_incline_db",
    name: "Incline Dumbbell Press",
    nameAr: "ضغط دمبل عالي/مائل",
    muscle: "Chest",
    image: "/chest/chest2.png",
    tips: "Bench at 30-45 degrees. Press up and slightly in.",
    video:
      "https://www.youtube.com/results?search_query=incline+dumbbell+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "chest_cable_fly",
    name: "High-to-Low Cable Fly",
    nameAr: "تجميع كابل عالي-منخفض",
    muscle: "Chest",
    image: "/chest/chest3.png",
    tips: "Focus on the squeeze at the bottom. Keep a slight bend in elbows.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_pec_deck",
    name: "Pec Deck Fly",
    nameAr: "جهاز الفراشة للصدر",
    muscle: "Chest",
    image: "/chest/chest4.png",
    tips: "Keep elbows high. Squeeze chest hard at the peak.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_flat_db_fly",
    name: "Flat Dumbbell Fly",
    nameAr: "تفتيح دمبل مستوي",
    muscle: "Chest",
    image: "/chest/chest5.png",
    tips: "Deep stretch at the bottom. Imagine hugging a tree.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_dips",
    name: "Dips (Chest Version)",
    nameAr: "الغطس - نسخة الصدر",
    muscle: "Chest",
    image: "/chest/chest6.png",
    tips: "Lean forward to target chest. Go deep.",
    default_sets: 3,
    default_reps: 10,
  },

  // ── BACK (8 Exercises) ──
  {
    id: "back_lat_pulldown",
    name: "Wide Grip Lat Pulldown",
    nameAr: "سحب عالي للظهر",
    muscle: "Back",
    image: "/back/back1.png",
    tips: "Pull to upper chest. Squeeze lats.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_bent_row",
    name: "Bent Over Barbell Row",
    nameAr: "سحب بالبار مائل",
    muscle: "Back",
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
    image: "/back/back3.png",
    tips: "Keep torso upright. Pull handle to stomach.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "back_pullups",
    name: "Pull Ups",
    nameAr: "عقلة",
    muscle: "Back",
    image: "/back/back4.png",
    tips: "Full range of motion. Chest to bar if possible.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "back_single_db_row",
    name: "Single Arm Dumbbell Row",
    nameAr: "منشار بالدمبل للظهر",
    muscle: "Back",
    image: "/back/back5.png",
    tips: "Support on bench. Pull dumbbell to hip.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "back_face_pulls",
    name: "Face Pulls",
    nameAr: "فيس بول بالكابل لصحة الكتف الخلفي",
    muscle: "Back",
    image: "/back/back6.png",
    tips: "Pull rope to forehead. External rotation at the end.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "back_extensions",
    name: "Hyperextension",
    nameAr: "قطنية على الجهاز لتقوية أسفل الظهر",
    muscle: "Back",
    image: "/back/back7.png",
    tips: "Hinge at hips. Squeeze glutes and lower back at top.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "back_reverse_bb_row",
    name: "Reverse Grip Row / Variation",
    nameAr: "سحب قبضة عكسية",
    muscle: "Back",
    image: "/back/back8.png",
    tips: "Underhand grip to target lower lats.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── SHOULDERS (7 Exercises) ──
  {
    id: "sh_overhead_press",
    name: "Overhead Press",
    nameAr: "ضغط كتف بالبار",
    muscle: "Shoulders",
    image: "/shoulders/shoulder1.png",
    tips: "Press bar overhead. Lock out at top/keep core tight.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "sh_lateral_raise",
    name: "Lateral Raise",
    nameAr: "رفرفة جانبي بالدمبل",
    muscle: "Shoulders",
    image: "/shoulders/shoulder2.png",
    tips: "Lift to shoulder height. Lead with elbows.",
    default_sets: 4,
    default_reps: 15,
  },
  {
    id: "sh_front_raise",
    name: "Front Raise",
    nameAr: "رفع أمامي بالدمبل",
    muscle: "Shoulders",
    image: "/shoulders/shoulder3.png",
    tips: "Lift dumbbells in front to shoulder height.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "sh_reverse_fly",
    name: "Rear Delt Fly",
    nameAr: "رفرفة كتف خلفي بالدمبل/الجهاز",
    muscle: "Shoulders",
    image: "/shoulders/shoulder4.png",
    tips: "Squeeze rear delts. maintain slight elbow bend.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "sh_arnold_press",
    name: "Arnold Press",
    nameAr: "أرنولد بريس",
    muscle: "Shoulders",
    image: "/shoulders/shoulder5.png",
    tips: "Rotate palms as you press up.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "sh_face_pulls_sh",
    name: "Face Pulls (Shoulder Focus)",
    nameAr: "فيس بول للكتف الخلفي",
    muscle: "Shoulders",
    image: "/shoulders/shoulder6.png",
    tips: "Focus on rear delts and external rotation.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "sh_shrugs",
    name: "Barbell Shrugs",
    nameAr: "شراغ بالبار",
    muscle: "Shoulders",
    image: "/shoulders/shoulder7.png",
    tips: "Lift shoulders to ears. Squeeze traps.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── ARMS (8 Exercises) ──
  {
    id: "arm_barbell_curl",
    name: "Barbell Curl",
    nameAr: "بايسبس بالبار المستوي",
    muscle: "Arms",
    image: "/arm/arm1.png",
    tips: "Keep elbows at sides. Squeeze biceps at top.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "arm_hammer_curl",
    name: "Hammer Curl",
    nameAr: "تبادل هامر بالدمبل",
    muscle: "Arms",
    image: "/arm/arm2.png",
    tips: "Neutral grip. Targets brachialis.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_incline_curl",
    name: "Incline Dumbbell Curl",
    nameAr: "بايسبس دمبل مائل",
    muscle: "Arms",
    image: "/arm/arm3.png",
    tips: "Full stretch at bottom. Keep elbows back.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_tricep_pushdown",
    name: "Rope Pushdown",
    nameAr: "ترايسبس كابل بالروب",
    muscle: "Arms",
    image: "/arm/arm4.png",
    tips: "Keep elbows pinned to sides. Full extension.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_overhead_ext",
    name: "Overhead Tricep Extension",
    nameAr: "ترايسبس فوق الرأس",
    muscle: "Arms",
    image: "/arm/arm5.png",
    tips: "Stretch triceps overhead. Elbows pointing up.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arm_close_grip_bench",
    name: "Close Grip Bench Press",
    nameAr: "ضغط بنش قبضة ضيقة",
    muscle: "Arms",
    image: "/arm/arm6.png",
    tips: "Hands shoulder-width apart. Elbows tucked.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "arm_wrist_curl",
    name: "Wrist Curls",
    nameAr: "ريست كيرل للساعد",
    muscle: "Arms",
    image: "/arm/arm7.png",
    tips: "Curl wrists up. Forearms on bench.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "arm_reverse_curl",
    name: "Reverse Barbell Curl",
    nameAr: "بايسبس قبضة عكسية",
    muscle: "Arms",
    image: "/arm/arm8.png",
    tips: "Overhand grip. Targets forearms/brachialis.",
    default_sets: 3,
    default_reps: 12,
  },

  // ── LEGS (7 Exercises) ──
  {
    id: "leg_squat",
    name: "Barbell Back Squat",
    nameAr: "سكوات بالبار",
    muscle: "Legs",
    image: "/legs/leg1.png",
    tips: "Keep chest up, back straight. Drive through heels.",
    default_sets: 3,
    default_reps: 8,
  },
  {
    id: "leg_press",
    name: "Leg Press",
    nameAr: "ضغط رجلين على الجهاز",
    muscle: "Legs",
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
    image: "/legs/leg3.png",
    tips: "Step forward, back knee almost touches ground.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "leg_rdl",
    name: "Romanian Deadlift",
    nameAr: "رفعة رومانية بالدمبل/البار",
    muscle: "Legs",
    image: "/legs/leg4.png",
    tips: "Hinge at hips. Slight knee bend. Feel hamstring stretch.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "leg_curl",
    name: "Seated/Lying Leg Curl",
    nameAr: "كيرل خلفي للرجل",
    muscle: "Legs",
    image: "/legs/leg5.png",
    tips: "Pull heels to glutes. Squeeze hamstrings.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "leg_adductor",
    name: "Adductor Machine",
    nameAr: "جهاز المقربة",
    muscle: "Legs",
    image: "/legs/leg6.png",
    tips: "Squeeze legs together.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "leg_calf_raise",
    name: "Standing Calf Raises",
    nameAr: "سمانة واقف",
    muscle: "Legs",
    image: "/legs/leg7.png",
    tips: "Full stretch at bottom. Peak contraction at top.",
    default_sets: 4,
    default_reps: 15,
  },

  // ── NEW / EXTENDED EXERCISES ──
  {
    id: "chest_pushup",
    name: "Push-ups",
    nameAr: "ضغط أرضي",
    muscle: "Chest",
    image: "/new/chest_pushup.png",
    tips: "Keep core tight. Lower until chest nearly touches the floor.",
    video: "https://www.youtube.com/results?search_query=proper+pushup+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "chest_machine_press",
    name: "Machine Chest Press",
    nameAr: "ضغط صدر على الجهاز",
    muscle: "Chest",
    image: "/new/chest_machine_press.png",
    tips: "Keep back flat against the pad. Press until arms are fully extended.",
    video:
      "https://www.youtube.com/results?search_query=machine+chest+press+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "chest_decline_bench",
    name: "Decline Barbell Bench",
    nameAr: "ضغط بنش مائل سفلي",
    muscle: "Chest",
    image: "/new/chest_decline_bench.png",
    tips: "Secure legs tightly. Targets the lower chest fibers.",
    video:
      "https://www.youtube.com/results?search_query=decline+bench+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "chest_svend_press",
    name: "Svend Press",
    nameAr: "سفيند بريس",
    muscle: "Chest",
    image: "/new/chest_svend_press.png",
    tips: "Squeeze plates together hard. Excellent for inner chest activation.",
    video: "https://www.youtube.com/results?search_query=svend+press+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "back_t_bar_row",
    name: "T-Bar Row",
    nameAr: "تي بار رو",
    muscle: "Back",
    image: "/new/back_t_bar_row.png",
    tips: "Use a V-grip handle. Keep lower back straight and pull towards your stomach.",
    video: "https://www.youtube.com/results?search_query=t-bar+row+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_straight_arm_pulldown",
    name: "Straight Arm Pulldown",
    nameAr: "سحب بالذراع مفرود للمجنص",
    muscle: "Back",
    image: "/new/back_straight_arm_pulldown.png",
    tips: "Keep arms straight with a slight bend. Push down using your lats.",
    video:
      "https://www.youtube.com/results?search_query=straight+arm+pulldown+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "legs_hack_squat",
    name: "Hack Squat",
    nameAr: "هاك سكوات على الجهاز",
    muscle: "Legs",
    image: "/new/legs_hack_squat.png",
    tips: "Place feet shoulder-width. Keep back tight against the pad and go deep.",
    video: "https://www.youtube.com/results?search_query=machine+hack+squat",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "legs_bulgarian",
    name: "Bulgarian Split Squat",
    nameAr: "سكوات بلغاري",
    muscle: "Legs",
    image: "/new/legs_bulgarian_split_squat.png",
    tips: "Keep chest up and drop the back knee straight down.",
    video:
      "https://www.youtube.com/results?search_query=bulgarian+split+squat+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "legs_standing_calf",
    name: "Standing Calf Raises",
    nameAr: "سمانة واقف على الجهاز",
    muscle: "Legs",
    image: "/new/legs_standing_calf_raises.png",
    tips: "Explode up, hold for a second, then lower slowly.",
    video:
      "https://www.youtube.com/results?search_query=standing+calf+raises+form",
    default_sets: 4,
    default_reps: 15,
  },
  {
    id: "legs_glute_bridge",
    name: "Barbell Glute Bridge",
    nameAr: "جلوت بريدج بالبار",
    muscle: "Legs",
    image: "/new/legs_glute_bridge.png",
    tips: "Drive through your heels and squeeze your glutes at the top.",
    video:
      "https://www.youtube.com/results?search_query=barbell+glute+bridge+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulders_upright_row",
    name: "Upright Row",
    nameAr: "سحب عمودي",
    muscle: "Shoulders",
    image: "/new/shoulders_upright_row.png",
    tips: "Pull the weight up leading with your elbows.",
    video: "https://www.youtube.com/results?search_query=upright+row+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulders_arnold_press",
    name: "Arnold Press",
    nameAr: "أرنولد بريس",
    muscle: "Shoulders",
    image: "/new/shoulders_arnold_press.png",
    tips: "Start with palms facing you and rotate out as you press up.",
    video: "https://www.youtube.com/results?search_query=arnold+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "shoulders_face_pulls",
    name: "Cable Face Pulls",
    nameAr: "فيس بول بالكابل",
    muscle: "Shoulders",
    image: "/new/shoulders_face_pulls.png",
    tips: "Pull the rope towards your eyes, flaring elbows out.",
    video: "https://www.youtube.com/results?search_query=cable+face+pulls+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "shoulders_front_raise",
    name: "Dumbbell Front Raise",
    nameAr: "رفع أمامي بالدمبل",
    muscle: "Shoulders",
    image: "/new/shoulders_front_raise.png",
    tips: "Raise the dumbbells in front of you until parallel to the floor.",
    video:
      "https://www.youtube.com/results?search_query=dumbbell+front+raise+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulders_shrugs",
    name: "Dumbbell Shrugs",
    nameAr: "شراغ بالدمبل",
    muscle: "Shoulders",
    image: "/new/shoulders_shrugs.png",
    tips: "Shrug your shoulders straight up towards your ears and hold.",
    video: "https://www.youtube.com/results?search_query=dumbbell+shrugs+form",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "arms_preacher_curl",
    name: "Preacher Curl",
    nameAr: "بايسبس على جهاز الارتكاز",
    muscle: "Arms",
    image: "/new/arms_preacher_curl.png",
    tips: "Keep armpits flushed against the pad. Squeeze hard at the top.",
    video: "https://www.youtube.com/results?search_query=ez+bar+preacher+curl",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "arms_tricep_kickback",
    name: "Dumbbell Tricep Kickback",
    nameAr: "ترايسبس كيك باك بالدمبل",
    muscle: "Arms",
    image: "/arm/arm2.png",
    tips: "Keep elbows glued to your sides and extend the arm fully backwards.",
    video: "https://www.youtube.com/results?search_query=tricep+kickback+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arms_concentration_curl",
    name: "Concentration Curl",
    nameAr: "بايسبس تركيز",
    muscle: "Arms",
    image: "/arm/arm3.png",
    tips: "Rest your elbow on your inner thigh for stability.",
    video:
      "https://www.youtube.com/results?search_query=concentration+curl+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "arms_skull_crushers",
    name: "Skull Crushers",
    nameAr: "ترايسبس بالبار المستوي على البنش",
    muscle: "Arms",
    image: "/arm/arm4.png",
    tips: "Lower the bar towards your forehead, keep elbows pointing up.",
    video: "https://www.youtube.com/results?search_query=ez+bar+skullcrushers",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "core_russian_twist",
    name: "Russian Twists",
    nameAr: "تويست روسي",
    muscle: "Core",
    image: "/core/core1.png",
    tips: "Rotate your torso, not just your arms. Use a weight if easy.",
    default_sets: 3,
    default_reps: 20,
  },
  {
    id: "core_hanging_leg_raise",
    name: "Hanging Leg Raise",
    nameAr: "رفع الرجلين على العقلة",
    muscle: "Core",
    image: "/core/core2.png",
    tips: "Hang from a bar and raise straight legs up towards your chest.",
    video:
      "https://www.youtube.com/results?search_query=hanging+leg+raise+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "core_ab_wheel",
    name: "Ab Wheel Rollout",
    nameAr: "عجلة البطن",
    muscle: "Core",
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
    image: "/core/core5.png",
    tips: "Perform regular sit-ups backwards on a decline bench for max tension.",
    video: "https://www.youtube.com/results?search_query=decline+sit-ups",
    default_sets: 3,
    default_reps: 15,
  },

  // ── NEW EXERCISES FOR PPL PROGRAM ──
  {
    id: "sh_seated_db_press",
    name: "Seated Dumbbell Shoulder Press",
    nameAr: "ضغط كتف بالدمبل جالس",
    muscle: "Shoulders",
    image: "/shoulders/shoulder1.png",
    tips: "Sit with back support. Press dumbbells up from shoulder height. Keep core braced.",
    video:
      "https://www.youtube.com/results?search_query=seated+dumbbell+shoulder+press+form",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "back_db_pullover",
    name: "Dumbbell Pullover",
    nameAr: "بلوفر بالدمبل",
    muscle: "Back",
    image: "/back/back5.png",
    tips: "Lie across a bench. Lower dumbbell behind head with slight elbow bend. Feel the lat stretch.",
    video:
      "https://www.youtube.com/results?search_query=dumbbell+pullover+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "leg_extension",
    name: "Leg Extension",
    nameAr: "جهاز أمامي للرجل",
    muscle: "Legs",
    image: "/legs/leg3.png",
    tips: "Extend legs fully. Squeeze quads at the top. Control the negative.",
    video:
      "https://www.youtube.com/results?search_query=leg+extension+machine+form",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "core_plank",
    name: "Plank",
    nameAr: "تمرين البلانك للبطن والـ Core",
    muscle: "Core",
    image: "/core/core1.png",
    tips: "Hold a straight line from head to heels. Don't let hips sag. Engage abs throughout.",
    video: "https://www.youtube.com/results?search_query=plank+form+tips",
    default_sets: 3,
    default_reps: 1, // 1 = hold (time-based)
  },
  {
    id: "chest_incline_machine_press",
    name: "Incline Machine Press",
    nameAr: "ضغط صدر عالي على الجهاز",
    muscle: "Chest",
    image: "/new/chest_machine_press.png",
    tips: "Adjust seat so handles are at upper-chest level. Press and squeeze at the top.",
    video:
      "https://www.youtube.com/results?search_query=incline+machine+press+form",
    default_sets: 3,
    default_reps: 12,
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
          "chest_incline_db",       // 1. Incline Dumbbell Press
          "chest_barbell_bench",    // 2. Barbell Bench Press
          "chest_cable_fly",        // 3. High-to-Low Cable Fly
          "sh_seated_db_press",     // 4. Seated Dumbbell Shoulder Press
          "sh_lateral_raise",       // 5. Lateral Raises
          "arm_tricep_pushdown",    // 6. Rope Pushdown
          "chest_dips",             // 7. Dips - Chest Version
        ],
      },
      pull_day: {
        id: "pull_day",
        name: "Pull Day",
        nameAr: "الظهر بالكامل، الكتف الخلفي، البايسبس، السواعد",
        muscles: ["Back", "Shoulders", "Arms"],
        exercises: [
          "back_lat_pulldown",      // 1. Lat Pulldown
          "back_cable_row",         // 2. Seated Cable Row
          "back_db_pullover",       // 3. Dumbbell Pullover
          "sh_reverse_fly",         // 4. Rear Delt Fly
          "arm_barbell_curl",       // 5. Barbell Bicep Curl
          "arm_hammer_curl",        // 6. Hammer Curls
          "back_extensions",        // 7. Hyperextension
        ],
      },
      legs_day: {
        id: "legs_day",
        name: "Leg Day",
        nameAr: "الفخذ الأمامي، الخلفيات، السمانة، والبطن",
        muscles: ["Legs", "Core"],
        exercises: [
          "leg_squat",              // 1. Barbell Squat / Hack Squat
          "leg_press",              // 2. Leg Press
          "leg_extension",          // 3. Leg Extension
          "leg_rdl",                // 4. Romanian Deadlift (RDL)
          "leg_calf_raise",         // 5. Standing/Seated Calf Raise
          "core_hanging_leg_raise", // 6. Hanging Leg Raise
          "core_plank",             // 7. Plank
        ],
      },
      upper_day: {
        id: "upper_day",
        name: "Upper Body",
        nameAr: "جزء علوي كامل - ضخ دم وعزل",
        muscles: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
          "chest_pec_deck",                // 1. Pec Deck Fly
          "chest_incline_machine_press",   // 2. Incline Machine Press
          "back_straight_arm_pulldown",    // 3. Straight Arm Pulldown
          "back_single_db_row",            // 4. One-Arm Dumbbell Row
          "back_face_pulls",               // 5. Face Pulls
          "arms_preacher_curl",            // 6. Preacher Curl
          "arms_skull_crushers",           // 7. Skull Crushers
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
          "chest_barbell_bench",
          "chest_incline_db",
          "chest_cable_fly",
          "chest_pec_deck",
          "chest_flat_db_fly",
          "chest_dips",
        ],
      },
      back_day: {
        id: "back_day",
        name: "Back Day",
        nameAr: "يوم الظهر",
        muscles: ["Back"],
        exercises: [
          "back_lat_pulldown",
          "back_bent_row",
          "back_cable_row",
          "back_single_db_row",
          "back_face_pulls",
          "back_extensions",
        ],
      },
      shoulder_day: {
        id: "shoulder_day",
        name: "Shoulder Day",
        nameAr: "يوم الكتف",
        muscles: ["Shoulders"],
        exercises: [
          "sh_overhead_press",
          "sh_lateral_raise",
          "sh_front_raise",
          "sh_reverse_fly",
          "sh_arnold_press",
          "sh_shrugs",
        ],
      },
      bro_leg_day: {
        id: "bro_leg_day",
        name: "Leg Day",
        nameAr: "يوم الأرجل",
        muscles: ["Legs"],
        exercises: [
          "leg_squat",
          "leg_press",
          "leg_rdl",
          "leg_curl",
          "leg_adductor",
          "leg_calf_raise",
        ],
      },
      arm_day: {
        id: "arm_day",
        name: "Arm Day",
        nameAr: "يوم الذراعين",
        muscles: ["Arms"],
        exercises: [
          // Bicep (4)
          "arm_barbell_curl",
          "arm_hammer_curl",
          "arm_incline_curl",
          "arms_preacher_curl",
          // Tricep (4)
          "arm_tricep_pushdown",
          "arm_overhead_ext",
          "arm_close_grip_bench",
          "arms_skull_crushers",
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
