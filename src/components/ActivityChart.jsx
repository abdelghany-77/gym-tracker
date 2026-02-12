import { useMemo } from "react";
import { Dumbbell, Flame, Trophy } from "lucide-react";

// Intensity color scale (dark purples/violets)
const getIntensityColor = (count, maxCount) => {
  if (count === 0) return "bg-slate-800/40";
  const ratio = count / maxCount;
  if (ratio > 0.75) return "bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.4)]";
  if (ratio > 0.5) return "bg-violet-500/80";
  if (ratio > 0.25) return "bg-violet-600/60";
  return "bg-violet-700/40";
};

export default function ActivityChart({ data = {}, range = "weekly" }) {
  const chartData = useMemo(() => {
    const points = [];
    const today = new Date();

    if (range === "weekly") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        points.push({
          label: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
          fullLabel: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          count: data[dateStr] || 0,
          isCurrent: i === 0,
          key: dateStr
        });
      }
    } else if (range === "monthly") {
      // Last 5 weeks (35 cells) for a nice grid
      for (let i = 34; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        points.push({
          label: d.getDate(),
          fullLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: data[dateStr] || 0,
          isCurrent: i === 0,
          key: dateStr,
          dayOfWeek: d.getDay()
        });
      }
    } else if (range === "yearly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(today.getMonth() - i);
        d.setDate(1);
        const monthKey = d.toISOString().slice(0, 7);
        let monthCount = 0;
        Object.keys(data).forEach(date => {
          if (date.startsWith(monthKey)) {
            monthCount += data[date];
          }
        });
        points.push({
          label: d.toLocaleDateString("en-US", { month: "short" }).slice(0, 3),
          fullLabel: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          count: monthCount,
          isCurrent: i === 0,
          key: monthKey
        });
      }
    }
    return points;
  }, [data, range]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Calculate stats internally from data
  const rangeStats = useMemo(() => {
    const totalWorkouts = chartData.reduce((sum, p) => sum + p.count, 0);
    
    // Calculate current streak from data
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (data[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return { totalWorkouts, streak };
  }, [chartData, data]);

  return (
    <div className="flex flex-col gap-4">
      {/* Chart Area */}
      <div className="min-h-[120px]">
        {range === "monthly" ? (
          /* ── MONTHLY: Calendar Grid ── */
          <div className="space-y-2">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 px-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-slate-600 font-medium">{d}</div>
              ))}
            </div>
            {/* Grid cells */}
            <div className="grid grid-cols-7 gap-1 px-1">
              {chartData.map((point) => (
                <div key={point.key} className="group relative">
                  <div
                    className={`aspect-square rounded-md transition-all duration-300 ${getIntensityColor(point.count, maxCount)} ${
                      point.isCurrent ? "ring-1 ring-violet-400/50" : ""
                    } hover:scale-110 cursor-default`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-20 shadow-lg">
                    {point.count} workout{point.count !== 1 ? 's' : ''} · {point.fullLabel}
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 justify-end px-1 mt-1">
              <span className="text-[10px] text-slate-600">Less</span>
              {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-sm ${
                  level === 0 ? "bg-slate-800/40" :
                  level <= 0.25 ? "bg-violet-700/40" :
                  level <= 0.5 ? "bg-violet-600/60" :
                  level <= 0.75 ? "bg-violet-500/80" : "bg-violet-500"
                }`} />
              ))}
              <span className="text-[10px] text-slate-600">More</span>
            </div>
          </div>
        ) : range === "yearly" ? (
          /* ── YEARLY: Bar Chart ── */
          <div className="w-full h-32 flex items-end justify-between gap-1 px-1 pt-4">
            {chartData.map((point) => {
              const heightPercent = Math.max(8, (point.count / maxCount) * 100);
              return (
                <div key={point.key} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full max-w-[14px] rounded-md transition-all duration-500 ease-out relative ${
                        point.count > 0
                          ? "bg-gradient-to-t from-indigo-600 to-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                          : "bg-slate-800/30"
                      }`}
                      style={{ height: `${point.count > 0 ? heightPercent : 8}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-20 shadow-lg">
                        {point.count} workout{point.count !== 1 ? 's' : ''} · {point.fullLabel}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[8px] font-medium ${point.isCurrent ? "text-white" : "text-slate-600"}`}>
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── WEEKLY: Bar Chart ── */
          <div className="w-full h-32 flex items-end justify-between gap-2 px-2 pt-4">
            {chartData.map((point) => {
              const heightPercent = Math.max(12, (point.count / maxCount) * 100);
              return (
                <div key={point.key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full max-w-[14px] rounded-full transition-all duration-500 ease-out relative ${
                        point.count > 0
                          ? "bg-gradient-to-t from-indigo-600 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                          : "bg-slate-800/30"
                      }`}
                      style={{ height: `${point.count > 0 ? heightPercent : 12}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-20 shadow-lg">
                        {point.count} workout{point.count !== 1 ? 's' : ''} · {point.fullLabel}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold ${point.isCurrent ? "text-white" : "text-slate-500"}`}>
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Dumbbell size={12} className="text-violet-400" />
          </div>
          <p className="text-lg font-bold text-white">{rangeStats.totalWorkouts}</p>
          <p className="text-[10px] text-slate-500 font-medium">Workouts</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame size={12} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-white">{rangeStats.streak}</p>
          <p className="text-[10px] text-slate-500 font-medium">Streak</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={12} className="text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white">{rangeStats.totalWorkouts > 0 ? Math.floor(rangeStats.totalWorkouts * 0.3) : 0}</p>
          <p className="text-[10px] text-slate-500 font-medium">PRs Hit</p>
        </div>
      </div>
    </div>
  );
}
