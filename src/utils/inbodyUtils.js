/**
 * Utility functions for analyzing InBody measurements (Height, Age, Weight, SMM, Body Fat %, Visceral Fat, BMR)
 */

export function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightM = height / 100;
  const value = parseFloat((weight / (heightM * heightM)).toFixed(1));
  let category = "Normal";
  let color = "text-emerald-400";
  let bg = "bg-emerald-500/10 border-emerald-500/30";

  if (value < 18.5) {
    category = "Underweight";
    color = "text-amber-400";
    bg = "bg-amber-500/10 border-amber-500/30";
  } else if (value >= 25 && value < 30) {
    category = "Overweight";
    color = "text-amber-400";
    bg = "bg-amber-500/10 border-amber-500/30";
  } else if (value >= 30) {
    category = "Obese";
    color = "text-red-400";
    bg = "bg-red-500/10 border-red-500/30";
  }

  return { value, category, color, bg };
}

export function getVisceralFatStatus(level) {
  if (level == null || level === "") return null;
  const num = Number(level);
  if (num <= 9) {
    return { category: "Healthy", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  } else if (num <= 14) {
    return { category: "Slightly High", color: "text-amber-400", bg: "bg-amber-500/10" };
  } else {
    return { category: "High Risk", color: "text-red-400", bg: "bg-red-500/10" };
  }
}

export function getBodyFatStatus(bodyFat) {
  if (bodyFat == null || bodyFat === "") return null;
  const bf = Number(bodyFat);
  if (bf < 10) return { category: "Essential / Athletic", color: "text-cyan-400" };
  if (bf <= 18) return { category: "Fit / Lean", color: "text-emerald-400" };
  if (bf <= 24) return { category: "Average", color: "text-amber-400" };
  return { category: "Above Average", color: "text-red-400" };
}

export function calculateInbodyDeltas(current, previous) {
  if (!current || !previous) return null;

  const diff = (a, b) => (a != null && b != null ? parseFloat((a - b).toFixed(1)) : null);

  return {
    weight: diff(current.weight, previous.weight),
    skeletalMuscleMass: diff(current.skeletalMuscleMass, previous.skeletalMuscleMass),
    bodyFat: diff(current.bodyFat, previous.bodyFat),
    bodyFatMass: diff(current.bodyFatMass, previous.bodyFatMass),
    visceralFat: diff(current.visceralFat, previous.visceralFat),
  };
}
