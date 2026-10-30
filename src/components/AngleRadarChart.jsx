import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Sparkles, Layers, Crosshair, Dumbbell } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { exercisesDatabase } from "../data/exercises";
import { getAngleLabel } from "../utils/angleUtils";

const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", labelAr: "صدر", color: "#73C8B4" },
  { id: "back", label: "Back", labelAr: "ظهر", color: "#3B82F6" },
  { id: "shoulders", label: "Shoulders", labelAr: "أكتاف", color: "#A855F7" },
  { id: "legs", label: "Legs", labelAr: "أرجل", color: "#10B981" },
  { id: "arms", label: "Arms", labelAr: "ذراعين", color: "#F59E0B" },
  { id: "core", label: "Core", labelAr: "بطن", color: "#EC4899" },
];

// Biomechanical angles defined per muscle group
const MUSCLE_ANGLES = {
  chest: ["upper_chest", "mid_chest", "lower_chest", "inner_chest"],
  back: [
    "vertical_pull",
    "horizontal_row",
    "unilateral_row",
    "lat_isolation",
    "upper_back_rear_delt",
    "lower_back_posterior",
  ],
  shoulders: ["anterior_delt", "lateral_delt", "posterior_delt", "upper_traps"],
  legs: ["quad_compound", "quad_isolation", "hamstring_hinge", "hamstring_curl", "calves"],
  arms: [
    "bicep_short_head",
    "bicep_long_head",
    "brachialis",
    "tricep_lateral_medial",
    "tricep_long_head",
  ],
  core: ["core_abs"],
};

