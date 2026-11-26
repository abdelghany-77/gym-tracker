import { useMemo, useState } from "react";
import { TrendingUp, Trophy } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { parseLocalDate } from "../utils/dateUtils";

const METRIC_OPTIONS = [
  { id: "e1rm", label: "Est. 1RM", unit: "kg" },
  { id: "maxWeight", label: "Top Weight", unit: "kg" },
  { id: "volume", label: "Volume", unit: "kg" },
];

export default function ExerciseProgressionChart() {
  const history = useWorkoutStore((s) => s.history);
  const exercises = useWorkoutStore((s) => s.exercises);
  const [metric, setMetric] = useState("e1rm");
  const [selectedExId, setSelectedExId] = useState("");
  const [activePointIdx, setActivePointIdx] = useState(null);

  const exerciseById = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises],
  );

  // Gather all exercises that have at least one working set in history, sorted by session count
  const loggedExercises = useMemo(() => {
    const counts = new Map();
    for (const session of history) {
      for (const ex of session.exercises || []) {
        const working = (ex.sets || []).filter(
          (s) => s.type !== "W" && Number(s.weight) > 0,
        );
        if (working.length > 0) {
          counts.set(ex.exerciseId, (counts.get(ex.exerciseId) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([id, sessions]) => ({
        id,
        name:
          exerciseById.get(id)?.name ||
          String(id)
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        muscle: exerciseById.get(id)?.muscle || "",
        sessions,
      }))
      .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));
  }, [history, exerciseById]);

  const effectiveExId =
    selectedExId && loggedExercises.some((e) => e.id === selectedExId)
      ? selectedExId
      : loggedExercises[0]?.id || "";

  const points = useMemo(() => {
    if (!effectiveExId) return [];
    const list = [];
    for (const session of history) {
      const ex = (session.exercises || []).find(
        (item) => item.exerciseId === effectiveExId,
      );
      if (!ex) continue;
      const working = (ex.sets || []).filter(
        (s) => s.type !== "W" && Number(s.weight) > 0,
      );
      if (!working.length) continue;

      let maxWeight = 0;
      let e1rm = 0;
      let volume = 0;
      let bestSetLabel = "";

      for (const s of working) {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        volume += w * r;
        const est = r <= 1 ? w : Math.round(w * (1 + r / 30));
        if (w > maxWeight) maxWeight = w;
        if (est >= e1rm) {
          e1rm = est;
          bestSetLabel = `${w} kg × ${r}`;
        }
      }

      list.push({
        date: session.date,
        label: parseLocalDate(session.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        maxWeight: Math.round(maxWeight * 10) / 10,
        e1rm,
        volume: Math.round(volume),
        bestSetLabel,
      });
    }
    return list;
  }, [history, effectiveExId]);

  if (loggedExercises.length === 0 || points.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-bg-surface p-6 text-center space-y-2">
        <TrendingUp size={22} className="mx-auto text-slate-500" />
        <p className="text-sm font-semibold text-white">
          No strength history yet
        </p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Log working sets with weights to visualize your strength and volume
          progression over time.
        </p>
      </div>
    );
  }

  const values = points.map((p) => p[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const firstVal = values[0] ?? 0;
  const latestVal = values[values.length - 1] ?? 0;
  const delta = Math.round((latestVal - firstVal) * 10) / 10;
  const bestVal = maxVal;

  // SVG chart dimensions
  const width = 520;
  const height = 180;
  const padX = 28;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const range = Math.max(1, maxVal - minVal);

  const coords = points.map((pt, idx) => {
    const x =
      points.length === 1
        ? width / 2
        : padX + (idx / (points.length - 1)) * innerW;
    const y =
      points.length === 1
        ? height / 2
        : padY + innerH - ((pt[metric] - minVal) / range) * innerH;
    return { x, y, pt };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(height - padY).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(height - padY).toFixed(1)} Z`
      : "";

  const inspected =
    activePointIdx !== null && coords[activePointIdx]
      ? coords[activePointIdx].pt
      : points[points.length - 1];

  return (
    <div className="rounded-2xl border border-slate-800 bg-bg-surface p-4 space-y-4">
      {/* Exercise Selector + Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <label
            htmlFor="progression-exercise-select"
            className="block text-xs text-slate-400 mb-1"
          >
            Exercise progression
          </label>
          <select
            id="progression-exercise-select"
            value={effectiveExId}
            onChange={(e) => {
              setSelectedExId(e.target.value);
              setActivePointIdx(null);
            }}
            className="min-h-11 w-full rounded-xl border border-slate-700 bg-bg-deep px-3 text-sm font-medium text-white focus:border-slate-400 focus:outline-none"
          >
            {loggedExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.sessions} {ex.sessions === 1 ? "session" : "sessions"})
              </option>
            ))}
          </select>
        </div>

        <div
          className="inline-flex rounded-xl border border-slate-800 bg-bg-deep p-1 self-start sm:self-end"
          role="group"
          aria-label="Progression metric"
        >
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMetric(opt.id)}
              aria-pressed={metric === opt.id}
              className={`min-h-9 rounded-lg px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                metric === opt.id
                  ? "bg-slate-200 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-3 gap-2 border-y border-slate-800/80 py-3">
        <div>
          <p className="text-[11px] text-slate-400">Latest</p>
          <p className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {latestVal.toLocaleString()} kg
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Trophy size={11} className="text-amber-400" aria-hidden="true" />
            All-Time Best
          </p>
          <p className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {bestVal.toLocaleString()} kg
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Net Change</p>
          <p
            className={`text-base font-bold font-mono tabular-nums mt-0.5 ${
              delta > 0
                ? "text-emerald-400"
                : delta < 0
                  ? "text-rose-400"
                  : "text-slate-300"
            }`}
          >
            {delta > 0 ? `+${delta}` : delta} kg
          </p>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="space-y-2">
        <div className="rounded-xl border border-slate-800/80 bg-bg-deep p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 overflow-visible"
            role="img"
            aria-label={`Strength progression chart for ${loggedExercises.find((e) => e.id === effectiveExId)?.name || "exercise"}`}
          >
            {/* Horizontal grid lines */}
            {[0, 0.5, 1].map((t) => {
              const y = padY + t * innerH;
              const val = Math.round(maxVal - t * (maxVal - minVal));
              return (
                <g key={t}>
                  <line
                    x1={padX}
                    x2={width - padX}
                    y1={y}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && (
              <path d={areaPath} fill="rgba(56, 189, 248, 0.12)" />
            )}

            {/* Main progression line */}
            {coords.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive data points */}
            {coords.map((c, idx) => {
              const isSelected =
                activePointIdx === idx ||
                (activePointIdx === null && idx === coords.length - 1);
              return (
                <g
                  key={`${c.pt.date}-${idx}`}
                  className="cursor-pointer"
                  onClick={() => setActivePointIdx(idx)}
                  onMouseEnter={() => setActivePointIdx(idx)}
                >
                  <circle cx={c.x} cy={c.y} r="12" fill="transparent" />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? "5.5" : "3.5"}
                    fill={isSelected ? "#f8fafc" : "#38bdf8"}
                    stroke="#0b0f17"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* Inspected point footer */}
          {inspected && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>
                <strong className="text-white">{inspected.label}</strong> · Best
                set:{" "}
                <span className="font-mono text-slate-200 tabular-nums">
                  {inspected.bestSetLabel}
                </span>
              </span>
              <span className="font-mono tabular-nums text-slate-300">
                e1RM {inspected.e1rm} kg · Vol{" "}
                {inspected.volume.toLocaleString()} kg
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
