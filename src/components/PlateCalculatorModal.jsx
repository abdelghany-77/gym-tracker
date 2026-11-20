import { useState, useMemo } from "react";
import Modal from "./Modal";

const BAR_OPTIONS = [
  { id: "olympic", label: "20 kg Bar", weight: 20 },
  { id: "womens", label: "15 kg Bar", weight: 15 },
  { id: "ez", label: "10 kg EZ", weight: 10 },
  { id: "sled", label: "0 kg Sled", weight: 0 },
];

const PLATE_SPECS = [
  { weight: 25, color: "bg-red-700 border-red-500/70 text-white", height: "h-16" },
  { weight: 20, color: "bg-blue-700 border-blue-500/70 text-white", height: "h-15" },
  { weight: 15, color: "bg-amber-600 border-amber-400/70 text-slate-950", height: "h-14" },
  { weight: 10, color: "bg-emerald-700 border-emerald-500/70 text-white", height: "h-12" },
  { weight: 5, color: "bg-slate-200 border-slate-400 text-slate-950", height: "h-10" },
  { weight: 2.5, color: "bg-slate-600 border-slate-400 text-white", height: "h-9" },
  { weight: 1.25, color: "bg-slate-700 border-slate-500 text-slate-200", height: "h-7" },
];

function computePlatesPerSide(targetWeight, barWeight) {
  const numericTarget = Number(targetWeight) || 0;
  const loadable = Math.max(0, numericTarget - barWeight);
  let remainingPerSide = Math.round((loadable / 2) * 100) / 100;

  const plates = [];
  for (const spec of PLATE_SPECS) {
    while (remainingPerSide >= spec.weight - 0.001) {
      plates.push(spec);
      remainingPerSide = Math.round((remainingPerSide - spec.weight) * 100) / 100;
    }
  }

  const perSideLoaded = plates.reduce((s, p) => s + p.weight, 0);
  const actualTotal = barWeight + perSideLoaded * 2;
  const remainder = Math.round((numericTarget - actualTotal) * 100) / 100;

  return { plates, perSideLoaded, actualTotal, remainder };
}

export default function PlateCalculatorModal({
  isOpen,
  onClose,
  initialWeight = 60,
  onApplyWeight,
}) {
  const [targetWeight, setTargetWeight] = useState(() =>
    String(Number(initialWeight) > 0 ? initialWeight : 60),
  );
  const [prevInitial, setPrevInitial] = useState(initialWeight);
  if (initialWeight !== prevInitial) {
    setPrevInitial(initialWeight);
    if (Number(initialWeight) > 0) {
      setTargetWeight(String(initialWeight));
    }
  }
  const [barWeight, setBarWeight] = useState(20);

  const result = useMemo(
    () => computePlatesPerSide(targetWeight, barWeight),
    [targetWeight, barWeight],
  );

  const groupedSummary = useMemo(() => {
    const counts = new Map();
    for (const p of result.plates) {
      counts.set(p.weight, (counts.get(p.weight) || 0) + 1);
    }
    return Array.from(counts.entries());
  }, [result.plates]);

  const nudge = (delta) => {
    const next = Math.max(0, Math.round(((Number(targetWeight) || 0) + delta) * 10) / 10);
    setTargetWeight(String(next));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Barbell Plate Calculator">
      <div className="p-4 space-y-4">
        {/* Target weight input + steppers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label htmlFor="plate-calc-target">Target total weight (kg)</label>
            <span className="font-mono tabular-nums text-slate-300">
              Per side: {result.perSideLoaded} kg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nudge(-5)}
              className="min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-colors tabular-nums"
              aria-label="Decrease target by 5 kg"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => nudge(-2.5)}
              className="min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-2.5 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-colors tabular-nums"
              aria-label="Decrease target by 2.5 kg"
            >
              -2.5
            </button>
            <input
              id="plate-calc-target"
              type="number"
              inputMode="decimal"
              min="0"
              step="2.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-bg-deep px-3 text-center text-lg font-bold font-mono tabular-nums text-white focus:border-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => nudge(2.5)}
              className="min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-2.5 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-colors tabular-nums"
              aria-label="Increase target by 2.5 kg"
            >
              +2.5
            </button>
            <button
              type="button"
              onClick={() => nudge(5)}
              className="min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-colors tabular-nums"
              aria-label="Increase target by 5 kg"
            >
              +5
            </button>
          </div>
        </div>

        {/* Bar weight selector */}
        <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-slate-800 bg-bg-deep p-1">
          {BAR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBarWeight(opt.weight)}
              aria-pressed={barWeight === opt.weight}
              className={`min-h-9 rounded-lg px-2 text-[11px] font-medium transition-colors whitespace-nowrap ${
                barWeight === opt.weight
                  ? "bg-slate-200 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Visual barbell sleeve preview (1 side) */}
        <div className="rounded-xl border border-slate-800 bg-bg-deep px-4 py-5">
          <p className="text-[11px] text-slate-400 mb-3 text-center">
            Load on <strong className="text-white">each side</strong> of the bar
          </p>
          <div className="flex items-center justify-center gap-1 min-h-16">
            {/* Bar shaft + collar */}
            <div className="h-2.5 w-10 rounded-l bg-slate-500" />
            <div className="h-6 w-2 rounded-sm bg-slate-400" />

            {result.plates.length === 0 ? (
              <span className="px-3 text-xs text-slate-400">
                Bar only ({barWeight} kg)
              </span>
            ) : (
              result.plates.map((plate, idx) => (
                <div
                  key={`${plate.weight}-${idx}`}
                  className={`${plate.height} ${plate.color} min-w-7 px-1 rounded border flex items-center justify-center text-[10px] font-mono font-bold tabular-nums shadow-sm`}
                >
                  {plate.weight}
                </div>
              ))
            )}

            {/* Sleeve end */}
            <div className="h-2.5 w-8 rounded-r bg-slate-600" />
          </div>

          {/* Numeric breakdown */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">
              {groupedSummary.length > 0
                ? groupedSummary
                    .map(([w, count]) => `${count}× ${w} kg`)
                    .join(" + ")
                : "No plates needed"}
            </span>
            <span className="font-mono font-semibold text-white tabular-nums">
              Total: {result.actualTotal} kg
            </span>
          </div>
          {Math.abs(result.remainder) >= 0.01 && (
            <p className="mt-1.5 text-[11px] text-amber-400">
              Closest standard plate combo is {result.actualTotal} kg (diff{" "}
              {result.remainder > 0 ? `+${result.remainder}` : result.remainder}{" "}
              kg).
            </p>
          )}
        </div>

        {/* Apply button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
          {onApplyWeight && (
            <button
              type="button"
              onClick={() => {
                onApplyWeight(String(result.actualTotal));
                onClose();
              }}
              className="min-h-11 flex-1 rounded-xl bg-slate-100 px-4 text-xs font-semibold text-slate-950 hover:bg-white transition-colors tabular-nums"
            >
              Use {result.actualTotal} kg
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
