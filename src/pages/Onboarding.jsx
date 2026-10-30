import { useState } from "react";
import { Dumbbell, ChevronRight, User, Droplets, Bell } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const steps = [
  { id: "welcome", title: "Welcome to GymTracker" },
  { id: "profile", title: "Your Profile" },
  { id: "preferences", title: "Preferences" },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const updateUserProfile = useWorkoutStore((s) => s.updateUserProfile);
  const completeOnboarding = useWorkoutStore((s) => s.completeOnboarding);
  const [form, setForm] = useState({ name: "", weight: "", height: "", age: "" });
  const [prefs, setPrefs] = useState({ reminders: true, sound: true });

  const handleFinish = () => {
    if (form.name) updateUserProfile({ name: form.name });
    if (form.weight) updateUserProfile({ weight: Number(form.weight) });
    if (form.height) updateUserProfile({ height: Number(form.height) });
    if (form.age) updateUserProfile({ age: Number(form.age) });
    completeOnboarding();
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-neon-blue"
                  : i < step
                    ? "w-4 bg-neon-blue/40"
                    : "w-4 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-slate-700 flex items-center justify-center">
              <Dumbbell size={40} className="text-neon-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to <span className="text-neon-blue">GymTracker</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track your workouts, nutrition, and progress — all in one place.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-neon-blue text-slate-950 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-3">
                <User size={24} className="text-neon-blue" />
              </div>
              <h2 className="text-lg font-bold text-white">Your Profile</h2>
              <p className="text-xs text-slate-500 mt-1">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors placeholder:text-slate-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="70"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="175"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="24"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 border border-slate-700 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] bg-neon-blue text-slate-950 py-3 rounded-xl text-sm font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <Bell size={24} className="text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">
                Set up your reminders
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setPrefs((p) => ({ ...p, reminders: !p.reminders }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  prefs.reminders
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Droplets size={18} className={prefs.reminders ? "text-cyan-400" : "text-slate-500"} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Water Reminders</p>
                    <p className="text-[10px] text-slate-500">Stay hydrated throughout the day</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all ${prefs.reminders ? "bg-cyan-500" : "bg-slate-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.reminders ? "ml-[22px]" : "ml-0.5"}`} />
                </div>
              </button>

              <button
                onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  prefs.sound
                    ? "bg-violet-500/10 border-violet-500/30"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className={prefs.sound ? "text-violet-400" : "text-slate-500"} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Notification Sounds</p>
                    <p className="text-[10px] text-slate-500">Play a chime for reminders</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all ${prefs.sound ? "bg-violet-500" : "bg-slate-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.sound ? "ml-[22px]" : "ml-0.5"}`} />
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] bg-neon-green text-slate-950 py-3 rounded-xl text-sm font-bold hover:bg-neon-green/90 active:scale-95 transition-all shadow-lg shadow-neon-green/20 flex items-center justify-center gap-2"
              >
                Start Training 🚀
              </button>
            </div>
          </div>
        )}

        {/* Skip link */}
        <button
          onClick={handleFinish}
          className="block mx-auto text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
        >
          Skip Setup →
        </button>
      </div>
    </div>
  );
}
