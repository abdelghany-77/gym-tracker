import { angleLabels } from "../data/exercises";

// Human-readable label for a targetAngle
export function getAngleLabel(angle) {
  return angleLabels[angle] || { en: angle, ar: "" };
}

// Color mapping for angle badges
export const angleColors = {
  // Back
  vertical_pull:        { bg: "bg-neon-cyan/10",    text: "text-neon-cyan",    border: "border-neon-cyan/20" },
  horizontal_row:       { bg: "bg-neon-blue/10",    text: "text-neon-blue",    border: "border-neon-blue/20" },
  unilateral_row:       { bg: "bg-neon-emerald/10", text: "text-neon-emerald", border: "border-neon-emerald/20" },
  lat_isolation:        { bg: "bg-vivid-purple/10", text: "text-vivid-purple", border: "border-vivid-purple/20" },
  upper_back_rear_delt: { bg: "bg-amber-accent/10", text: "text-amber-accent", border: "border-amber-accent/20" },
  lower_back_posterior: { bg: "bg-orange-500/10",   text: "text-orange-400",   border: "border-orange-500/20" },
  // Chest
  upper_chest:      { bg: "bg-neon-cyan/10",    text: "text-neon-cyan",    border: "border-neon-cyan/20" },
  mid_chest:        { bg: "bg-neon-blue/10",    text: "text-neon-blue",    border: "border-neon-blue/20" },
  lower_chest:      { bg: "bg-neon-emerald/10", text: "text-neon-emerald", border: "border-neon-emerald/20" },
  inner_chest:      { bg: "bg-vivid-purple/10", text: "text-vivid-purple", border: "border-vivid-purple/20" },
  machine_compound: { bg: "bg-amber-accent/10", text: "text-amber-accent", border: "border-amber-accent/20" },
  // Shoulders
  anterior_delt:  { bg: "bg-neon-cyan/10",    text: "text-neon-cyan",    border: "border-neon-cyan/20" },
  lateral_delt:   { bg: "bg-neon-blue/10",    text: "text-neon-blue",    border: "border-neon-blue/20" },
  posterior_delt: { bg: "bg-vivid-purple/10", text: "text-vivid-purple", border: "border-vivid-purple/20" },
  upper_traps:    { bg: "bg-amber-accent/10", text: "text-amber-accent", border: "border-amber-accent/20" },
  // Legs
  quad_compound:   { bg: "bg-neon-cyan/10",    text: "text-neon-cyan",    border: "border-neon-cyan/20" },
  quad_isolation:  { bg: "bg-neon-blue/10",    text: "text-neon-blue",    border: "border-neon-blue/20" },
  hamstring_hinge: { bg: "bg-neon-emerald/10", text: "text-neon-emerald", border: "border-neon-emerald/20" },
  hamstring_curl:  { bg: "bg-vivid-purple/10", text: "text-vivid-purple", border: "border-vivid-purple/20" },
  calves:          { bg: "bg-amber-accent/10", text: "text-amber-accent", border: "border-amber-accent/20" },
  // Arms
  bicep_long_head:      { bg: "bg-neon-cyan/10",    text: "text-neon-cyan",    border: "border-neon-cyan/20" },
  bicep_short_head:     { bg: "bg-neon-blue/10",    text: "text-neon-blue",    border: "border-neon-blue/20" },
  brachialis:           { bg: "bg-neon-emerald/10", text: "text-neon-emerald", border: "border-neon-emerald/20" },
  tricep_long_head:     { bg: "bg-vivid-purple/10", text: "text-vivid-purple", border: "border-vivid-purple/20" },
  tricep_lateral_medial:{ bg: "bg-amber-accent/10", text: "text-amber-accent", border: "border-amber-accent/20" },
  // Core
  core_abs: { bg: "bg-neon-emerald/10", text: "text-neon-emerald", border: "border-neon-emerald/20" },
};
