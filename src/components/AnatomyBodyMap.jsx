import { useState } from "react";

const MUSCLE_ZONES_FRONT = [
  {
    id: "Shoulders",
    label: "Shoulders",
    labelAr: "الأكتاف",
    paths: [
      "M 62 66 C 51 67 44 76 44 88 C 52 87 60 82 65 74 Z",
      "M 138 66 C 149 67 156 76 156 88 C 148 87 140 82 135 74 Z",
    ],
  },
  {
    id: "Chest",
    label: "Chest",
    labelAr: "الصدر",
    paths: [
      "M 68 70 Q 83 68 98 76 L 98 104 Q 78 106 66 95 Z",
      "M 132 70 Q 117 68 102 76 L 102 104 Q 122 106 134 95 Z",
    ],
  },
  {
    id: "Arms",
    label: "Arms",
    labelAr: "الذراعين",
    paths: [
      "M 45 91 L 58 88 L 56 126 L 42 124 Z",
      "M 155 91 L 142 88 L 144 126 L 158 124 Z",
    ],
  },
  {
    id: "Forearms",
    label: "Forearms",
    labelAr: "السواعد",
    paths: [
      "M 42 128 L 55 130 L 49 170 L 37 167 Z",
      "M 158 128 L 145 130 L 151 170 L 163 167 Z",
    ],
  },
  {
    id: "Core",
    label: "Core",
    labelAr: "البطن والجذع",
    paths: ["M 74 107 L 126 107 L 122 162 L 78 162 Z"],
  },
  {
    id: "Legs",
    label: "Legs",
    labelAr: "الأرجل",
    paths: [
      "M 70 166 L 96 168 L 93 248 L 69 245 Z",
      "M 130 166 L 104 168 L 107 248 L 131 245 Z",
      "M 70 256 L 91 256 L 87 322 L 73 322 Z",
      "M 130 256 L 109 256 L 113 322 L 127 322 Z",
    ],
  },
];

const MUSCLE_ZONES_BACK = [
  {
    id: "Shoulders",
    label: "Shoulders",
    labelAr: "الأكتاف",
    paths: [
      "M 62 66 C 50 68 44 76 44 88 C 52 87 60 82 66 74 Z",
      "M 138 66 C 150 68 156 76 156 88 C 148 87 140 82 134 74 Z",
    ],
  },
  {
    id: "Back",
    label: "Back",
    labelAr: "الظهر",
    paths: [
      "M 76 62 L 124 62 L 134 95 L 122 146 L 78 146 L 66 95 Z",
    ],
  },
  {
    id: "Arms",
    label: "Arms",
    labelAr: "الذراعين",
    paths: [
      "M 45 91 L 58 88 L 56 126 L 42 124 Z",
      "M 155 91 L 142 88 L 144 126 L 158 124 Z",
    ],
  },
  {
    id: "Forearms",
    label: "Forearms",
    labelAr: "السواعد",
    paths: [
      "M 42 128 L 55 130 L 49 170 L 37 167 Z",
      "M 158 128 L 145 130 L 151 170 L 163 167 Z",
    ],
  },
  {
    id: "Glutes",
    label: "Glutes",
    labelAr: "الأرداف",
    paths: [
      "M 70 150 Q 85 147 99 154 L 99 188 Q 80 192 68 178 Z",
      "M 130 150 Q 115 147 101 154 L 101 188 Q 120 192 132 178 Z",
    ],
  },
  {
    id: "Legs",
    label: "Legs",
    labelAr: "الأرجل",
    paths: [
      "M 70 191 L 96 191 L 93 248 L 70 246 Z",
      "M 130 191 L 104 191 L 107 248 L 130 246 Z",
      "M 70 256 L 91 256 L 87 322 L 73 322 Z",
      "M 130 256 L 109 256 L 113 322 L 127 322 Z",
    ],
  },
];

/**
 * Calm, interactive Anterior/Posterior SVG Body Map for filtering exercises by muscle group.
 * Distinct anatomical crimson highlight is used strictly on the selected muscle zone.
 */
export default function AnatomyBodyMap({
  selectedMuscle,
  onSelectMuscle,
  countsByMuscle = {},
}) {
  const [view, setView] = useState("front");
  const [hovered, setHovered] = useState(null);

  const zones = view === "front" ? MUSCLE_ZONES_FRONT : MUSCLE_ZONES_BACK;

  const handleToggle = (muscleId) => {
    onSelectMuscle(selectedMuscle === muscleId ? "All" : muscleId);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-bg-surface p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Interactive Body Map
          </h2>
          <p className="text-xs text-slate-400">
            Tap a muscle group to filter exercises
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5"
          role="group"
          aria-label="Body map orientation"
        >
          {[
            { id: "front", label: "Front" },
            { id: "back", label: "Back" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setView(opt.id)}
              aria-pressed={view === opt.id}
              className={`min-h-9 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                view === opt.id
                  ? "bg-slate-200 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="mx-auto w-[124px] select-none">
          <svg
            viewBox="0 0 200 345"
            className="h-auto w-full"
            role="img"
            aria-label={`Human anatomy ${view} view muscle selector`}
          >
            {/* Calm silhouette base */}
            <circle cx="100" cy="32" r="18" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <rect x="92" y="50" width="16" height="12" rx="4" fill="#1e293b" />
            <path
              d="M 62 64 L 138 64 L 158 88 L 164 170 L 148 172 L 138 112 L 132 164 L 132 328 L 108 328 L 103 200 L 97 200 L 92 328 L 68 328 L 68 164 L 62 112 L 52 172 L 36 170 L 42 88 Z"
              fill="#151d2c"
              stroke="#293548"
              strokeWidth="1.5"
            />

            {/* Interactive muscle groups */}
            {zones.map((zone) => {
              const isSelected = selectedMuscle === zone.id;
              const isHovered = hovered === zone.id;
              const count = countsByMuscle[zone.id] || 0;
              const fill = isSelected
                ? "#dc2626"
                : isHovered
                  ? "#991b1b"
                  : count > 0
                    ? "#334155"
                    : "#1e293b";
              const stroke = isSelected
                ? "#f87171"
                : isHovered
                  ? "#ef4444"
                  : "#475569";

              return (
                <g
                  key={zone.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter by ${zone.label} (${count} exercises)`}
                  aria-pressed={isSelected}
                  className="cursor-pointer focus:outline-none"
                  onClick={() => handleToggle(zone.id)}
                  onMouseEnter={() => setHovered(zone.id)}
                  onMouseLeave={() => setHovered(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggle(zone.id);
                    }
                  }}
                >
                  {zone.paths.map((d, idx) => (
                    <path
                      key={idx}
                      d={d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="1.2"
                      className="transition-colors duration-150"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Accessible 2-column muscle buttons paired with the SVG map */}
        <div className="grid grid-cols-2 gap-1.5">
          {zones.map((zone) => {
            const isSelected = selectedMuscle === zone.id;
            const count = countsByMuscle[zone.id] || 0;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleToggle(zone.id)}
                onMouseEnter={() => setHovered(zone.id)}
                onMouseLeave={() => setHovered(null)}
                aria-pressed={isSelected}
                className={`flex min-h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-xs transition-colors min-w-0 ${
                  isSelected
                    ? "border-red-500/60 bg-red-950/30 text-white"
                    : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="block font-medium truncate leading-tight">
                    {zone.label}
                  </span>
                  <span
                    lang="ar"
                    className="block text-[10px] text-slate-400 truncate leading-tight mt-0.5"
                  >
                    {zone.labelAr}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
