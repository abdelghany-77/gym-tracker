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
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-accent"
                  : i < step
                    ? "w-4 bg-accent/40"
                    : "w-4 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-5 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/10 border border-border-slate flex items-center justify-center">
              <Dumbbell size={36} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1.5">
                Welcome to <span className="text-accent">GymTracker</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track your workouts, nutrition, and progress — all in one place.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-accent text-bg-deep px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
                <User size={22} className="text-accent" />
              </div>
              <h2 className="text-base font-bold text-white">Your Profile</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Help us personalize your experience</p>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-bg-card text-white rounded-xl px-4 py-3 border border-border-slate focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors placeholder:text-slate-600"
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
                    className="w-full bg-bg-card text-white rounded-xl px-3 py-2.5 border border-border-slate focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
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
                    className="w-full bg-bg-card text-white rounded-xl px-3 py-2.5 border border-border-slate focus:border-neon-emerald focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition-colors"
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
                    className="w-full bg-bg-card text-white rounded-xl px-3 py-2.5 border border-border-slate focus:border-vivid-purple focus:outline-none focus:ring-1 focus:ring-vivid-purple/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-2.5 rounded-xl bg-bg-card text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm border border-border-slate"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] bg-accent text-bg-deep py-2.5 rounded-xl text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
                <Bell size={22} className="text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white">Preferences</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Set up your reminders</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setPrefs((p) => ({ ...p, reminders: !p.reminders }))}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  prefs.reminders
                    ? "bg-accent/8 border-accent/25"
                    : "bg-bg-card border-border-slate"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Droplets size={16} className={prefs.reminders ? "text-accent" : "text-slate-500"} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Water Reminders</p>
                    <p className="text-[10px] text-slate-500">Stay hydrated throughout the day</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all ${prefs.reminders ? "bg-accent" : "bg-slate-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.reminders ? "ml-[18px]" : "ml-0.5"}`} />
                </div>
              </button>

              <button
                onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  prefs.sound
                    ? "bg-vivid-purple/8 border-vivid-purple/25"
                    : "bg-bg-card border-border-slate"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} className={prefs.sound ? "text-vivid-purple" : "text-slate-500"} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Notification Sounds</p>
                    <p className="text-[10px] text-slate-500">Play a chime for reminders</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all ${prefs.sound ? "bg-vivid-purple" : "bg-slate-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.sound ? "ml-[18px]" : "ml-0.5"}`} />
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl bg-bg-card text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm border border-border-slate"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] bg-neon-emerald text-bg-deep py-2.5 rounded-xl text-sm font-bold hover:bg-neon-emerald/90 active:scale-95 transition-all flex items-center justify-center gap-2"
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
