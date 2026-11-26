import { useMemo, useState } from "react";
import { Flame, CalendarCheck2, Activity } from "lucide-react";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getIntensityClasses(count, maxCount, isFuture) {
  if (isFuture) {
    return "bg-bg-deep/40 border-slate-800/50 text-slate-600";
  }
  if (count === 0) {
    return "bg-bg-deep border-slate-800/90 text-slate-500 hover:border-slate-700 hover:text-slate-300";
  }
  const ratio = count / Math.max(maxCount, 1);
  if (count >= 3 || ratio > 0.75) {
    return "bg-emerald-400 border-emerald-300 text-slate-950 font-bold";
  }
  if (count === 2 || ratio > 0.45) {
    return "bg-emerald-500/65 border-emerald-400/70 text-white font-bold";
  }
  return "bg-emerald-500/25 border-emerald-500/45 text-emerald-200 font-semibold";
}

export default function ActivityChart({
  data = {},
  currentDate = new Date(),
  weeklyTargetDays = 4,
}) {
  const [selectedKey, setSelectedKey] = useState(null);

  const { cells, maxCount, summary, todayKey } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first start padding (0 = Mon ... 6 = Sun)
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

    const now = new Date();
    const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const list = [];
    for (let i = 0; i < firstDayOffset; i++) {
      list.push({ isPadding: true, key: `pad-${year}-${month}-${i}` });
    }

    let activeDays = 0;
    let totalSessions = 0;
    let maxVal = 0;
    let currentStreak = 0;
    let bestStreak = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const count = Number(data?.[dateStr]) || 0;
      const isToday = dateStr === localTodayStr;
      const isFuture = dateStr > localTodayStr;

      if (count > 0) {
        activeDays++;
        totalSessions += count;
        if (count > maxVal) maxVal = count;
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      list.push({
        isPadding: false,
        day: d,
        key: dateStr,
        fullLabel: dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        count,
        isToday,
        isFuture,
      });
    }

    const weeksInMonth = daysInMonth / 7;
    const targetDays = Math.max(
      1,
      Math.round(Math.max(1, weeklyTargetDays) * weeksInMonth),
    );
    const goalPercent = Math.min(
      100,
      Math.round((activeDays / targetDays) * 100),
    );

    return {
      cells: list,
      maxCount: Math.max(maxVal, 1),
      todayKey: localTodayStr,
      summary: {
        activeDays,
        totalSessions,
        bestStreak,
        targetDays,
        goalPercent,
      },
    };
  }, [data, currentDate, weeklyTargetDays]);

  const activeCell = useMemo(() => {
    const validCells = cells.filter((c) => !c.isPadding);
    if (selectedKey) {
      const found = validCells.find((c) => c.key === selectedKey);
      if (found) return found;
    }
    const todayCell = validCells.find((c) => c.key === todayKey);
    if (todayCell) return todayCell;
    const lastActive = [...validCells].reverse().find((c) => c.count > 0);
    return lastActive || validCells[0] || null;
  }, [cells, selectedKey, todayKey]);

  return (
    <div className="space-y-3.5">
      {/* ── Monthly Consistency Summary Strip ── */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="rounded-xl bg-bg-deep border border-slate-800/90 px-2 sm:px-3 py-2 sm:py-2.5 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
            <CalendarCheck2 size={11} className="text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Active Days</span>
          </div>
          <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {summary.activeDays}
            <span className="text-[11px] font-normal text-slate-500">
              /{summary.targetDays}
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-bg-deep border border-slate-800/90 px-2 sm:px-3 py-2 sm:py-2.5 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
            <Activity size={11} className="text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">Sessions</span>
          </div>
          <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {summary.totalSessions}
          </p>
        </div>

        <div className="rounded-xl bg-bg-deep border border-slate-800/90 px-2 sm:px-3 py-2 sm:py-2.5 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
            <Flame size={11} className="text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Best Streak</span>
          </div>
          <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {summary.bestStreak}d
          </p>
        </div>
      </div>

      {/* ── Monthly Goal Progress Bar ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Monthly Consistency Progress
          </span>
          <span className="font-mono tabular-nums font-semibold text-emerald-400">
            {summary.goalPercent}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Monthly training consistency"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.goalPercent}
          className="h-2 w-full rounded-full bg-bg-deep border border-slate-800 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
            style={{ width: `${summary.goalPercent}%` }}
          />
        </div>
      </div>

      {/* ── Monday-First Interactive Heatmap Grid ── */}
      <div className="rounded-xl border border-slate-800/90 bg-bg-deep/50 p-3 space-y-2">
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell) => {
            if (cell.isPadding) {
              return <div key={cell.key} className="aspect-square" />;
            }
            const isSelected = activeCell?.key === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelectedKey(cell.key)}
                aria-label={`${cell.fullLabel}: ${cell.count} workout${cell.count === 1 ? "" : "s"}`}
                aria-pressed={isSelected}
                className={`aspect-square rounded-lg border text-[11px] font-mono tabular-nums flex items-center justify-center transition-all relative ${getIntensityClasses(
                  cell.count,
                  maxCount,
                  cell.isFuture,
                )} ${
                  isSelected
                    ? "ring-2 ring-slate-100 ring-offset-1 ring-offset-bg-deep scale-[1.03] z-10"
                    : cell.isToday
                      ? "ring-1 ring-sky-400/70"
                      : ""
                }`}
              >
                <span>{cell.day}</span>
                {cell.isToday && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      cell.count > 0 ? "bg-slate-950" : "bg-sky-400"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Touch-Friendly Day Inspector & Intensity Legend ── */}
        <div className="pt-2.5 mt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-300 min-w-0">
            {activeCell ? (
              <span>
                <strong className="text-white font-semibold">
                  {activeCell.fullLabel}
                </strong>{" "}
                ·{" "}
                {activeCell.count > 0 ? (
                  <span className="text-emerald-400 font-medium font-mono tabular-nums">
                    {activeCell.count} workout
                    {activeCell.count === 1 ? "" : "s"}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    {activeCell.isFuture ? "Upcoming" : "Rest day"}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500">Tap any day for details</span>
            )}
          </div>

          <div
            className="flex items-center gap-1.5 shrink-0"
            aria-label="Activity intensity legend"
          >
            <span className="text-[10px] text-slate-500">Less</span>
            <span className="w-3 h-3 rounded-sm bg-bg-deep border border-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/25 border border-emerald-500/45" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/65 border border-emerald-400/70" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
            <span className="text-[10px] text-slate-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
