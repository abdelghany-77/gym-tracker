import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  Calendar,
  Play,
  ChevronRight,
  Activity,
  Dumbbell,
  Library,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { trainingPlans } from "../data/exercises";
import { getImageUrl } from "../utils/imageUtil";

const categories = ["All", "Strength", "Hypertrophy", "Conditioning"];

export default function WorkoutSelect() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const programs = useWorkoutStore((s) => s.programs);
  const exercises = useWorkoutStore((s) => s.exercises);
  const activeProgram = useWorkoutStore((s) => s.activeProgram);
  const activePlan = trainingPlans[activeProgram] || trainingPlans.ppl_upper;

  const programList = useMemo(() => Object.values(programs), [programs]);

  // Filter programs based on selected category tag
  const filteredPrograms = useMemo(() => {
    if (selectedCategory === "All") return programList;
    return programList.filter((prog) => {
      const name = prog.name.toLowerCase();
      const muscles = (prog.muscles || []).map((m) => m.toLowerCase());
      if (selectedCategory === "Strength") {
        return name.includes("power") || name.includes("bench") || name.includes("squat") || name.includes("chest") || name.includes("upper");
      }
      if (selectedCategory === "Hypertrophy") {
        return name.includes("leg") || name.includes("back") || name.includes("shoulder") || name.includes("arm") || name.includes("pull") || name.includes("push");
      }
      if (selectedCategory === "Conditioning") {
        return name.includes("hiit") || name.includes("core") || muscles.includes("core");
      }
      return true;
    });
  }, [programList, selectedCategory]);

  const handleStartWorkout = (programId) => {
    startWorkout(programId);
    navigate("/workout/active");
  };

  // Get primary illustrated thumbnail for program
  const getProgramIllustration = (program) => {
    if (!program.exercises || program.exercises.length === 0) {
      return "/exercises/chest_bb_flat_bench.png";
    }
    const firstExId = program.exercises[0];
    const ex = exercises.find((e) => e.id === firstExId);
    return ex?.image || `/exercises/${firstExId}.png`;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4 animate-fadeIn">
      {/* ═══ TOP HEADER (Matches Reference Panel 2) ═══ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#F1F5F7]">Workout Plans</h1>

        <button
          type="button"
          onClick={() => navigate("/exercises")}
          className="w-10 h-10 rounded-2xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center transition-all active:scale-95"
          aria-label="Filter or view library"
          title="Exercise Library"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* ═══ CATEGORY FILTER CHIPS (Matches Reference Panel 2) ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                isActive
                  ? "bg-[#C4E58A] text-[#0D1723] font-bold shadow-[0_0_12px_rgba(196,229,138,0.3)]"
                  : "bg-[#142332] text-[#8E9FA5] border border-[#223348] hover:text-[#F1F5F7] hover:border-[#2B4660]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ═══ ACTIVE WORKOUT RESUME BANNER ═══ */}
      {activeWorkout && (
        <button
          type="button"
          onClick={() => navigate("/workout/active")}
          className="w-full bg-[#142332] rounded-2xl p-3.5 border border-[#C4E58A]/40 hover:border-[#C4E58A] transition-all text-left active:scale-[0.99] shadow-md flex items-center justify-between"
          aria-label={`Resume active workout: ${activeWorkout.programName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#C4E58A] text-[#0D1723] flex items-center justify-center font-bold shrink-0">
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#C4E58A] font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} /> Active Workout In Progress
              </p>
              <p className="text-sm font-bold text-[#F1F5F7] truncate mt-0.5">
                {activeWorkout.programName}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#C4E58A] shrink-0 ml-2" />
        </button>
      )}

      {/* ═══ WORKOUT PLAN CARDS LIST (Matches Reference Panel 2) ═══ */}
      <div className="space-y-3">
        {filteredPrograms.map((program) => {
          const illustrationSrc = getProgramIllustration(program);
          const duration = program.exercises ? program.exercises.length * 5 : 45;
          const frequency = program.daysPerWeek || (program.muscles?.length > 2 ? 4 : 3);

          return (
            <div
              key={program.id}
              className="rounded-2xl bg-[#142332] border border-[#223348] p-3.5 hover:border-[#2B4660] transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Exercise Movement Illustrated Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-[#192C3C] border border-[#223348] overflow-hidden flex items-center justify-center shrink-0 p-1">
                  <img
                    src={getImageUrl(illustrationSrc)}
                    alt={program.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getImageUrl("/exercises/chest_bb_flat_bench.png");
                    }}
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-bold text-[#F1F5F7] truncate leading-tight">
                    {program.name}
                  </h3>

                  {/* Muscle / Goal Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(program.muscles || ["Strength"]).slice(0, 2).map((m) => (
                      <span
                        key={m}
                        className="text-[9px] font-semibold text-[#A8B7C5] bg-[#192C3C] border border-[#223348] px-2.5 py-0.5 rounded-lg"
                      >
                        {m}
                      </span>
                    ))}
                    <span className="text-[9px] font-semibold text-[#A8B7C5] bg-[#192C3C] border border-[#223348] px-2.5 py-0.5 rounded-lg">
                      Muscle Building
                    </span>
                  </div>

                  {/* Frequency and Duration */}
                  <p className="text-[11px] text-[#8E9FA5] flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-[#8E9FA5]" />
                      {frequency} days/week
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-[#8E9FA5]" />
                      ~{duration} min
                    </span>
                  </p>
                </div>
              </div>

              {/* Start Button: Lime Green Pill */}
              <button
                type="button"
                onClick={() => handleStartWorkout(program.id)}
                className="bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0 shadow-[0_0_12px_rgba(196,229,138,0.2)]"
                aria-label={`Start ${program.name}`}
              >
                Start
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
