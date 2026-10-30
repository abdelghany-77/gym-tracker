import { useState } from "react";
import {
  Zap,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Target,
  Crown,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { trainingPlans } from "../data/exercises";
import { ConfirmDialog } from "./Modal";

const planMeta = {
  ppl_upper: {
    icon: Zap,
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    borderActive: "border-neon-blue/60 shadow-[0_0_20px_rgba(0,212,255,0.15)]",
    borderIdle: "border-slate-700/50 hover:border-slate-600",
    accentColor: "text-neon-blue",
    accentBg: "bg-neon-blue/10",
    accentBorder: "border-neon-blue/20",
    tagBg: "bg-neon-blue/15 text-neon-blue border-neon-blue/25",
    glowClass: "animate-neon-glow-blue",
    checkColor: "text-neon-blue",
    badgeBg: "bg-neon-blue",
    highlights: [
      "Push / Pull / Legs / Upper",
      "Compound + Isolation mix",
      "Full body coverage in 4 days",
      "Ideal for intermediate-advanced",
    ],
  },
  bro_split: {
    icon: Crown,
    gradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
    borderActive: "border-neon-purple/60 shadow-[0_0_20px_rgba(179,71,217,0.15)]",
    borderIdle: "border-slate-700/50 hover:border-slate-600",
    accentColor: "text-neon-purple",
    accentBg: "bg-neon-purple/10",
    accentBorder: "border-neon-purple/20",
    tagBg: "bg-neon-purple/15 text-neon-purple border-neon-purple/25",
    glowClass: "animate-neon-glow-purple",
    checkColor: "text-neon-purple",
    badgeBg: "bg-neon-purple",
    highlights: [
      "One muscle group per day",
      "Maximum volume per muscle",
      "Classic bodybuilding style",
      "Great for building mass",
    ],
  },
};

export default function ProgramSelector() {
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const setActiveProgram = useWorkoutStore((s) => s.setActiveProgram);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const [pendingSwitch, setPendingSwitch] = useState(null);

  const handleSelect = (planId) => {
    if (planId === activeProgram) return;
    setPendingSwitch(planId);
  };

  const confirmSwitch = () => {
    if (pendingSwitch) {
      setActiveProgram(pendingSwitch);
      setPendingSwitch(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-slate-700 flex items-center justify-center">
          <ArrowRightLeft size={14} className="text-neon-blue" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Training Program</h2>
          <p className="text-[10px] text-slate-500">Choose your workout architecture</p>
        </div>
      </div>

      {/* Program Cards */}
      <div className="space-y-3">
        {Object.entries(trainingPlans).map(([planId, plan]) => {
          const isActive = planId === activeProgram;
          const meta = planMeta[planId];
          const Icon = meta.icon;
          const programList = Object.values(plan.programs);

          return (
            <button
              key={planId}
              onClick={() => handleSelect(planId)}
              className={`
                w-full text-left rounded-2xl p-4 border-[1.5px] transition-all duration-300 relative overflow-hidden group
                ${isActive
                  ? `${meta.borderActive} bg-slate-900/90 ${meta.glowClass}`
                  : `${meta.borderIdle} bg-slate-900/50 hover:bg-slate-900/70 active:scale-[0.98]`
                }
              `}
              aria-label={`${isActive ? "Active: " : "Switch to "}${plan.name} — ${plan.description}`}
              aria-pressed={isActive}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-60 pointer-events-none`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Top row: Icon + Name + Tag */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isActive
                        ? `${meta.accentBg} ${meta.accentBorder}`
                        : "bg-slate-800 border-slate-700"
                    } transition-colors`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? meta.accentColor : "text-slate-500"}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                        {plan.name}
                      </h3>
                      {isActive && (
                        <CheckCircle2
                          size={16}
                          className={`${meta.checkColor} shrink-0 animate-cardIn`}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{plan.nameAr}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      isActive ? meta.tagBg : "bg-slate-800/80 text-slate-400 border-slate-700"
                    }`}
                  >
                    {plan.tagIcon} {plan.tag}
                  </span>
                </div>

                {/* Day schedule preview */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Calendar size={11} className="text-slate-500 shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {programList.map((prog, i) => (
                      <span
                        key={prog.id}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          isActive
                            ? `${meta.accentBg} ${meta.accentColor} border ${meta.accentBorder}`
                            : "bg-slate-800/60 text-slate-400 border border-slate-700/50"
                        }`}
                      >
                        D{i + 1}: {prog.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {meta.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Target
                        size={8}
                        className={isActive ? meta.accentColor : "text-slate-600"}
                      />
                      <span className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Exercises count */}
                <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell size={11} className="text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium">
                      {programList.reduce((acc, p) => acc + p.exercises.length, 0)} exercises across {plan.daysPerWeek} days
                    </span>
                  </div>
                  {isActive && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.accentColor} opacity-60`}>
                      Active
                    </span>
                  )}
                  {!isActive && (
                    <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                      Tap to switch →
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingSwitch}
        onClose={() => setPendingSwitch(null)}
        onConfirm={confirmSwitch}
        title="Switch Training Program?"
        message={
          activeWorkout
            ? "Your current active workout will be cancelled and the weekly schedule will be reset to the new program's defaults. Workout history is preserved."
            : "The weekly schedule will be reset to the new program's defaults. Your workout history and exercise library will be preserved."
        }
        confirmText="Switch Program"
        cancelText="Keep Current"
        variant={activeWorkout ? "danger" : "default"}
        icon={<AlertTriangle size={20} className="text-amber-400" />}
      />
    </div>
  );
}
