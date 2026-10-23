import { useState } from "react";
import { Dumbbell, ChevronRight, User, Droplets, Bell } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const steps = [
  { id: "welcome", title: "Welcome" },
  { id: "profile", title: "Profile" },
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-teal-400"
                  : i < step
                    ? "w-4 bg-teal-400/40"
                    : "w-4 bg-surface-elevated"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Dumbbell size={30} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1.5 tracking-tight">
                Welcome to <span className="text-teal-400">GymTracker</span>
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                Log progressive overload, manage hypertrophy routines, and track nutrition with clarity.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-teal-500 text-slate-950 px-6 py-3 rounded-xl text-sm font-bold hover:bg-teal-400 active:scale-95 transition-all flex items-center justify-center gap-2 btn-press"
            >
              Get Started <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <div className="w-11 h-11 mx-auto rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-2">
                <User size={20} className="text-teal-400" />
              </div>
              <h2 className="text-base font-bold text-white">Athlete Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">Optional body metrics for tracking</p>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Athlete Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface text-white rounded-xl px-3.5 py-2.5 border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors placeholder:text-slate-500 text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="70"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Height (cm)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="175"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-medium">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="24"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-surface text-white rounded-xl px-3 py-2 border border-border focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/40 transition-colors text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-2.5 rounded-xl bg-surface-elevated text-slate-300 font-medium hover:bg-surface-hover transition-colors text-xs border border-border"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] bg-teal-500 text-slate-950 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 btn-press"
              >
                Continue <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <div className="w-11 h-11 mx-auto rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-2">
                <Bell size={20} className="text-teal-400" />
              </div>
              <h2 className="text-base font-bold text-white">Daily Reminders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Stay on track with hydration and cues</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setPrefs((p) => ({ ...p, reminders: !p.reminders }))}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  prefs.reminders
                    ? "bg-teal-500/10 border-teal-500/30"
                    : "bg-surface border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Droplets size={16} className={prefs.reminders ? "text-teal-400" : "text-slate-400"} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Water Reminders</p>
                    <p className="text-[10px] text-slate-400">Regular cues to drink water</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all ${prefs.reminders ? "bg-teal-500" : "bg-surface-elevated border border-border"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.reminders ? "ml-[18px]" : "ml-0.5"}`} />
                </div>
              </button>

              <button
                onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  prefs.sound
                    ? "bg-teal-500/10 border-teal-500/30"
                    : "bg-surface border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} className={prefs.sound ? "text-teal-400" : "text-slate-400"} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Rest Timer Chimes</p>
                    <p className="text-[10px] text-slate-400">Audible beep when rest is up</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all ${prefs.sound ? "bg-teal-500" : "bg-surface-elevated border border-border"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.sound ? "ml-[18px]" : "ml-0.5"}`} />
                </div>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl bg-surface-elevated text-slate-300 font-medium hover:bg-surface-hover transition-colors text-xs border border-border"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] bg-teal-500 text-slate-950 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 btn-press"
              >
                Start Training <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="block mx-auto text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          Skip Setup →
        </button>
      </div>
    </div>
  );
}
