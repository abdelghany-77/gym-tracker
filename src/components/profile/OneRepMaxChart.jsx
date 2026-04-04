import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Dumbbell } from "lucide-react";
import useWorkoutStore from "../../store/workoutStore";

// Epley Formula
const calculate1RM = (weight, reps) => {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export default function OneRepMaxChart() {
  const history = useWorkoutStore((s) => s.history);
  const globalExercises = useWorkoutStore((s) => s.exercises);

  // Group history by exercise to find which exercises have data
  const exercisesWithData = useMemo(() => {
    const exerciseSet = new Set();
    history.forEach((session) => {
      session.exercises.forEach((ex) => {
        exerciseSet.add(ex.exerciseId);
      });
    });
    
    return Array.from(exerciseSet)
      .map(id => globalExercises.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [history, globalExercises]);

  const [selectedExercise, setSelectedExercise] = useState(() => {
    if (exercisesWithData.some(e => e.id === "chest_barbell_bench")) return "chest_barbell_bench";
    return exercisesWithData[0]?.id || "";
  });

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const dataPoints = [];
    
    history.forEach((session) => {
      const exerciseInSession = session.exercises.find(e => e.exerciseId === selectedExercise);
      if (exerciseInSession) {
         // Find best 1RM in this session
         let best1RM = 0;
         exerciseInSession.sets.forEach(set => {
            const current1RM = calculate1RM(set.weight, set.reps);
            if (current1RM > best1RM) best1RM = current1RM;
         });

         if (best1RM > 0) {
            dataPoints.push({
               date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
               rawDate: new Date(session.date).getTime(),
               orm: best1RM
            });
         }
      }
    });

    // Sort by date ascending
    return dataPoints.sort((a, b) => a.rawDate - b.rawDate);
  }, [history, selectedExercise]);

  if (exercisesWithData.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={14} className="text-neon-blue" />
          1RM Progression
        </h2>
        
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-slate-800 text-sm text-slate-300 rounded-xl px-3 py-1.5 border border-slate-700 outline-none focus:border-neon-blue"
        >
          {exercisesWithData.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {chartData.length < 2 ? (
        <div className="text-center py-6">
           <Dumbbell size={24} className="mx-auto text-slate-700 mb-2" />
           <p className="text-xs text-slate-500">Perform this exercise in at least 2 sessions to see progression.</p>
        </div>
      ) : (
        <div className="w-full h-56 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                 itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                 labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                 formatter={(value) => [`${value} kg`, "Estimated 1RM"]}
              />
              <Area type="monotone" dataKey="orm" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorOrm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
