import { useState } from "react";
import {
  Calendar,
  Moon,
  Dumbbell,
  X,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleEditor() {
  const weeklySchedule = useWorkoutStore((s) => s.weeklySchedule);
  const programs = useWorkoutStore((s) => s.programs);
  const setSchedule = useWorkoutStore((s) => s.setSchedule);
  const [editingDay, setEditingDay] = useState(null);

  const programList = Object.values(programs);

  const getDayProgram = (dayIndex) => {
    const programId = weeklySchedule[dayIndex];
    if (!programId || programId === "rest") return null;
    return programs[programId];
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Calendar size={14} className="text-neon-blue" />
        Weekly Schedule
      </h2>

      <div className="space-y-1.5">
        {DAYS.map((day, i) => {
          const program = getDayProgram(i);
          const isRest = weeklySchedule[i] === "rest" || !weeklySchedule[i];

          return (
            <button
              key={i}
              onClick={() => setEditingDay(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                isRest
                  ? "bg-slate-800/30 border-slate-800 hover:border-slate-700"
                  : "bg-neon-blue/5 border-neon-blue/20 hover:border-neon-blue/40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isRest
                    ? "bg-slate-800 text-slate-500"
                    : "bg-neon-blue/10 text-neon-blue"
                }`}
              >
                {isRest ? <Moon size={16} /> : <Dumbbell size={16} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-slate-500 font-medium">{day}</p>
                <p
                  className={`text-sm font-semibold truncate ${
                    isRest ? "text-slate-400" : "text-white"
                  }`}
                >
                  {isRest ? "Rest Day" : program?.name}
                </p>
              </div>
              {!isRest && program && (
                <span className="text-[10px] text-slate-500 shrink-0">
                  {program.exercises.length} exercises
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Edit modal */}
      {editingDay !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setEditingDay(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-700 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Set ${DAYS[editingDay]} workout`}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">
                {DAYS[editingDay]}&apos;s Workout
              </h3>
              <button
                onClick={() => setEditingDay(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Rest option */}
              <button
                onClick={() => {
                  setSchedule(editingDay, "rest");
                  setEditingDay(null);
                }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all border ${
                  weeklySchedule[editingDay] === "rest" ||
                  !weeklySchedule[editingDay]
                    ? "bg-slate-800 border-slate-700"
                    : "border-transparent hover:bg-slate-800/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-700 text-slate-300">
                  <Moon size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Rest Day</p>
                  <p className="text-[11px] text-slate-500">
                    Recover &amp; Sleep
                  </p>
                </div>
              </button>

              <div className="h-px bg-slate-800/50 my-2 mx-4" />

              {/* Program options */}
              {programList.map((program) => {
                const isActive = weeklySchedule[editingDay] === program.id;
                return (
                  <button
                    key={program.id}
                    onClick={() => {
                      setSchedule(editingDay, program.id);
                      setEditingDay(null);
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all border ${
                      isActive
                        ? "bg-neon-blue/5 border-neon-blue/20"
                        : "border-transparent hover:bg-slate-800/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? "bg-neon-blue text-slate-950"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <Dumbbell size={18} />
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-300"}`}
                      >
                        {program.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {program.muscles?.join(", ")}
                      </p>
                    </div>
                    {isActive && (
                      <span className="ml-auto text-xs font-bold text-neon-blue">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
