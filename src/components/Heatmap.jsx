import { useMemo } from "react";

export default function Heatmap({ data = {} }) {
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const totalWeeks = 20;
    const totalDays = totalWeeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    // Adjust to start on a Monday
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    const weeks = [];
    const months = [];
    let lastMonth = -1;
    const current = new Date(startDate);

    for (let w = 0; w < totalWeeks; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        const count = data[dateStr] || 0;
        const isFuture = current > today;
        week.push({ date: dateStr, count, isFuture });

        // Track month labels
        if (d === 0 && current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth();
          months.push({
            weekIndex: w,
            label: current.toLocaleString("en", { month: "short" }),
          });
        }

        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return { weeks, months };
  }, [data]);

  const getColor = (count, isFuture) => {
    if (isFuture) return "bg-slate-800/30";
    if (count === 0) return "bg-slate-800";
    if (count === 1) return "bg-emerald-900";
    if (count === 2) return "bg-emerald-600";
    return "bg-emerald-400";
  };

  const dayLabels = ["M", "", "W", "", "F", "", ""];

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5 min-w-fit">
        {/* Month labels */}
        <div className="flex ml-6 mb-1">
          {weeks.map((_, wi) => {
            const monthEntry = months.find((m) => m.weekIndex === wi);
            return (
              <div
                key={wi}
                className="w-3 mx-px text-[9px] text-slate-500 shrink-0"
              >
                {monthEntry ? monthEntry.label : ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 justify-start">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="w-4 h-3 text-[9px] text-slate-500 flex items-center justify-end pr-0.5"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`heatmap-cell w-3 h-3 rounded-xs ${getColor(day.count, day.isFuture)} cursor-default`}
                    title={`${day.date}: ${day.count} workout${day.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-6">
          <span className="text-[9px] text-slate-500 mr-1">Less</span>
          {[
            "bg-slate-800",
            "bg-emerald-900",
            "bg-emerald-600",
            "bg-emerald-400",
          ].map((color) => (
            <div key={color} className={`w-3 h-3 rounded-xs ${color}`} />
          ))}
          <span className="text-[9px] text-slate-500 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
