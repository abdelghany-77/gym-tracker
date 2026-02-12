import { useMemo } from "react";

export default function ActivityChart({ data = {}, range = "weekly" }) {
  const chartData = useMemo(() => {
    const points = [];
    const today = new Date();
    
    if (range === "weekly") {
      // Last 7 days
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
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        
        points.push({
          label: i % 5 === 0 ? d.getDate() : "", // Show date every 5 days to avoid clutter
          fullLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: data[dateStr] || 0,
          isCurrent: i === 0,
          key: dateStr
        });
      }
    } else if (range === "yearly") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(today.getMonth() - i);
        d.setDate(1); // Set to 1st to avoid edge cases with varying month lengths
        const monthKey = d.toISOString().slice(0, 7); // "2024-02"
        
        // Aggregate counts for this month
        let monthCount = 0;
        Object.keys(data).forEach(date => {
            if (date.startsWith(monthKey)) {
                monthCount += data[date];
            }
        });

        points.push({
          label: d.toLocaleDateString("en-US", { month: "narrow" }),
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

  return (
    <div className="w-full h-40 flex items-end justify-between gap-1 px-2 pt-6">
      {chartData.map((point) => {
        const heightPercent = Math.max(10, (point.count / maxCount) * 100);
        
        // Dynamic styling based on density
        const barWidth = range === "monthly" ? "max-w-[6px]" : "max-w-[12px]";
        const gap = range === "monthly" ? "gap-0.5" : "gap-2";
        
        return (
          <div key={point.key} className={`flex-1 flex flex-col items-center ${gap} group h-full justify-end`}>
            <div className="relative w-full flex items-end justify-center h-full">
              <div
                className={`w-full ${barWidth} rounded-full transition-all duration-500 ease-out relative ${
                   point.count > 0 
                     ? "bg-linear-to-t from-neon-blue to-neon-purple shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
                     : "bg-slate-800/50"
                }`}
                style={{ height: `${point.count > 0 ? heightPercent : 10}%` }}
              >
                 {/* Tooltip */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-20 shadow-xl">
                    <p className="font-bold text-center">{point.count}</p>
                    <p className="text-slate-400 text-[9px]">{point.fullLabel}</p>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700" />
                 </div>
              </div>
            </div>
            {/* Labels - hide some for dense views */}
            <span className={`text-[9px] font-medium h-3 flex items-center ${point.isCurrent ? "text-white" : "text-slate-500"}`}>
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
