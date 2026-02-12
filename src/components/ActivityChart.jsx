import { useMemo } from "react";

// Intensity color scale (dark purples/violets)
const getIntensityColor = (count, maxCount) => {
  if (count === 0) return "bg-slate-800/40";
  const ratio = count / maxCount;
  if (ratio > 0.75) return "bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.4)]";
  if (ratio > 0.5) return "bg-violet-500/80";
  if (ratio > 0.25) return "bg-violet-600/60";
  return "bg-violet-700/40";
};

export default function ActivityChart({ data = {}, currentDate = new Date() }) {
  const chartData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const cells = [];
    // Padding for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        cells.push({ isPadding: true, key: `pad-${i}` });
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        // Use local date string YYYY-MM-DD for key matching with the data (which uses local YYYY-MM-DD from toISOString().split('T')[0] actually corresponds to UTC... let's check how data is saved).
        // data keys are usually toISOString().split('T')[0]. 
        // If data is saved using Date().toISOString(), it is UTC.
        // So we should construct the key using UTC to match.
        // However, the `currentDate` navigation is local time based.
        // Let's rely on the fact that `data` keys are "YYYY-MM-DD".
        // To generate the same key for a given day `d`:
        
        // Option 1: Create a date object in UTC for that day and toISOString it.
        const utcDate = new Date(Date.UTC(year, month, d));
        const dateStr = utcDate.toISOString().split("T")[0];
        
        cells.push({
          label: d,
          fullLabel: date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          count: data[dateStr] || 0,
          isCurrent: date.toDateString() === new Date().toDateString(),
          key: dateStr
        });
    }
    return cells;
  }, [data, currentDate]);

  const maxCount = useMemo(() => {
    // Filter out padding
    const counts = chartData.filter(c => !c.isPadding).map(d => d.count);
    return Math.max(...counts, 1);
  }, [chartData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="min-h-[120px]">
          {/* ── Calendar Grid ── */}
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
                point.isPadding ? (
                   <div key={point.key} className="aspect-square" />
                ) : (
                <div key={point.key} className="group relative">
                  <div
                    className={`aspect-square rounded-md transition-all duration-300 ${getIntensityColor(point.count, maxCount)} ${
                      point.isCurrent ? "ring-1 ring-violet-400/50 scale-[1.05] z-10" : ""
                    } hover:scale-110 cursor-default`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-20 shadow-lg">
                    {point.count} workout{point.count !== 1 ? 's' : ''} · {point.fullLabel}
                  </div>
                </div>
                )
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 justify-end px-1 mt-2">
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
      </div>
    </div>
  );
}
