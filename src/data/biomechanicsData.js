/**
 * Sports Biomechanics Knowledge Base
 * Defines anatomical target subdivisions, synergists, joint actions,
 * starting/ending alignments, execution cues, and common mistakes.
 */

export const exerciseBiomechanics = {
  // ── CHEST ──
  chest_bb_flat_bench: {
    primaryTarget: "Pectoralis Major (Sternal Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids", "Serratus Anterior"],
    jointAction: "Horizontal Shoulder Adduction + Elbow Extension",
    setupAlignment: "5-point bench contact, scapulae retracted, eyes below bar",
    executionCues: [
      "Retract and depress scapulae firmly against the bench pad.",
      "Tuck elbows at ~45° to avoid acromial impingement.",
      "Lower bar under control to lower sternum; drive up through midfoot arch."
    ],
    commonMistakes: [
      "Flaring elbows at 90°, transferring shear stress to anterior capsule.",
      "Bouncing barbell off sternum creating momentum rather than tension.",
      "Lifting hips off the bench during the lockout phase."
    ],
  },
  chest_db_flat_press: {
    primaryTarget: "Pectoralis Major (Mid / Sternal Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids"],
    jointAction: "Horizontal Shoulder Adduction with Converging Arc",
    setupAlignment: "Dumbbells stacked directly over vertical forearms",
    executionCues: [
      "Keep wrists neutral and stacked over elbows throughout the press.",
      "Lower dumbbells until thumbs align with chest line for deep stretch.",
      "Press in a gentle converging arc without clacking the weights together."
    ],
    commonMistakes: [
      "Allowing forearms to tilt inward or outward losing perpendicular force line.",
      "Cutting the bottom range of motion short, missing maximum muscle stretch."
    ],
  },
  chest_bb_incline_press: {
    primaryTarget: "Pectoralis Major (Clavicular Head)",
    secondaryMuscles: ["Anterior Deltoids", "Triceps Brachii"],
    jointAction: "Shoulder Flexion + Horizontal Adduction at 30-45°",
    setupAlignment: "Bench angle set between 30° and 45°",
    executionCues: [
      "Set bench to 30-45°; steeper angles shift excessive load to front delts.",
      "Lower bar smoothly to the clavicle / upper chest line.",
      "Drive straight up over the face and upper chest."
    ],
    commonMistakes: [
      "Using a 60° incline which turns the movement into a shoulder press.",
      "Excessive lower back arching turning the incline into a flat press."
    ],
  },
  chest_db_incline_press: {
    primaryTarget: "Pectoralis Major (Upper Clavicular Head)",
    secondaryMuscles: ["Anterior Deltoids", "Triceps Brachii"],
    jointAction: "Converging Incline Shoulder Adduction",
    setupAlignment: "30° incline bench, dumbbells neutral on knee kick-up",
    executionCues: [
      "Allow slight pronation at the top for peak upper pectoral contraction.",
      "Keep chest expanded and shoulders packed back into the bench."
    ],
    commonMistakes: [
      "Dropping elbows too low creating excessive shoulder extension shear.",
      "Pressing dumbbells outward instead of inward along the clavicular plane."
    ],
  },
  chest_machine_incline_press: {
    primaryTarget: "Pectoralis Major (Upper Clavicular Head)",
    secondaryMuscles: ["Anterior Deltoids", "Triceps Brachii"],
    jointAction: "Guided Fixed-Plane Incline Adduction",
    setupAlignment: "Seat height adjusted so handles align at upper chest height",
    executionCues: [
      "Adjust seat so grips align with the upper clavicular line.",
      "Maintain active tension at full extension without unlocking shoulder blades."
    ],
    commonMistakes: [
      "Shoulders rolling forward at lockout losing scapular stability.",
      "Letting the weight stack slam at the bottom of the rep."
    ],
  },
  chest_machine_flat_press: {
    primaryTarget: "Pectoralis Major (Sternal Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids"],
    jointAction: "Guided Horizontal Push",
    setupAlignment: "Seat positioned so handles align at nipple line",
    executionCues: [
      "Drive back into the pad, driving hands through the machine handles.",
      "Pause for 1 second at full chest contraction."
    ],
    commonMistakes: [
      "Pushing with rounded shoulders rather than locked scapulae."
    ],
  },
  chest_bb_decline_press: {
    primaryTarget: "Pectoralis Major (Costal / Lower Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids"],
    jointAction: "Declined Shoulder Adduction",
    setupAlignment: "Legs locked into decline bench rollers at 15-30°",
    executionCues: [
      "Secure legs tightly in roller pads before unhooking the barbell.",
      "Lower bar to the inframammary fold / lower sternum."
    ],
    commonMistakes: [
      "Rushing the descent and losing bar path trajectory over the neck."
    ],
  },
  chest_db_decline_press: {
    primaryTarget: "Pectoralis Major (Lower Costal Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids"],
    jointAction: "Declined Free Weight Adduction",
    setupAlignment: "15-30° decline bench, dumbbells held with neutral-to-pronated grip",
    executionCues: [
      "Lower dumbbells with deep stretch on the inferior pectoral margin.",
      "Press vertically relative to torso angle."
    ],
    commonMistakes: [
      "Allowing weights to drift backward over the head."
    ],
  },
  chest_high_to_low_cable_fly: {
    primaryTarget: "Pectoralis Major (Lower Costal Head)",
    secondaryMuscles: ["Anterior Deltoids", "Serratus Anterior"],
    jointAction: "Downward Diagonal Shoulder Adduction",
    setupAlignment: "Pulleys set above head height, staggered athletic stance",
    executionCues: [
      "Slight forward torso lean with soft elbow bend.",
      "Bring hands together in a downward scoop toward the groin.",
      "Cross hands slightly at peak contraction for extreme costal squeeze."
    ],
    commonMistakes: [
      "Bending and straightening elbows turning the fly into a press.",
      "Swinging torso back and forth using momentum."
    ],
  },
  chest_low_to_high_cable_fly: {
    primaryTarget: "Pectoralis Major (Clavicular & Sternal Head)",
    secondaryMuscles: ["Anterior Deltoids", "Biceps Short Head"],
    jointAction: "Upward Diagonal Shoulder Adduction",
    setupAlignment: "Pulleys at lowest setting, supinated palms facing upward",
    executionCues: [
      "Sweep hands upward and inward toward chin level.",
      "Keep chest proud and focus on clavicular fiber contraction."
    ],
    commonMistakes: [
      "Using front delts to jerk the cables upward.",
      "Excessive bend in arms reducing the lever arm."
    ],
  },
  chest_pec_deck_fly: {
    primaryTarget: "Pectoralis Major (Transverse Adduction Squeeze)",
    secondaryMuscles: ["Anterior Deltoids"],
    jointAction: "Pure Transverse Horizontal Adduction",
    setupAlignment: "Seat adjusted so elbows are level with mid-chest",
    executionCues: [
      "Keep elbows slightly bent and fixed in space.",
      "Squeeze pads/handles together in front of sternum, hold for 1 count.",
      "Resist the negative phase for a 3-second eccentric stretch."
    ],
    commonMistakes: [
      "Allowing shoulders to protract and shrug forward at the front.",
      "Overextending elbows behind the shoulder plane causing capsule strain."
    ],
  },
  chest_dips: {
    primaryTarget: "Pectoralis Major (Lower Costal Head)",
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoids"],
    jointAction: "Closed Kinetic Chain Shoulder Extension & Adduction",
    setupAlignment: "Arms on parallel bars, torso tilted forward ~30°",
    executionCues: [
      "Lean torso forward 30° to bias pectorals over triceps.",
      "Lower until upper arms are parallel to floor (90° elbow bend).",
      "Press up while keeping elbows slightly flared to load lower chest."
    ],
    commonMistakes: [
      "Staying completely upright which turns the exercise into a tricep dip.",
      "Descending too deep past shoulder mobility limits."
    ],
  },

  // ── BACK ──
  back_wide_lat_pulldown: {
    primaryTarget: "Latissimus Dorsi (Upper Width & Teres Major)",
    secondaryMuscles: ["Biceps Brachii", "Brachialis", "Rhomboids", "Posterior Deltoids"],
    jointAction: "Frontal Plane Shoulder Adduction + Scapular Depression",
    setupAlignment: "Thigh pads locked tight, grip 1.5x shoulder width",
    executionCues: [
      "Slight 10-15° torso lean; lead the pull with your elbows, not hands.",
      "Drive elbows downward and slightly backward toward ribcage.",
      "Touch bar to upper chest; control the eccentric stretch to full lockout."
    ],
    commonMistakes: [
      "Yanking the bar down with excessive torso swing.",
      "Pulling behind the neck which exposes rotator cuff to impingement.",
      "Grip too wide reducing effective range of motion."
    ],
  },
  back_close_grip_pulldown: {
    primaryTarget: "Latissimus Dorsi (Lower Lat Insertion)",
    secondaryMuscles: ["Biceps Brachii", "Brachioradialis", "Mid-Traps"],
    jointAction: "Sagittal Shoulder Extension + Scapular Retraction",
    setupAlignment: "V-bar attachment connected, torso upright",
    executionCues: [
      "Pull V-bar down toward upper sternum while driving chest forward.",
      "Focus on elbow drive directly into sides."
    ],
    commonMistakes: [
      "Rounding shoulders forward at the bottom.",
      "Leaning back 45° turning the pulldown into a row."
    ],
  },
  back_pullups: {
    primaryTarget: "Latissimus Dorsi (Full Lat Sweep)",
    secondaryMuscles: ["Biceps Brachii", "Rhomboids", "Forearms", "Core"],
    jointAction: "Closed-Chain Vertical Pull",
    setupAlignment: "Overhand grip slightly wider than shoulder width",
    executionCues: [
      "Initiate from a dead hang by depressing scapulae down first.",
      "Drive chest up toward the bar, pulling elbows toward hips."
    ],
    commonMistakes: [
      "Kipping or swinging legs to generate upward momentum.",
      "Only performing half-reps without full elbow extension at the bottom."
    ],
  },
  back_bb_bent_over_row: {
    primaryTarget: "Mid Back (Latissimus Dorsi & Rhomboids)",
    secondaryMuscles: ["Trapezius (Mid/Lower)", "Posterior Deltoids", "Erector Spinae", "Biceps"],
    jointAction: "Horizontal Shoulder Abduction/Extension + Scapular Retraction",
    setupAlignment: "Hips hinged at 45°, neutral spine, knees softly flexed",
    executionCues: [
      "Lock spine in neutral and hinge hips back to 45° angle.",
      "Pull bar toward lower abdomen / navel; keep elbows tucked.",
      "Squeeze shoulder blades together hard at the top."
    ],
    commonMistakes: [
      "Standing up excessively during the pull turning it into a shrug.",
      "Rounding the lumbar spine under heavy loads.",
      "Jerking knees and hips to throw the weight up."
    ],
  },
  back_tbar_row: {
    primaryTarget: "Mid Back & Lat Thickness",
    secondaryMuscles: ["Rhomboids", "Biceps", "Posterior Delts"],
    jointAction: "Neutral-Grip Horizontal Pull",
    setupAlignment: "Feet on platform, chest up, neutral lumbar curve",
    executionCues: [
      "Use V-grip handle; maintain firm foot contact with platform.",
      "Pull weight smoothly toward belt buckle."
    ],
    commonMistakes: [
      "Using plates that are too large in diameter, restricting full ROM."
    ],
  },
  back_seated_cable_row: {
    primaryTarget: "Mid-Trapezius & Rhomboids",
    secondaryMuscles: ["Latissimus Dorsi", "Biceps", "Forearms"],
    jointAction: "Horizontal Cable Pull with Scapular Protraction/Retraction",
    setupAlignment: "Knees slightly bent on footplates, chest vertical",
    executionCues: [
      "Allow full scapular protraction at the stretch without rounding lower back.",
      "Pull handle to mid-abdomen while puffing chest forward.",
      "Hold the peak contraction for 1 second."
    ],
    commonMistakes: [
      "Rocking torso backward and forward like a rowing machine.",
      "Shrugging shoulders into ears at contraction."
    ],
  },
  back_db_single_arm_row: {
    primaryTarget: "Latissimus Dorsi (Lower Iliocostal Fibers)",
    secondaryMuscles: ["Rhomboids", "Biceps Brachii", "Core Obliques"],
    jointAction: "Unilateral Sagittal Shoulder Extension",
    setupAlignment: "Opposite knee and hand braced firmly on flat bench",
    executionCues: [
      "Brace on bench with flat back parallel to floor.",
      "Pull dumbbell along a sweeping J-curve back toward hip crease.",
      "Keep elbow tight to body for maximum lower lat activation."
    ],
    commonMistakes: [
      "Rotating torso aggressively to swing the dumbbell up.",
      "Pulling straight up toward shoulder instead of back toward hip."
    ],
  },
  back_chest_supported_row: {
    primaryTarget: "Upper Back & Mid-Traps",
    secondaryMuscles: ["Rhomboids", "Rear Deltoids", "Biceps"],
    jointAction: "Isolated Horizontal Retraction without Lumbar Fatigue",
    setupAlignment: "Chest flat against incline pad, arms fully extended",
    executionCues: [
      "Keep sternum pressed into pad to eliminate axial lumbar fatigue.",
      "Retract scapulae fully at top."
    ],
    commonMistakes: [
      "Lifting chest off the pad to cheat the rep."
    ],
  },
  back_straight_arm_pulldown: {
    primaryTarget: "Latissimus Dorsi (Pure Shoulder Extension Isolation)",
    secondaryMuscles: ["Teres Major", "Triceps Long Head", "Abs"],
    jointAction: "Isolated Shoulder Extension in Sagittal Plane",
    setupAlignment: "Standing tall with slight hip hinge, arms nearly straight",
    executionCues: [
      "Lock elbows with a slight micro-bend and keep them frozen.",
      "Drive bar in an arc downward until it contacts thighs.",
      "Control the bar back up to eye level for full lat stretch."
    ],
    commonMistakes: [
      "Bending elbows and turning the movement into a tricep pushdown.",
      "Shrugging traps during the eccentric stretch."
    ],
  },
  back_db_pullover: {
    primaryTarget: "Latissimus Dorsi & Serratus Anterior",
    secondaryMuscles: ["Pectoralis Minor", "Triceps Long Head"],
    jointAction: "Shoulder Flexion to Extension Arc Over Bench",
    setupAlignment: "Upper back positioned perpendicularly across flat bench",
    executionCues: [
      "Keep hips low to anchor lats; hold dumbbell under inner plate with both hands.",
      "Lower weight behind head until deep lat stretch is achieved.",
      "Pull dumbbell back over face using lats, stopping at forehead line."
    ],
    commonMistakes: [
      "Excessive elbow bending turning movement into skull crushers.",
      "Rising hips during the pull reducing lat stretch."
    ],
  },
  back_face_pulls: {
    primaryTarget: "Posterior Deltoids & Upper Trapezius / Infraspinatus",
    secondaryMuscles: ["Rhomboids", "Teres Minor"],
    jointAction: "Horizontal Abduction + External Shoulder Rotation",
    setupAlignment: "Rope cable set at eye height, thumbs positioned backward",
    executionCues: [
      "Set rope at eye level; grip with thumbs facing your face.",
      "Pull rope toward bridge of nose while separating hands apart.",
      "Externally rotate shoulders at the finish (double biceps pose)."
    ],
    commonMistakes: [
      "Pulling downward to chest instead of backward to eyes/ears.",
      "Using too much weight causing body momentum and internal rotation."
    ],
  },
  back_hyperextension: {
    primaryTarget: "Erector Spinae & Gluteus Maximus",
    secondaryMuscles: ["Hamstrings"],
    jointAction: "Hip Extension + Spinal Extension",
    setupAlignment: "45° hyperextension bench, hip pad below anterior superior iliac spine",
    executionCues: [
      "Hinge at hips with neutral spine until hamstrings stretch.",
      "Contract glutes and lower back to return to straight alignment."
    ],
    commonMistakes: [
      "Hyperextending spine violently past neutral alignment.",
      "Using jerky ballistic bounce at the bottom."
    ],
  },

  // ── SHOULDERS ──
  sh_seated_db_press: {
    primaryTarget: "Anterior Deltoids & Lateral Deltoids",
    secondaryMuscles: ["Triceps Brachii", "Upper Trapezius"],
    jointAction: "Vertical Overhead Pressing",
    setupAlignment: "Bench backrest at 75-80°, dumbbells at ear level",
    executionCues: [
      "Set bench at 75-80° (slight incline protects acromion).",
      "Press dumbbells vertically without banging them at top.",
      "Lower dumbbells with control until level with ears."
    ],
    commonMistakes: [
      "Pressing with completely flat elbows flared 180 degrees.",
      "Hyperextending lower back to turn it into an incline press."
    ],
  },
  sh_standing_bb_ohp: {
    primaryTarget: "Anterior Deltoids (Compound Overhead Drive)",
    secondaryMuscles: ["Lateral Deltoids", "Triceps Brachii", "Core", "Glutes"],
    jointAction: "Compound Overhead Pressing in Standing Position",
    setupAlignment: "Grip just outside shoulder width, bar on front clavicles",
    executionCues: [
      "Squeeze glutes and brace core; elbows slightly forward of bar.",
      "Press bar straight up, tilting head back slightly to clear chin.",
      "Lock out directly overhead with head moving through the window."
    ],
    commonMistakes: [
      "Leaning back excessively into a standing incline bench press.",
      "Pressing bar in a wide looping path around the head."
    ],
  },
  sh_machine_shoulder_press: {
    primaryTarget: "Anterior Deltoids",
    secondaryMuscles: ["Lateral Delts", "Triceps Brachii"],
    jointAction: "Guided Vertical Pressing",
    setupAlignment: "Seat adjusted so handles begin at chin level",
    executionCues: [
      "Keep back pinned against pad; drive smoothly through handles.",
      "Control the eccentric descent."
    ],
    commonMistakes: [
      "Setting seat too low causing extreme shoulder joint compression."
    ],
  },
  sh_arnold_press: {
    primaryTarget: "Anterior & Lateral Deltoids (Multi-Plane)",
    secondaryMuscles: ["Triceps Brachii", "Rotator Cuff"],
    jointAction: "Overhead Pressing with External Arm Rotation",
    setupAlignment: "Seated upright, dumbbells held supinated in front of chest",
    executionCues: [
      "Start with dumbbells in front of chest, palms facing you.",
      "As you press up, rotate wrists outward so palms face forward at top.",
      "Reverse rotation smoothly on the way down."
    ],
    commonMistakes: [
      "Rushing rotation before elbows clear the torso.",
      "Using too much weight and dropping elbows below chest."
    ],
  },
  sh_db_lateral_raise: {
    primaryTarget: "Lateral Deltoids (Acromial Head)",
    secondaryMuscles: ["Anterior Delts", "Supraspinatus", "Upper Traps"],
    jointAction: "Coronal Plane Shoulder Abduction to 90°",
    setupAlignment: "Standing with slight 10° forward hip hinge",
    executionCues: [
      "Lean forward 10°; initiate raise with elbows rather than hands.",
      "Raise arms in the scapular plane (~30° forward of pure side).",
      "Stop when elbows reach shoulder height (90°)."
    ],
    commonMistakes: [
      "Shrugging traps to heave weights up.",
      "Swinging torso forward and back using momentum.",
      "Raising hands higher than elbows (internal rotation trap)."
    ],
  },
  sh_cable_lateral_raise: {
    primaryTarget: "Lateral Deltoids (Constant Cable Tension)",
    secondaryMuscles: ["Upper Traps", "Supraspinatus"],
    jointAction: "Cable Shoulder Abduction with Peak Early Tension",
    setupAlignment: "Cable pulley set at wrist/knee height, cable across body",
    executionCues: [
      "Set pulley at mid-shin or wrist height for optimal resistance profile.",
      "Raise arm across body outward to 90°.",
      "Slow 3-second negative down to hip."
    ],
    commonMistakes: [
      "Twisting torso to jerk cable off the stack."
    ],
  },
  sh_machine_lateral_raise: {
    primaryTarget: "Lateral Deltoids (Direct Arm Pad Resistance)",
    secondaryMuscles: ["Supraspinatus"],
    jointAction: "Isolated Shoulder Abduction with Elbow Pad Load",
    setupAlignment: "Machine axis of rotation aligned directly with shoulder joint",
    executionCues: [
      "Align shoulder joint with machine pivot axis.",
      "Push outward against pads with delts."
    ],
    commonMistakes: [
      "Gripping handles too tightly and pulling with forearms."
    ],
  },
  sh_reverse_pec_deck: {
    primaryTarget: "Posterior Deltoids (Rear Delts)",
    secondaryMuscles: ["Rhomboids", "Infraspinatus", "Mid-Traps"],
    jointAction: "Horizontal Shoulder Abduction",
    setupAlignment: "Chest against pad, handles at shoulder height",
    executionCues: [
      "Seat height set so handles are level with mouth / shoulders.",
      "Drive elbows straight back horizontally with slight micro-bend.",
      "Focus on rear delts rather than squeezing shoulder blades."
    ],
    commonMistakes: [
      "Shrugging shoulders into ears.",
      "Bending elbows excessively and turning it into a row."
    ],
  },
  sh_bent_over_db_raise: {
    primaryTarget: "Posterior Deltoids",
    secondaryMuscles: ["Rhomboids", "Trapezius"],
    jointAction: "Bent-Over Horizontal Shoulder Abduction",
    setupAlignment: "Hips hinged 90° parallel to floor",
    executionCues: [
      "Hinge until torso is nearly parallel to floor.",
      "Fly dumbbells out to sides leading with pinkies."
    ],
    commonMistakes: [
      "Standing up too tall shifting load to lateral delts."
    ],
  },
  sh_cable_rear_delt_fly: {
    primaryTarget: "Posterior Deltoids",
    secondaryMuscles: ["Infraspinatus", "Rhomboids"],
    jointAction: "Cable Horizontal Abduction Crossing Midline",
    setupAlignment: "Dual high pulleys without handles, cables crossed",
    executionCues: [
      "Hold left cable with right hand, right cable with left hand.",
      "Pull outward and backward in a sweeping horizontal arc."
    ],
    commonMistakes: [
      "Allowing cables to pull arms forward abruptly."
    ],
  },
  sh_db_shrugs: {
    primaryTarget: "Upper Trapezius",
    secondaryMuscles: ["Levator Scapulae"],
    jointAction: "Pure Scapular Elevation",
    setupAlignment: "Dumbbells held at sides with neutral grip",
    executionCues: [
      "Shrug shoulders straight up toward ears.",
      "Hold peak elevation for 2 seconds; lower under control."
    ],
    commonMistakes: [
      "Rolling shoulders in circles which grinds the acromioclavicular joint.",
      "Using excessive weight and bending elbows to fake elevation."
    ],
  },
  sh_bb_shrugs: {
    primaryTarget: "Upper Trapezius",
    secondaryMuscles: ["Forearms", "Levator Scapulae"],
    jointAction: "Barbell Scapular Elevation",
    setupAlignment: "Shoulder-width overhand grip, barbell hanging in front of thighs",
    executionCues: [
      "Elevate scapulae straight up in a vertical line.",
      "Pause for 2 full seconds at the top."
    ],
    commonMistakes: [
      "Rolling neck forward causing cervical spine strain."
    ],
  },

  // ── LEGS ──
  leg_bb_back_squat: {
    primaryTarget: "Quadriceps & Gluteus Maximus",
    secondaryMuscles: ["Hamstrings", "Adductor Magnus", "Erector Spinae", "Core"],
    jointAction: "Knee Extension + Hip Extension + Ankle Dorsiflexion",
    setupAlignment: "Bar resting on mid-traps (high-bar) or rear delts (low-bar)",
    executionCues: [
      "Feet shoulder-width apart, toes angled out 15-30°.",
      "Inhale into belly, brace core, and break at hips and knees simultaneously.",
      "Descend until hip crease is below top of knees (parallel).",
      "Drive up through midfoot while keeping chest proud."
    ],
    commonMistakes: [
      "Knees caving inward (valgus collapse) on the ascent.",
      "Heels lifting off the ground due to poor ankle dorsiflexion.",
      "Rounding lower back at the bottom (butt wink)."
    ],
  },
  leg_hack_squat: {
    primaryTarget: "Quadriceps (Vastus Lateralis & Medialis)",
    secondaryMuscles: ["Gluteus Maximus"],
    jointAction: "Guided Knee Extension with Supported Back",
    setupAlignment: "Back and head flat against hack squat carriage pad",
    executionCues: [
      "Place feet low on platform for maximum quad bias.",
      "Descend smoothly to full knee flexion depth.",
      "Drive carriage up without violently hyperextending knees at top."
    ],
    commonMistakes: [
      "Feet placed too high shifting load entirely to glutes.",
      "Bouncing off safety stops at the bottom."
    ],
  },
  leg_45_press: {
    primaryTarget: "Quadriceps & Gluteus Maximus",
    secondaryMuscles: ["Hamstrings", "Adductors"],
    jointAction: "45-Degree Leg Press Extension",
    setupAlignment: "Glutes and lumbar spine firmly pinned into seat corner",
    executionCues: [
      "Keep lower back flat against seat; never allow pelvis to curl under.",
      "Lower sled until knees reach 90° angle.",
      "Press through midfoot; stop just short of knee joint lockout."
    ],
    commonMistakes: [
      "Allowing tailbone to lift off pad under heavy weight causing herniation risk.",
      "Slamming knees into hard hyperextension lockout."
    ],
  },
  leg_extension: {
    primaryTarget: "Quadriceps (Rectus Femoris Isolation)",
    secondaryMuscles: ["Vastus Intermedius"],
    jointAction: "Open Kinetic Chain Knee Extension",
    setupAlignment: "Pad sitting on lower shins just above ankles, back pad snug",
    executionCues: [
      "Set knee axis directly aligned with machine pivot point.",
      "Extend knees fully and pause for 1 second at top contraction.",
      "Control the descent for 3 seconds; do not let weights slam."
    ],
    commonMistakes: [
      "Kicking weights up rapidly using ballistic momentum.",
      "Seat set too far forward causing pad to slide up thighs."
    ],
  },
  leg_bulgarian_split_squat: {
    primaryTarget: "Quadriceps & Gluteus Medius/Maximus (Unilateral)",
    secondaryMuscles: ["Hamstrings", "Adductors", "Calves"],
    jointAction: "Single-Leg Knee & Hip Extension",
    setupAlignment: "Rear foot elevated on bench, forward foot 2-3 feet ahead",
    executionCues: [
      "Elevate rear foot on bench; keep front shin relatively vertical.",
      "Lower rear knee straight down toward the floor.",
      "Drive through front heel to return to top."
    ],
    commonMistakes: [
      "Forward knee caving inward under unilateral load.",
      "Front foot placed too close to bench causing extreme heel lift."
    ],
  },
  leg_walking_lunges: {
    primaryTarget: "Quadriceps & Glutes (Dynamic Dynamic Drive)",
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    jointAction: "Alternating Dynamic Hip/Knee Extension",
    setupAlignment: "Dumbbells held at sides, tall upright posture",
    executionCues: [
      "Take comfortable stride forward, lowering back knee near floor.",
      "Drive upward and step straight into the next repetition."
    ],
    commonMistakes: [
      "Slamming back knee hard onto the floor.",
      "Torso collapsing forward over the front knee."
    ],
  },
  leg_bb_rdl: {
    primaryTarget: "Hamstrings (Lengthened Range) & Gluteus Maximus",
    secondaryMuscles: ["Erector Spinae", "Adductor Magnus", "Forearms"],
    jointAction: "Hip Hinge in Sagittal Plane with Fixed Soft Knees",
    setupAlignment: "Feet hip-width apart, overhand grip on barbell",
    executionCues: [
      "Soft micro-bend in knees (keep knee angle fixed throughout).",
      "Push hips as far back toward the wall behind you as possible.",
      "Keep bar sliding along thighs and shins.",
      "Stop when hips cannot travel further back; squeeze glutes to stand."
    ],
    commonMistakes: [
      "Bending knees more and turning the movement into a conventional deadlift.",
      "Rounding lumbar spine to reach the floor with the bar.",
      "Letting bar drift away from shins creating excessive spinal lever arm."
    ],
  },
  leg_db_rdl: {
    primaryTarget: "Hamstrings & Glutes",
    secondaryMuscles: ["Erector Spinae", "Forearms"],
    jointAction: "Dumbbell Hip Hinge",
    setupAlignment: "Dumbbells held in front of thighs, shoulder-width stance",
    executionCues: [
      "Hinge hips back while keeping dumbbells glued to shins.",
      "Focus on the deep hamstring stretch at mid-shin level."
    ],
    commonMistakes: [
      "Squatting down instead of pushing hips backward."
    ],
  },
  leg_lying_curl: {
    primaryTarget: "Hamstrings (Biceps Femoris & Semitendinosus)",
    secondaryMuscles: ["Gastrocnemius"],
    jointAction: "Prone Knee Flexion",
    setupAlignment: "Prone on bench, roller pad on Achilles tendon area",
    executionCues: [
      "Keep hips pushed down firmly into the bench pad.",
      "Curl heels up toward glutes and pause for 1 count.",
      "Lower slowly; do not let the weight stack touch between reps."
    ],
    commonMistakes: [
      "Lifting hips off the bench to assist the curl.",
      "Kicking weights up rapidly."
    ],
  },
  leg_seated_curl: {
    primaryTarget: "Hamstrings (Biomechanical Peak Stretch in Hip Flexion)",
    secondaryMuscles: ["Gastrocnemius"],
    jointAction: "Seated Knee Flexion with Pre-Stretched Hip Angle",
    setupAlignment: "Thigh restraint pad locked tight, back firmly supported",
    executionCues: [
      "Fasten thigh pad tight against quads to prevent upward lifting.",
      "Curl legs downward and backward under the seat.",
      "Hold full contraction for 1 count."
    ],
    commonMistakes: [
      "Thigh pad too loose allowing pelvis to rise."
    ],
  },
  leg_standing_calf_raise: {
    primaryTarget: "Gastrocnemius (Lateral & Medial Heads)",
    secondaryMuscles: ["Soleus", "Tibialis Posterior"],
    jointAction: "Straight-Leg Ankle Plantarflexion",
    setupAlignment: "Balls of feet on edge of block, knees straight but not locked",
    executionCues: [
      "Lower heels deeply below the block for full 2-second calf stretch.",
      "Drive up onto big toes for maximum plantarflexion.",
      "Hold top peak contraction for 1 full second."
    ],
    commonMistakes: [
      "Bouncing fast at the bottom using Achilles tendon elasticity.",
      "Bending knees during the press turning off gastrocnemius."
    ],
  },
  leg_seated_calf_raise: {
    primaryTarget: "Soleus (Deep Calf Muscle)",
    secondaryMuscles: ["Gastrocnemius"],
    jointAction: "Bent-Knee Ankle Plantarflexion",
    setupAlignment: "Knees bent at 90°, thigh pad secured over lower quads",
    executionCues: [
      "With knees at 90°, gastrocnemius is slackened, directly isolating soleus.",
      "Perform full deep stretch and complete peak contraction."
    ],
    commonMistakes: [
      "Cutting the bottom stretch short."
    ],
  },

  // ── ARMS ──
  arm_bb_bicep_curl: {
    primaryTarget: "Biceps Brachii (Short Head / Inner Width)",
    secondaryMuscles: ["Brachialis", "Forearm Flexors"],
    jointAction: "Supinated Elbow Flexion",
    setupAlignment: "Shoulder-width underhand grip, elbows pinned to sides",
    executionCues: [
      "Pin elbows against ribcage; do not let them drift forward.",
      "Curl bar up in a smooth arc without swinging hips.",
      "Lower with controlled 3-second eccentric tempo."
    ],
    commonMistakes: [
      "Swinging torso back and using hip momentum.",
      "Allowing elbows to flare outward or drift forward excessively."
    ],
  },
  arm_db_incline_curl: {
    primaryTarget: "Biceps Brachii (Long Head / Peak Hypertrophy)",
    secondaryMuscles: ["Brachialis", "Forearms"],
    jointAction: "Elbow Flexion in Shoulder Hyperextension",
    setupAlignment: "Bench angled at 45-60°, arms hanging straight down",
    executionCues: [
      "Set bench to 45-60°; let arms hang fully perpendicular to floor.",
      "Curl dumbbells up while keeping elbows behind torso line.",
      "Supinate wrists (turn pinkies up) as you reach the top."
    ],
    commonMistakes: [
      "Pulling elbows forward into shoulder flexion, taking tension off long head."
    ],
  },
  arm_preacher_curl: {
    primaryTarget: "Biceps Brachii (Short Head & Bottom Lengthened Range)",
    secondaryMuscles: ["Brachialis"],
    jointAction: "Preacher Bench Isolated Elbow Flexion",
    setupAlignment: "Armpits snug against top of preacher pad, chest braced",
    executionCues: [
      "Keep armpits wedged into top of pad; arms flat against incline.",
      "Curl bar up, stopping before forearms become completely vertical."
    ],
    commonMistakes: [
      "Allowing arms to hyperextend violently at the bottom risking bicep tear."
    ],
  },
  arm_db_hammer_curl: {
    primaryTarget: "Brachialis & Brachioradialis",
    secondaryMuscles: ["Biceps Brachii"],
    jointAction: "Neutral-Grip Elbow Flexion",
    setupAlignment: "Dumbbells held neutral (palms facing each other)",
    executionCues: [
      "Keep palms facing each other (neutral grip) throughout.",
      "Curl dumbbells straight up toward shoulders."
    ],
    commonMistakes: [
      "Rotating wrists during the curl losing brachialis focus."
    ],
  },
  arm_cable_rope_curl: {
    primaryTarget: "Brachialis & Biceps Peak",
    secondaryMuscles: ["Brachioradialis"],
    jointAction: "Cable Neutral-Grip Flexion with End Flare",
    setupAlignment: "Low pulley with rope attachment",
    executionCues: [
      "Pull rope up with neutral grip; pull handles apart at top for peak squeeze."
    ],
    commonMistakes: [
      "Allowing weight stack to pull shoulders forward."
    ],
  },
  arm_concentration_curl: {
    primaryTarget: "Biceps Brachii (Short Head Peak)",
    secondaryMuscles: ["Brachialis"],
    jointAction: "Isolated Single-Arm Flexion Braced Against Thigh",
    setupAlignment: "Seated, tricep braced against inner thigh above knee",
    executionCues: [
      "Lock tricep against inner thigh; curl weight toward opposite shoulder."
    ],
    commonMistakes: [
      "Jerking torso to move the dumbbell."
    ],
  },
  arm_rope_pushdown: {
    primaryTarget: "Triceps Brachii (Lateral & Medial Heads)",
    secondaryMuscles: ["Anconeus"],
    jointAction: "Cable Elbow Extension with Terminal Flare",
    setupAlignment: "Standing tall, slight hip hinge, elbows pinned to sides",
    executionCues: [
      "Keep elbows pinned to ribcage and stationary in space.",
      "Push rope down and flare rope ends apart at bottom lockout.",
      "Hold full lockout for 1 second."
    ],
    commonMistakes: [
      "Letting elbows travel forward and backward like a pendulum.",
      "Leaning over the rope and pressing with body weight."
    ],
  },
  arm_straight_bar_pushdown: {
    primaryTarget: "Triceps Brachii (Medial & Lateral Heads)",
    secondaryMuscles: ["Anconeus"],
    jointAction: "Straight-Bar Elbow Extension",
    setupAlignment: "Overhand grip, elbows at sides",
    executionCues: [
      "Push bar straight down until arms are fully locked.",
      "Control bar back up until forearms reach parallel to floor."
    ],
    commonMistakes: [
      "Allowing wrists to buckle backward."
    ],
  },
  arm_ez_skull_crushers: {
    primaryTarget: "Triceps Brachii (Long Head)",
    secondaryMuscles: ["Lateral Head", "Medial Head"],
    jointAction: "Elbow Extension with Arms Angled Backward",
    setupAlignment: "Lying flat on bench, arms tilted ~15° backward over head",
    executionCues: [
      "Angle upper arms back ~15° from vertical to maintain constant tension.",
      "Bend elbows and lower bar toward hairline/crown of head.",
      "Extend elbows smoothly back to the starting 15° angle."
    ],
    commonMistakes: [
      "Flaring elbows wide causing elbow tendonitis.",
      "Lowering bar directly to nose/forehead vertically."
    ],
  },
  arm_overhead_cable_ext: {
    primaryTarget: "Triceps Brachii (Long Head Maximum Stretch)",
    secondaryMuscles: ["Lateral Head"],
    jointAction: "Overhead Elbow Extension",
    setupAlignment: "Facing away from high or mid cable pulley, rope behind head",
    executionCues: [
      "Lock elbows overhead; extend arms forward and upward.",
      "Slow 3-second negative feeling the stretch in the armpit."
    ],
    commonMistakes: [
      "Arching lower back under the cable load."
    ],
  },
  arm_db_overhead_ext: {
    primaryTarget: "Triceps Brachii (Long Head)",
    secondaryMuscles: ["Medial Head"],
    jointAction: "Unilateral Overhead Extension",
    setupAlignment: "Seated upright, dumbbell held overhead in one hand",
    executionCues: [
      "Lower dumbbell behind neck with deep long-head stretch.",
      "Extend arm vertically overhead."
    ],
    commonMistakes: [
      "Flaring elbow outward."
    ],
  },
  arm_close_grip_bench: {
    primaryTarget: "Triceps Brachii (Compound Drive) & Inner Chest",
    secondaryMuscles: ["Anterior Deltoids"],
    jointAction: "Compound Narrow-Grip Horizontal Press",
    setupAlignment: "Grip shoulder-width (hands ~12 inches apart), flat on bench",
    executionCues: [
      "Grip shoulder-width apart (do not go narrower than 10-12 inches).",
      "Keep elbows tightly tucked to sides on descent.",
      "Press through triceps to strong lockout."
    ],
    commonMistakes: [
      "Placing hands touching each other which wrecks wrists.",
      "Flaring elbows out."
    ],
  },

  // ── CORE ──
  core_hanging_leg_raise: {
    primaryTarget: "Rectus Abdominis (Lower Fibers) & Hip Flexors",
    secondaryMuscles: ["Obliques", "Forearms"],
    jointAction: "Posterior Pelvic Tilt + Hip Flexion",
    setupAlignment: "Hanging from pull-up bar, legs extended",
    executionCues: [
      "Initiate by curling pelvis upward toward chest, not just swinging legs.",
      "Raise toes to bar level with control."
    ],
    commonMistakes: [
      "Swinging hips back and forth using momentum."
    ],
  },
  core_captain_chair_raise: {
    primaryTarget: "Rectus Abdominis",
    secondaryMuscles: ["Hip Flexors"],
    jointAction: "Knee Raise with Forearm Support",
    setupAlignment: "Forearms braced on captain's chair pads, back flat against pad",
    executionCues: [
      "Curl knees up toward chest while rolling pelvis forward.",
      "Lower slowly without arching spine."
    ],
    commonMistakes: [
      "Only moving knees without tilting pelvis."
    ],
  },
  core_cable_kneeling_crunch: {
    primaryTarget: "Rectus Abdominis (Six-Pack Hypertrophy Under Load)",
    secondaryMuscles: ["Obliques"],
    jointAction: "Spinal Flexion Against Cable Resistance",
    setupAlignment: "Kneeling below cable pulley, rope held beside temples",
    executionCues: [
      "Hips stay fixed; flex spine and curl elbows down toward knees.",
      "Exhale forcefully on contraction."
    ],
    commonMistakes: [
      "Sitting hips down onto heels turning it into a hip hinge."
    ],
  },
  core_decline_crunch: {
    primaryTarget: "Rectus Abdominis",
    secondaryMuscles: ["Hip Flexors"],
    jointAction: "Declined Trunk Flexion",
    setupAlignment: "Decline bench, feet secured under rollers",
    executionCues: [
      "Curl ribcage toward pelvis; do not pull on head with hands."
    ],
    commonMistakes: [
      "Jerking neck with hands."
    ],
  },
  core_weighted_plank: {
    primaryTarget: "Transverse Abdominis & Deep Core Stabilizers",
    secondaryMuscles: ["Glutes", "Deltoids", "Rectus Abdominis"],
    jointAction: "Anti-Extension Isometric Core Hold",
    setupAlignment: "Prone on elbows and toes, weight plate centered on upper back",
    executionCues: [
      "Straight line from heels to head; posterior pelvic tilt with squeezed glutes.",
      "Pull elbows toward toes isometrically to amplify core tension."
    ],
    commonMistakes: [
      "Hips sagging down creating hyperextension shear on lumbar spine."
    ],
  },
  core_side_plank: {
    primaryTarget: "Internal & External Obliques",
    secondaryMuscles: ["Quadratus Lumborum", "Gluteus Medius"],
    jointAction: "Anti-Lateral Flexion Isometric Hold",
    setupAlignment: "Side-lying on forearm and edges of feet",
    executionCues: [
      "Elevate hips until body forms a straight diagonal line.",
      "Hold with steady abdominal bracing."
    ],
    commonMistakes: [
      "Hips dropping toward the floor."
    ],
  },
  core_ab_wheel_rollout: {
    primaryTarget: "Full Anterior Core Chain & Lats",
    secondaryMuscles: ["Shoulders", "Chest"],
    jointAction: "Anti-Extension Rollout & Controlled Spinal Flexion",
    setupAlignment: "Kneeling on pad, hands gripping ab wheel handles",
    executionCues: [
      "Tuck pelvis under (hollow body posture).",
      "Roll wheel out until nose nears floor; pull back with abdominal wall."
    ],
    commonMistakes: [
      "Letting lower back arch and sag into hyperextension."
    ],
  },
  core_russian_twist: {
    primaryTarget: "Obliques & Rotational Core",
    secondaryMuscles: ["Rectus Abdominis", "Hip Flexors"],
    jointAction: "Controlled Torso Rotation with Isometric Hip Flexion",
    setupAlignment: "V-sit position on floor with knees bent and feet elevated",
    executionCues: [
      "Rotate shoulders and torso side to side under control.",
      "Keep gaze following hands."
    ],
    commonMistakes: [
      "Moving arms only without rotating the ribcage."
    ],
  },
  core_woodchopper: {
    primaryTarget: "Obliques (Diagonal Power Transfer)",
    secondaryMuscles: ["Shoulders", "Core"],
    jointAction: "High-to-Low or Low-to-High Torso Rotation",
    setupAlignment: "Standing sideways to cable pulley, arms extended",
    executionCues: [
      "Rotate torso diagonally across body pivot on rear foot.",
      "Keep arms straight and drive with abdominal torque."
    ],
    commonMistakes: [
      "Bending arms and pulling with biceps."
    ],
  },
  core_lying_leg_raise: {
    primaryTarget: "Lower Rectus Abdominis",
    secondaryMuscles: ["Hip Flexors"],
    jointAction: "Supine Hip Flexion with Pelvic Roll",
    setupAlignment: "Supine on floor, hands at sides or under hips",
    executionCues: [
      "Press lower back into floor; raise legs to 90°.",
      "Lower legs slowly without lower back lifting off mat."
    ],
    commonMistakes: [
      "Lower back arching off floor during descent."
    ],
  },
  core_bicycle_crunches: {
    primaryTarget: "Obliques & Rectus Abdominis",
    secondaryMuscles: ["Hip Flexors"],
    jointAction: "Reciprocal Alternating Torso Rotation & Knee Drive",
    setupAlignment: "Supine, hands behind head, knees at 90°",
    executionCues: [
      "Touch opposite elbow to knee with complete torso rotation.",
      "Extend opposite leg straight out."
    ],
    commonMistakes: [
      "Pulling violently on cervical spine."
    ],
  },
  core_hollow_body_hold: {
    primaryTarget: "Transverse Abdominis & Gymnastic Core Compression",
    secondaryMuscles: ["Hip Flexors", "Quads"],
    jointAction: "Anti-Extension Static Gymnastic Hold",
    setupAlignment: "Supine, arms overhead, legs straight and elevated 6 inches",
    executionCues: [
      "Flatten lumbar spine completely into floor.",
      "Reach arms back and legs forward forming a shallow banana shape."
    ],
    commonMistakes: [
      "Lumbar spine peeling off floor."
    ],
  },
};
