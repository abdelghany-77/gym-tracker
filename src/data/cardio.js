// ════════════════════════════════════════════════════════════════════════════════
// CARDIO ACTIVITY DATABASE
// ════════════════════════════════════════════════════════════════════════════════

export const cardioActivities = [
  {
    id: "brisk_walking",
    name: "Brisk Walking",
    nameAr: "مشي سريع",
    description: "Sustained pace walking at 5–6 km/h",
    descriptionAr: "مشي سريع بمعدل 5–6 كم/الساعة",
    equipment: "none",
    effortLevel: "light",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🚶",
    beginnerFriendly: true,
    beginnerAlternative: null,
  },
  {
    id: "treadmill",
    name: "Treadmill",
    nameAr: "مشاية كهربائية",
    description: "Walking or jogging on a motorized treadmill",
    descriptionAr: "مشي أو هرولة على المشاية الكهربائية",
    equipment: "treadmill",
    effortLevel: "moderate",
    supportsDistance: true,
    supportsCalories: true,
    supportsIncline: true,
    icon: "🏃",
    beginnerFriendly: true,
    beginnerAlternative: null,
  },
  {
    id: "stationary_bike",
    name: "Stationary Bike",
    nameAr: "دراجة ثابتة",
    description: "Indoor cycling on a stationary bike",
    descriptionAr: "ركوب الدراجة الثابتة داخل الصالة",
    equipment: "stationary_bike",
    effortLevel: "moderate",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🚴",
    beginnerFriendly: true,
    beginnerAlternative: null,
  },
  {
    id: "outdoor_cycling",
    name: "Outdoor Cycling",
    nameAr: "دراجة خارجية",
    description: "Riding a bicycle outdoors",
    descriptionAr: "ركوب الدراجة في الهواء الطلق",
    equipment: "bicycle",
    effortLevel: "moderate",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🚲",
    beginnerFriendly: true,
    beginnerAlternative: "stationary_bike",
  },
  {
    id: "elliptical",
    name: "Elliptical",
    nameAr: "إليبتيكال",
    description: "Low-impact full-body cardio on an elliptical trainer",
    descriptionAr: "جهاز الإليبتيكال للكارديو الشامل بأثر منخفض",
    equipment: "elliptical",
    effortLevel: "moderate",
    supportsDistance: false,
    supportsCalories: true,
    icon: "🏋️",
    beginnerFriendly: true,
    beginnerAlternative: null,
  },
  {
    id: "rowing",
    name: "Rowing Machine",
    nameAr: "جهاز التجديف",
    description: "Full-body cardio and strength on a rowing ergometer",
    descriptionAr: "تمرين كارديو شامل على جهاز التجديف",
    equipment: "rowing_machine",
    effortLevel: "moderate",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🚣",
    beginnerFriendly: true,
    beginnerAlternative: null,
  },
  {
    id: "swimming",
    name: "Swimming",
    nameAr: "سباحة",
    description: "Lap swimming in a pool",
    descriptionAr: "سباحة أطوال في المسبح",
    equipment: "pool",
    effortLevel: "moderate",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🏊",
    beginnerFriendly: false,
    beginnerAlternative: "brisk_walking",
  },
  {
    id: "running",
    name: "Running",
    nameAr: "جري",
    description: "Outdoor or treadmill running at higher intensity",
    descriptionAr: "جري في الخارج أو على المشاية بشدة أعلى",
    equipment: "none",
    effortLevel: "high",
    supportsDistance: true,
    supportsCalories: true,
    icon: "🏃‍♂️",
    beginnerFriendly: false,
    beginnerAlternative: "brisk_walking",
  },
  {
    id: "stair_climber",
    name: "Stair Climber",
    nameAr: "جهاز السلالم",
    description: "Climbing stairs on a stair machine",
    descriptionAr: "صعود السلالم على جهاز السلالم",
    equipment: "stair_machine",
    effortLevel: "high",
    supportsDistance: false,
    supportsCalories: true,
    icon: "🪜",
    beginnerFriendly: false,
    beginnerAlternative: "brisk_walking",
  },
  {
    id: "jump_rope",
    name: "Jump Rope",
    nameAr: "نط الحبل",
    description: "High-intensity skipping with a jump rope",
    descriptionAr: "نط الحبل بشدة عالية",
    equipment: "jump_rope",
    effortLevel: "high",
    supportsDistance: false,
    supportsCalories: true,
    icon: "⏭️",
    beginnerFriendly: false,
    beginnerAlternative: "brisk_walking",
  },
];

