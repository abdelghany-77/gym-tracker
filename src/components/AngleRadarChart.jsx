import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Crosshair,
  Dumbbell,
  GitCompareArrows,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { exercisesDatabase } from "../data/exercises";
import { getAngleLabel } from "../utils/angleUtils";

const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", labelAr: "صدر", color: "#00F0FF" },
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
  legs: [
    "quad_compound",
    "quad_isolation",
    "hamstring_hinge",
    "hamstring_curl",
    "calves",
  ],
  arms: [
    "bicep_short_head",
    "bicep_long_head",
    "brachialis",
    "tricep_lateral_medial",
    "tricep_long_head",
  ],
  core: ["core_abs"],
};

// ── Target weekly set distribution (hypertrophy evidence-based defaults) ──
const MUSCLE_TARGETS = {
  chest: 22,
  back: 25,
  shoulders: 21,
  legs: 30,
  arms: 20,
  core: 6,
};

const WEEKLY_TARGET_SETS = {
  // Chest
  upper_chest: 6,
  mid_chest: 6,
  lower_chest: 6,
  inner_chest: 4,
  // Back
  vertical_pull: 6,
  horizontal_row: 6,
  unilateral_row: 4,
  lat_isolation: 3,
  upper_back_rear_delt: 3,
  lower_back_posterior: 3,
  // Shoulders
  anterior_delt: 6,
  lateral_delt: 6,
  posterior_delt: 6,
  upper_traps: 3,
  // Legs
  quad_compound: 9,
  quad_isolation: 3,
  hamstring_hinge: 6,
  hamstring_curl: 6,
  calves: 6,
  // Arms
  bicep_short_head: 4,
  bicep_long_head: 4,
  brachialis: 3,
  tricep_long_head: 4,
  tricep_lateral_medial: 5,
  // Core
  core_abs: 6,
};

// Angle flagged as neglected when current-week volume < 70% of the target
const NEGLECT_THRESHOLD = 0.7;

