import { getAngleLabel, angleColors } from "../utils/angleUtils";

export default function AngleBadge({ angle, size = "sm" }) {
  const label = getAngleLabel(angle);
  const colors = angleColors[angle] || { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}>
      {label.en}
    </span>
  );
}
