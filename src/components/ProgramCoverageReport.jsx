import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Dumbbell,
  Clock,
  Sparkles,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { analyzeProgramCoverage } from "../utils/exerciseSelectionLogic";
import { ANATOMICAL_REQUIREMENTS } from "../data/exerciseTaxonomy";

export default function ProgramCoverageReport({
  plan,
  title = "Biomechanical & Coverage Audit",
  titleAr = "تقرير التغطية التشريحية والحجم التدريبي",
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const exercises = useWorkoutStore((s) => s.exercises);

  // Compute coverage analysis
  const analysis = useMemo(() => {
    if (!plan) return null;
    return analyzeProgramCoverage({
      programs: plan.programs,
      schedule: plan.defaultSchedule,
      catalog: exercises,
      indirectWeight: 0.5,
    });
  }, [plan, exercises]);

  if (!analysis) return null;

  const statusColors = {
    complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    needs_data_review: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    not_in_library: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  const statusIcons = {
    complete: <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />,
    partial: <AlertTriangle size={13} className="text-amber-400 shrink-0" />,
    needs_data_review: <Info size={13} className="text-purple-400 shrink-0" />,
    not_in_library: <ShieldAlert size={13} className="text-rose-400 shrink-0" />,
  };

  const muscleLabels = {
    chest: { en: "Chest", ar: "الصدر", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
    back: { en: "Back", ar: "الظهر", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
    shoulders: { en: "Shoulders", ar: "الكتف", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
    legs: { en: "Legs", ar: "الأرجل", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    arms: { en: "Arms", ar: "الذراعين", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
    core: { en: "Core", ar: "البطن والجذع", color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  };

  return (
    <div className="mt-2 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all shadow-md">
      {/* Header Button: Toggle Accordion */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColors[analysis.status]}`}>
                {statusIcons[analysis.status]}
                <span>{analysis.statusAr}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{titleAr}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-medium">
            {isOpen ? "إخفاء التفاصيل" : "عرض التقرير"}
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 pt-1 space-y-4 border-t border-slate-800/60 animate-fadeIn">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Dumbbell size={10} /> التمارين الأسبوعية
              </p>
              <p className="text-sm font-bold text-white mt-0.5">{analysis.totalExercisesCount}</p>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Clock size={10} /> وقت الجلسة المقدر
              </p>
              <p className="text-sm font-bold text-neon-blue mt-0.5">~40-55 دقيقة</p>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500">حمل غير مباشر</p>
              <p className="text-sm font-bold text-neon-purple mt-0.5">محسوب بمعدل 0.5x</p>
            </div>
          </div>

          {/* Redundancy Alerts (if any) */}
          {analysis.detectedRedundancies.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle size={14} />
                <span>تنبيه: تشابه أو تكرار غير ضروري في بعض التمارين</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 pl-4 list-disc">
                {analysis.detectedRedundancies.map((r, i) => (
                  <li key={i}>{r.reasonAr}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Potential Gaps (if any) */}
          {analysis.gaps.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <Info size={14} />
                <span>ملاحظات التغطية وسد الفجوات التشريحية</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 pl-4 list-disc">
                {analysis.gaps.map((g, i) => (
                  <li key={i}>{g.issueAr}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Muscle-by-Muscle Functional Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              توزيع المجموعات العضلية والوظائف المستهدفة
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {Object.entries(analysis.muscleStats).map(([muscleKey, stats]) => {
                const meta = muscleLabels[muscleKey] || {
                  en: muscleKey,
                  ar: muscleKey,
                  color: "text-slate-300",
                  border: "border-slate-700",
                  bg: "bg-slate-800",
                };
                const vol = analysis.weeklyMuscleVolume[muscleKey] || { directSets: 0, indirectSets: 0, effectiveSets: 0 };
                const req = ANATOMICAL_REQUIREMENTS[muscleKey];

                return (
                  <div
                    key={muscleKey}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                  >
                    {/* Muscle Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${meta.color}`}>
                          {meta.ar} ({meta.en})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-white font-bold">{vol.directSets} جولة مباشرة</span>
                        {vol.indirectSets > 0 && (
                          <span className="text-slate-500">
                            + ({vol.indirectSets} غير مباشر)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Requirements description */}
                    {req && (
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        <span className="text-slate-500">معايير التدقيق: </span>
                        {req.descriptionAr}
                      </p>
                    )}

                    {/* Exercises targeting this muscle */}
                    <div className="space-y-1 pt-1">
                      {stats.exercises.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between text-[10px] py-0.5 border-b border-slate-900 last:border-none"
                        >
                          <div>
                            <span className="text-slate-200 font-medium">{ex.nameAr || ex.name}</span>
                            <span className="text-slate-500 ml-1.5 text-[9px]">({ex.role.replace(/_/g, " ")})</span>
                            <p className="text-[9px] text-slate-500 italic mt-0.5">{ex.rationale}</p>
                          </div>
                          <span className="text-slate-400 font-mono shrink-0 ml-2">{ex.sets} sets</span>
                        </div>
                      ))}
                      {stats.exercises.length === 0 && (
                        <p className="text-[10px] text-slate-500 italic">
                          يعتمد بالكامل على التحفيز غير المباشر من التمارين المركبة ({vol.indirectSets} جولة).
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