export default function AngleRadarChart({ showRecommendations = true }) {
  const history = useWorkoutStore((s) => s.history);
  const storeExercises = useWorkoutStore((s) => s.exercises);

  const [viewMode, setViewMode] = useState("macro"); // "macro" | "micro"
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [dataMode, setDataMode] = useState("30d"); // "30d" | "week" | "compare"
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

  // Aggregate logged sets over the last 30 days, last 14 days and current week
  const { setsLast30ByAngle, setsLast14ByAngle, setsLast30ByMuscle, weekByAngle, weekByMuscle } =
    useMemo(() => {
      const ms30Days = 30 * 24 * 60 * 60 * 1000;
      const ms14Days = 14 * 24 * 60 * 60 * 1000;
      const ms7Days = 7 * 24 * 60 * 60 * 1000;

      const last30 = {};
      const last14 = {};
      const week = {};
      const muscle30 = {
        chest: 0,
        back: 0,
        shoulders: 0,
        legs: 0,
        arms: 0,
        core: 0,
      };
      const muscleWeek = {
        chest: 0,
        back: 0,
        shoulders: 0,
        legs: 0,
        arms: 0,
        core: 0,
      };

      history.forEach((session) => {
        const sessionTime = new Date(
          session.date || session.startedAt,
        ).getTime();
        const in30 = referenceTime - sessionTime <= ms30Days;
        const in14 = referenceTime - sessionTime <= ms14Days;
        const in7 = referenceTime - sessionTime <= ms7Days;

        if (!in30 && !in14 && !in7) return;

        (session.exercises || []).forEach((exEntry) => {
          // Warm-up sets (W) do not count toward training volume coverage
          const workingSets = (exEntry.sets || []).filter(
            (s) => s.type !== "W",
          );
          const setsCount = workingSets.length;
          if (!setsCount) return;

          const exDef = exerciseCatalog.get(exEntry.exerciseId);
          if (!exDef) return;

          const angle = exDef.targetAngle;
          const muscle = exDef.primaryMuscle || exDef.muscle?.toLowerCase();

          if (angle) {
            if (in30) last30[angle] = (last30[angle] || 0) + setsCount;
            if (in14) last14[angle] = (last14[angle] || 0) + setsCount;
            if (in7) week[angle] = (week[angle] || 0) + setsCount;
          }

          if (muscle30[muscle] !== undefined) {
            if (in30) muscle30[muscle] += setsCount;
            if (in7) muscleWeek[muscle] += setsCount;
          }
        });
      });

      return {
        setsLast30ByAngle: last30,
        setsLast14ByAngle: last14,
        setsLast30ByMuscle: muscle30,
        weekByAngle: week,
        weekByMuscle: muscleWeek,
      };
    }, [history, exerciseCatalog, referenceTime]);

  // Determine neglected angles for the audit section (mirrors the chart flagging)
  const neglectedAngles = useMemo(() => {
    const list = [];
    const useWeek = dataMode !== "30d";
    const targetAngles =
      viewMode === "macro"
        ? Object.values(MUSCLE_ANGLES).flat()
        : MUSCLE_ANGLES[selectedMuscle] || [];

    targetAngles.forEach((angle) => {
      const target = WEEKLY_TARGET_SETS[angle] || 6;
      const week = weekByAngle[angle] || 0;
      const sets14 = setsLast14ByAngle[angle] || 0;
      const isNeglected = useWeek ? week < NEGLECT_THRESHOLD * target : sets14 < 3;
      if (isNeglected) {
        // Find matching exercise from exercisesDatabase
        const recommendation =
          exercisesDatabase.find((e) => e.targetAngle === angle) ||
          exercisesDatabase.find((e) => e.primaryMuscle === selectedMuscle);

        list.push({
          angle,
          label: getAngleLabel(angle).en,
          sets14,
          week,
          target,
          recommendation,
        });
      }
    });

    return list;
  }, [
    viewMode,
    selectedMuscle,
    dataMode,
    setsLast14ByAngle,
    weekByAngle,
  ]);

  // SVG Chart Geometry
  const svgSize = 340;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = 100;

  // Build axes data based on view mode and data mode
  const chartAxes = useMemo(() => {
    const useWeek = dataMode !== "30d";
    if (viewMode === "macro") {
      return MUSCLE_GROUPS.map((m) => {
        const value = useWeek
          ? weekByMuscle[m.id] || 0
          : setsLast30ByMuscle[m.id] || 0;
        const target = MUSCLE_TARGETS[m.id] || 10;
        const isNeglected =
          useWeek ? value < NEGLECT_THRESHOLD * target : false;
        return {
          id: m.id,
          label: m.label,
          value,
          target,
          sets14: null,
          isNeglected,
          color: isNeglected ? "#F59E0B" : m.color,
        };
      });
    } else {
      const angles = MUSCLE_ANGLES[selectedMuscle] || [];
      return angles.map((angle) => {
        const value = useWeek
          ? weekByAngle[angle] || 0
          : setsLast30ByAngle[angle] || 0;
        const sets14 = setsLast14ByAngle[angle] || 0;
        const target = WEEKLY_TARGET_SETS[angle] || 6;
        const isNeglected = useWeek
          ? value < NEGLECT_THRESHOLD * target
          : sets14 < 3;
        return {
          id: angle,
          label: getAngleLabel(angle).en,
          value,
          target,
          sets14,
          isNeglected,
          color: isNeglected ? "#F59E0B" : "#00F0FF",
        };
      });
    }
  }, [
    viewMode,
    selectedMuscle,
    dataMode,
    setsLast30ByMuscle,
    setsLast30ByAngle,
    setsLast14ByAngle,
    weekByAngle,
    weekByMuscle,
  ]);

  const numAxes = chartAxes.length;
  const maxVal = Math.max(
    ...chartAxes.map((a) => Math.max(a.value, dataMode === "compare" ? a.target : 0)),
    10,
  );

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

  // Target distribution polygon points (compare mode)
  const targetPolygonPoints = chartAxes
    .map((axis, i) => {
      const normalizedRatio = Math.max(
        (axis.target || 0) / maxVal,
        0.05,
      );
      const pt = getCoordinates(i, numAxes, radius * normalizedRatio);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <div className="bg-bg-surface rounded-2xl p-5 border border-slate-800 relative overflow-hidden space-y-4">
      {/* Header & View Switcher */}
      <div className="flex flex-col gap-3 relative z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <Crosshair size={16} />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              Biomechanical Angle Radar
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {dataMode === "compare"
              ? "Current Week vs Target Distribution — أسبوعك الحالي مقابل المستهدف"
              : dataMode === "week"
                ? viewMode === "macro"
                  ? "Macro Muscle Balance (Current Week — أسبوعك الحالي)"
                  : `Micro Angle Coverage: ${MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label} (Current Week)`
                : viewMode === "macro"
                  ? "Macro Muscle Balance (Last 30 Days)"
                  : `Micro Angle Coverage: ${MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label} (Last 30 Days)`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-bg-deep p-1 rounded-xl border border-slate-800 w-full gap-1">
          <button
            onClick={() => {
              setViewMode("macro");
              setActiveTooltip(null);
            }}
            className={`flex-1 min-h-9 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewMode === "macro"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers size={13} className="shrink-0" />
            Macro Balance
          </button>
          <button
            onClick={() => {
              setViewMode("micro");
              setActiveTooltip(null);
            }}
            className={`flex-1 min-h-9 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewMode === "micro"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Crosshair size={13} className="shrink-0" />
            Micro Angles
          </button>
        </div>
      </div>

      {/* ── Current Week vs Target Distribution toggle ── */}
      <div
        className="flex items-center bg-bg-deep p-1 rounded-xl border border-slate-800 relative z-10 w-full gap-1"
        role="group"
        aria-label="Chart data comparison"
      >
        <button
          onClick={() => {
            setDataMode("30d");
            setActiveTooltip(null);
          }}
          className={`flex-1 min-h-9 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
            dataMode === "30d"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers size={12} className="shrink-0" />
          30 Days
        </button>
        <button
          onClick={() => {
            setDataMode("week");
            setActiveTooltip(null);
          }}
          className={`flex-1 min-h-9 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
            dataMode === "week"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Crosshair size={12} className="shrink-0" />
          أسبوعك الحالي
        </button>
        <button
          onClick={() => {
            setDataMode("compare");
            setActiveTooltip(null);
          }}
          className={`flex-1 min-h-9 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
            dataMode === "compare"
              ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GitCompareArrows size={12} className="shrink-0" />
          المقارنة
        </button>
      </div>

      {/* Per-Muscle Filter Pills (Visible in Micro Mode) */}
      {viewMode === "micro" && (
        <div className="flex items-center gap-1.5 flex-wrap pb-1 pt-0.5 relative z-10">
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMuscle(m.id);
                setActiveTooltip(null);
              }}
              className={`min-h-8 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedMuscle === m.id
                  ? "bg-slate-100 text-slate-950 border-slate-100 font-semibold"
                  : "bg-bg-deep text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
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
            <linearGradient
              id="radarNeonFill"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
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
              className="stroke-slate-700/70"
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
                className="stroke-slate-700/70"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Data Polygon (Current) */}
          <polygon
            points={dataPolygonPoints}
            fill="url(#radarNeonFill)"
            stroke="#0284c7"
            strokeWidth="2.2"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Target Distribution polygon (semi-transparent overlay, compare mode) */}
          {dataMode === "compare" && (
            <polygon
              points={targetPolygonPoints}
              fill="rgba(168, 85, 247, 0.12)"
              stroke="#A855F7"
              strokeWidth="2"
              strokeDasharray="6,4"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out"
            />
          )}

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
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isAmber ? "5" : "4"}
                  fill={isAmber ? "#F59E0B" : "#0ea5e9"}
                  className="stroke-bg-surface"
                  strokeWidth="2"
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
                  axis.isNeglected ? "fill-amber-500" : "fill-current text-slate-300"
                }`}
              >
                {axis.label}
                <tspan className="fill-current text-slate-500 text-[9px] font-normal" dx="3">
                  {dataMode === "compare"
                    ? `(${axis.value}/${axis.target})`
                    : `(${axis.value}s)`}
                </tspan>
                {axis.isNeglected && (
                  <tspan className="fill-amber-500" dx="2" role="img" aria-label="Neglected warning">
                    ⚠
                  </tspan>
                )}
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip on tapped point */}
        {activeTooltip && (
          <div className="absolute top-3 bg-bg-surface/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs z-30 animate-fadeIn">
            {(() => {
              const item = chartAxes.find((a) => a.id === activeTooltip);
              if (!item) return null;
              return (
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {item.label}
                    {item.isNeglected && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                        Neglected
                      </span>
                    )}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    30-Day Total:{" "}
                    <span className="text-sky-400 font-semibold">
                      {item.value} sets
                    </span>
                  </p>
                  {item.sets14 !== null && (
                    <p className="text-slate-400 text-[11px]">
                      14-Day Velocity:{" "}
                      <span
                        className={
                          item.sets14 < 3
                            ? "text-amber-400 font-semibold"
                            : "text-emerald-400 font-semibold"
                        }
                      >
                        {item.sets14} sets
                      </span>
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Compare-mode legend */}
        {dataMode === "compare" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 whitespace-nowrap z-10 bg-bg-deep/90 px-3 py-1 rounded-full border border-slate-800">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/70 border border-sky-400" aria-hidden="true" />
              Current Week · أسبوعك الحالي
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-400">
              <span
                className="w-2.5 h-2.5 rounded-sm bg-violet-500/20 border border-dashed border-violet-400"
                aria-hidden="true"
              />
              Target · المتوسط المستهدف
            </span>
          </div>
        )}
      </div>

      {/* ── Neglected Angles Audit & Prescription Section ── */}
      {showRecommendations && (
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              {neglectedAngles.length > 0 ? (
                <>
                  <AlertTriangle size={14} className="text-[#F59E0B]" />
                  {dataMode === "30d"
                    ? "Neglected Biomechanical Angles (< 3 sets in 14d)"
                    : "Neglected Biomechanical Angles (< 70% of Target)"}
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
                <p className="text-xs font-bold text-white">
                  Full Biomechanical Angle Coverage!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Every muscle angle has received optimal progressive overload
                  in the last 14 days. Zero weak links detected.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {neglectedAngles.map(
                ({ angle, label, sets14, week, target, recommendation }) => (
                  <div
                    key={angle}
                    className="bg-bg-deep rounded-2xl p-3 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                          <AlertTriangle size={10} />
                          {label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {dataMode === "30d"
                            ? `${sets14} sets logged in 14d`
                            : `${week}/${target} sets this week · ${target > 0 ? Math.round((week / target) * 100) : 0}% of target`}
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
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