export default function AngleRadarChart() {
  const history = useWorkoutStore((s) => s.history);
  const storeExercises = useWorkoutStore((s) => s.exercises);

  const [viewMode, setViewMode] = useState("macro"); // "macro" | "micro"
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [referenceTime] = useState(() => Date.now());

  // Exercise lookup map for metadata & prescription recommendations
  const exerciseCatalog = useMemo(() => {
    const map = new Map();
    // Seed with database catalog first
    exercisesDatabase.forEach((ex) => map.set(ex.id, ex));
    // Overlay store custom exercises
    (storeExercises || []).forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [storeExercises]);

  // Aggregate logged sets over the last 30 days and last 14 days
  const { setsLast30ByAngle, setsLast14ByAngle, setsLast30ByMuscle } = useMemo(() => {
    const ms30Days = 30 * 24 * 60 * 60 * 1000;
    const ms14Days = 14 * 24 * 60 * 60 * 1000;

    const last30 = {};
    const last14 = {};
    const muscle30 = {
      chest: 0,
      back: 0,
      shoulders: 0,
      legs: 0,
      arms: 0,
      core: 0,
    };

    history.forEach((session) => {
      const sessionTime = new Date(session.date || session.startedAt).getTime();
      const in30 = referenceTime - sessionTime <= ms30Days;
      const in14 = referenceTime - sessionTime <= ms14Days;

      if (!in30 && !in14) return;

      (session.exercises || []).forEach((exEntry) => {
        const setsCount = (exEntry.sets || []).length;
        if (!setsCount) return;

        const exDef = exerciseCatalog.get(exEntry.exerciseId);
        if (!exDef) return;

        const angle = exDef.targetAngle;
        const muscle = exDef.primaryMuscle || exDef.muscle?.toLowerCase();

        if (angle) {
          if (in30) last30[angle] = (last30[angle] || 0) + setsCount;
          if (in14) last14[angle] = (last14[angle] || 0) + setsCount;
        }

        if (muscle && muscle30[muscle] !== undefined) {
          if (in30) muscle30[muscle] += setsCount;
        }
      });
    });

    return {
      setsLast30ByAngle: last30,
      setsLast14ByAngle: last14,
      setsLast30ByMuscle: muscle30,
    };
  }, [history, exerciseCatalog, referenceTime]);

  // Determine neglected angles (< 3 sets in the last 14 days)
  const neglectedAngles = useMemo(() => {
    const list = [];
    const targetAngles =
      viewMode === "macro"
        ? Object.values(MUSCLE_ANGLES).flat()
        : MUSCLE_ANGLES[selectedMuscle] || [];

    targetAngles.forEach((angle) => {
      const sets14 = setsLast14ByAngle[angle] || 0;
      if (sets14 < 3) {
        // Find matching exercise from exercisesDatabase
        const recommendation =
          exercisesDatabase.find((e) => e.targetAngle === angle) ||
          exercisesDatabase.find((e) => e.primaryMuscle === selectedMuscle);

        list.push({
          angle,
          label: getAngleLabel(angle).en,
          sets14,
          sets30: setsLast30ByAngle[angle] || 0,
          recommendation,
        });
      }
    });

    return list;
  }, [viewMode, selectedMuscle, setsLast14ByAngle, setsLast30ByAngle]);

  // SVG Chart Geometry
  const svgSize = 340;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = 100;

  // Build axes data based on view mode
  const chartAxes = useMemo(() => {
    if (viewMode === "macro") {
      return MUSCLE_GROUPS.map((m) => {
        const val = setsLast30ByMuscle[m.id] || 0;
        return {
          id: m.id,
          label: m.label,
          value: val,
          sets14: null,
          isNeglected: false,
          color: m.color,
        };
      });
    } else {
      const angles = MUSCLE_ANGLES[selectedMuscle] || [];
      return angles.map((angle) => {
        const val = setsLast30ByAngle[angle] || 0;
        const sets14 = setsLast14ByAngle[angle] || 0;
        return {
          id: angle,
          label: getAngleLabel(angle).en,
          value: val,
          sets14,
          isNeglected: sets14 < 3,
          color: sets14 < 3 ? "#F59E0B" : "#73C8B4",
        };
      });
    }
  }, [viewMode, selectedMuscle, setsLast30ByMuscle, setsLast30ByAngle, setsLast14ByAngle]);

  const numAxes = chartAxes.length;
  const maxVal = Math.max(...chartAxes.map((a) => a.value), 10);

  // Compute vertex positions
  const getCoordinates = (index, total, r) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Concentric polygon grid points
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    return chartAxes
      .map((_, i) => {
        const pt = getCoordinates(i, numAxes, radius * lvl);
        return `${pt.x},${pt.y}`;
      })
      .join(" ");
  });

  // Data polygon points
  const dataPolygonPoints = chartAxes
    .map((axis, i) => {
      const normalizedRatio = Math.max(axis.value / maxVal, 0.05);
      const pt = getCoordinates(i, numAxes, radius * normalizedRatio);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <div className="bg-[#0B0F17] rounded-3xl p-5 border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background ambient neon glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#73C8B4]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#73C8B4]/10 border border-[#73C8B4]/20 text-[#73C8B4]">
              <Crosshair size={16} />
            </span>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              Biomechanical Angle Radar
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {viewMode === "macro"
              ? "Macro Muscle Balance (Last 30 Days)"
              : `Micro Angle Coverage: ${MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label} (Last 30 Days)`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#121824] p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setViewMode("macro");
              setActiveTooltip(null);
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === "macro"
                ? "bg-[#73C8B4]/15 text-[#73C8B4] border border-[#73C8B4]/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers size={13} />
            Macro Balance
          </button>
          <button
            onClick={() => {
              setViewMode("micro");
              setActiveTooltip(null);
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === "micro"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Crosshair size={13} />
            Micro Angles
          </button>
        </div>
      </div>

      {/* Per-Muscle Filter Pills (Visible in Micro Mode) */}
      {viewMode === "micro" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none relative z-10">
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMuscle(m.id);
                setActiveTooltip(null);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedMuscle === m.id
                  ? "bg-[#121824] text-white border-[#73C8B4] shadow-sm font-bold"
                  : "bg-[#0B0F17] text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Pure SVG Spider/Radar Chart */}
      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full max-w-[340px] h-auto overflow-visible select-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <linearGradient id="radarNeonFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#73C8B4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Polygons */}
          {gridPolygons.map((pts, idx) => (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray={idx === 3 ? "none" : "2,3"}
            />
          ))}

          {/* Axis Radial Spokes */}
          {chartAxes.map((_, i) => {
            const end = getCoordinates(i, numAxes, radius);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#1E293B"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Data Polygon */}
          <polygon
            points={dataPolygonPoints}
            fill="url(#radarNeonFill)"
            stroke="#73C8B4"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Interactive Vertex Dots */}
          {chartAxes.map((axis, i) => {
            const normalizedRatio = Math.max(axis.value / maxVal, 0.05);
            const pt = getCoordinates(i, numAxes, radius * normalizedRatio);
            const isAmber = axis.isNeglected;

            return (
              <g
                key={axis.id}
                onClick={() =>
                  setActiveTooltip(activeTooltip === axis.id ? null : axis.id)
                }
                className="cursor-pointer"
              >
                {/* Outer Pulse ring if neglected */}
                {isAmber && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                    className="animate-ping"
                  />
                )}
                {/* Inner Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isAmber ? "5" : "4"}
                  fill={isAmber ? "#F59E0B" : "#73C8B4"}
                  stroke="#0B0F17"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
              </g>
            );
          })}

          {/* Outer Labels */}
          {chartAxes.map((axis, i) => {
            const labelPt = getCoordinates(i, numAxes, radius + 22);
            const isLeft = labelPt.x < cx - 10;
            const isRight = labelPt.x > cx + 10;
            const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

            return (
              <text
                key={axis.id}
                x={labelPt.x}
                y={labelPt.y + 4}
                textAnchor={textAnchor}
                className={`text-[10px] font-bold tracking-tight transition-colors ${
                  axis.isNeglected ? "fill-[#F59E0B]" : "fill-slate-300"
                }`}
              >
                {axis.label}
                <tspan className="fill-slate-500 text-[9px] font-normal" dx="3">
                  ({axis.value}s)
                </tspan>
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip on tapped point */}
        {activeTooltip && (
          <div className="absolute top-3 bg-[#121824]/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs z-30 animate-fadeIn">
            {(() => {
              const item = chartAxes.find((a) => a.id === activeTooltip);
              if (!item) return null;
              return (
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {item.label}
                    {item.isNeglected && (
                      <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.2 rounded-full border border-[#F59E0B]/30">
                        Neglected
                      </span>
                    )}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    30-Day Total: <span className="text-[#73C8B4] font-semibold">{item.value} sets</span>
                  </p>
                  {item.sets14 !== null && (
                    <p className="text-slate-400 text-[11px]">
                      14-Day Velocity:{" "}
                      <span className={item.sets14 < 3 ? "text-[#F59E0B] font-semibold" : "text-[#10B981] font-semibold"}>
                        {item.sets14} sets
                      </span>
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Neglected Angles Audit & Prescription Section ── */}
      <div className="border-t border-slate-800/80 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            {neglectedAngles.length > 0 ? (
              <>
                <AlertTriangle size={14} className="text-[#F59E0B]" />
                Neglected Biomechanical Angles (&lt; 3 sets in 14d)
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-[#10B981]" />
                Biomechanical Balance Status
              </>
            )}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              neglectedAngles.length > 0
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
            }`}
          >
            {neglectedAngles.length > 0
              ? `${neglectedAngles.length} Under-Trained`
              : "100% Complete"}
          </span>
        </div>

        {neglectedAngles.length === 0 ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/25 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Full Biomechanical Angle Coverage!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every muscle angle has received optimal progressive overload in the last 14 days. Zero weak links detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {neglectedAngles.map(({ angle, label, sets14, recommendation }) => (
              <div
                key={angle}
                className="bg-[#121824] rounded-2xl p-3 border border-slate-800 hover:border-[#F59E0B]/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                      <AlertTriangle size={10} />
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {sets14} sets logged in 14d
                    </span>
                  </div>

                  {recommendation && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        Prescription: {recommendation.name}
                      </p>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        {recommendation.equipment}
                      </span>
                    </div>
                  )}
                </div>

                {recommendation && (
                  <div className="shrink-0">
                    <span
                      title={recommendation.tips}
                      className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-[#F59E0B]/10 border border-slate-700 hover:border-[#F59E0B]/30 flex items-center justify-center text-slate-400 hover:text-[#F59E0B] transition-colors"
                    >
                      <Dumbbell size={14} />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