// ── Intensity levels ──
export const intensityLevels = [
  { id: "light", name: "Light", nameAr: "خفيف", color: "emerald", minuteMultiplier: 0.5 },
  { id: "moderate", name: "Moderate", nameAr: "متوسط", color: "amber", minuteMultiplier: 1 },
  { id: "vigorous", name: "Vigorous", nameAr: "شديد", color: "red", minuteMultiplier: 2 },
];

// ── Beginner programs ──
export const beginnerPrograms = [
  {
    id: "beginner_week1_2",
    name: "Weeks 1–2: Getting Started",
    nameAr: "الأسبوع 1–2: البداية",
    sessions: [
      { activity: "brisk_walking", duration: 15, intensity: "light", days: 3 },
    ],
    totalMinutesPerWeek: 45,
    notes: "Start with 15 minutes of brisk walking, 3 times per week. Focus on consistency, not speed.",
    notesAr: "ابدأ بـ15 دقيقة مشي سريع، 3 مرات أسبوعياً. ركّز على الالتزام وليس السرعة.",
  },
  {
    id: "beginner_week3_4",
    name: "Weeks 3–4: Building Up",
    nameAr: "الأسبوع 3–4: زيادة تدريجية",
    sessions: [
      { activity: "brisk_walking", duration: 20, intensity: "light", days: 2 },
      { activity: "stationary_bike", duration: 15, intensity: "moderate", days: 2 },
    ],
    totalMinutesPerWeek: 70,
    notes: "Alternate between walking and cycling. Increase duration by 5 minutes when comfortable.",
    notesAr: "بدّل بين المشي والدراجة. زد المدة 5 دقائق عندما تشعر بالراحة.",
  },
  {
    id: "beginner_week5_8",
    name: "Weeks 5–8: Reaching 150 min",
    nameAr: "الأسبوع 5–8: الوصول لـ150 دقيقة",
    sessions: [
      { activity: "brisk_walking", duration: 30, intensity: "moderate", days: 3 },
      { activity: "stationary_bike", duration: 30, intensity: "moderate", days: 2 },
    ],
    totalMinutesPerWeek: 150,
    notes: "Target the WHO-recommended 150 minutes of moderate activity. Adjust based on your ability.",
    notesAr: "استهدف 150 دقيقة نشاط متوسط أسبوعياً حسب توصيات منظمة الصحة العالمية. عدّل بحسب قدرتك.",
  },
];

// ── Safety disclaimer ──
export const safetyDisclaimer = {
  en: "These are general fitness guidelines and not a substitute for medical evaluation. Stop exercising immediately and seek medical attention if you experience chest pain, dizziness, unusual shortness of breath, or any other alarming symptoms.",
  ar: "هذه إرشادات لياقة عامة وليست بديلاً عن التقييم الطبي. توقف عن التمرين فوراً واطلب الرعاية الطبية إذا شعرت بألم في الصدر أو دوار أو ضيق نفس غير معتاد أو أي أعراض مقلقة.",
};

// ── Warmup/cooldown tips ──
export const warmupCooldownTips = {
  warmup: {
    en: "Warm up for 5–10 minutes with light movement (walking, dynamic stretches) before starting your session.",
    ar: "أحمِ لمدة 5–10 دقائق بحركة خفيفة (مشي، إطالات حركية) قبل بدء الجلسة.",
  },
  cooldown: {
    en: "Cool down for 5–10 minutes with gentle walking and static stretching to bring your heart rate down gradually.",
    ar: "قم بالتهدئة لمدة 5–10 دقائق بمشي خفيف وإطالات ثابتة لخفض نبض القلب تدريجياً.",
  },
};

export default cardioActivities;
