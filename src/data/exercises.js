const exercises = [
  {
    id: "chest_press_machine",
    name: "Machine Chest Press",
    muscle: "Chest",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    tips: "Control the eccentric (lowering) phase for 2-3 seconds. Keep your shoulder blades retracted and pressed into the pad. Don't lock out elbows at the top.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "incline_db_press",
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    image:
      "https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&h=300&fit=crop",
    tips: "Set the bench to 30-45 degrees. Lower the dumbbells to nipple level. Press up in an arc, bringing the dumbbells closer together at the top.",
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    muscle: "Back",
    image:
      "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=300&fit=crop",
    tips: "Pull the bar to your upper chest, not behind your neck. Lean back slightly and squeeze your lats at the bottom. Control the weight back up.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "cable_row",
    name: "Seated Cable Row",
    muscle: "Back",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    tips: "Keep your torso upright — don't swing. Pull the handle to your lower chest/upper abdomen. Squeeze your shoulder blades together at peak contraction.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "shoulder_press_machine",
    name: "Machine Shoulder Press",
    muscle: "Shoulders",
    image:
      "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&h=300&fit=crop",
    tips: "Press up without fully locking out. Keep your core tight and back flat against the pad. Lower until your upper arms are parallel to the floor.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "lateral_raise_db",
    name: "Dumbbell Lateral Raise",
    muscle: "Shoulders",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
    tips: "Lift with a slight bend in elbows. Lead with your elbows, not your hands. Don't go above shoulder height. Use a controlled tempo.",
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscle: "Legs",
    image:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop",
    tips: "Place feet shoulder-width apart, mid-platform. Lower until knees reach 90 degrees. Don't lock your knees at the top. Keep your lower back pressed into the seat.",
    default_sets: 4,
    default_reps: 12,
  },
  {
    id: "leg_curl",
    name: "Lying Leg Curl",
    muscle: "Legs",
    image:
      "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop",
    tips: "Don't lift your hips off the pad. Curl the weight up explosively, then lower it slowly (3s eccentric). Squeeze your hamstrings at the top.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "bicep_curl_cable",
    name: "Cable Bicep Curl",
    muscle: "Arms",
    image:
      "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=300&fit=crop",
    tips: "Keep elbows pinned to your sides. Squeeze at the top for 1 second. Lower slowly — the eccentric builds muscle. Don't swing your body.",
    default_sets: 3,
    default_reps: 12,
  },
  {
    id: "tricep_pushdown",
    name: "Cable Tricep Pushdown",
    muscle: "Arms",
    image:
      "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=400&h=300&fit=crop",
    tips: "Lock your elbows in place — only your forearms should move. Squeeze at full extension. Use a rope attachment for better range of motion.",
    default_sets: 3,
    default_reps: 12,
  },
];

// Workout split programs
export const workoutPrograms = {
  upper_a: {
    id: "upper_a",
    name: "Upper Body A",
    muscles: ["Chest", "Back", "Shoulders"],
    exercises: [
      "chest_press_machine",
      "incline_db_press",
      "lat_pulldown",
      "cable_row",
      "shoulder_press_machine",
    ],
  },
  upper_b: {
    id: "upper_b",
    name: "Upper Body B",
    muscles: ["Chest", "Back", "Arms"],
    exercises: [
      "incline_db_press",
      "chest_press_machine",
      "cable_row",
      "lat_pulldown",
      "bicep_curl_cable",
      "tricep_pushdown",
    ],
  },
  lower: {
    id: "lower",
    name: "Lower Body",
    muscles: ["Legs"],
    exercises: ["leg_press", "leg_curl"],
  },
  push: {
    id: "push",
    name: "Push Day",
    muscles: ["Chest", "Shoulders", "Arms"],
    exercises: [
      "chest_press_machine",
      "incline_db_press",
      "shoulder_press_machine",
      "lateral_raise_db",
      "tricep_pushdown",
    ],
  },
  pull: {
    id: "pull",
    name: "Pull Day",
    muscles: ["Back", "Arms"],
    exercises: ["lat_pulldown", "cable_row", "bicep_curl_cable"],
  },
};

// Weekly schedule rotation
export const weeklySchedule = [
  "upper_a", // Monday
  "lower", // Tuesday
  null, // Wednesday (rest)
  "upper_b", // Thursday
  "lower", // Friday
  null, // Saturday (rest)
  null, // Sunday (rest)
];

export default exercises;
