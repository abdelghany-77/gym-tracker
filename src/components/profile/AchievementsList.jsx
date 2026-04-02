import { Trophy, Award, Dumbbell } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";
import { useMemo } from "react";

const achievementIcons = {
  flag: Trophy, // simplified map
  dumbbell: Dumbbell,
  flame: Award,
  zap: Award,
  crown: Trophy,
  trophy: Trophy,
  target: Award,
  "bar-chart": Award,
  rocket: Award,
};

export default function AchievementsList() {
  const getAchievements = useWorkoutStore((s) => s.getAchievements);
  const achievements = useMemo(() => getAchievements(), [getAchievements]);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Trophy size={14} className="text-amber-400" />
        Achievements
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {achievements.map((a) => {
          const IconComponent = achievementIcons[a.icon] || Award;
          return (
            <div
              key={a.id}
              className={`relative group aspect-square rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 border transition-all ${
                a.earned
                  ? "bg-slate-800 border-slate-700 hover:border-neon-blue/50"
                  : "bg-slate-900/50 border-slate-800 opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  a.earned
                    ? "bg-neon-blue/10 text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                <IconComponent size={20} />
              </div>
              <div className="space-y-0.5">
                <p
                  className={`text-[10px] font-semibold leading-tight ${
                    a.earned ? "text-white" : "text-slate-500"
                  }`}
                >
                  {a.label}
                </p>
              </div>
              {a.earned && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
