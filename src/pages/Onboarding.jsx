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
  const [form, setForm] = useState({
    name: "",
    weight: "",
    height: "",
    age: "",
  });
  const [prefs, setPrefs] = useState(() => ({
    reminders: useWorkoutStore.getState().remindersEnabled,
    sound: useWorkoutStore.getState().soundEnabled,
  }));

  const handleFinish = () => {
    const profile = {};
    if (form.name.trim()) profile.name = form.name.trim();
    for (const key of ["weight", "height", "age"]) {
      if (form[key]) profile[key] = Number(form[key]);
    }
    if (Object.keys(profile).length) updateUserProfile(profile);
    const store = useWorkoutStore.getState();
    if (prefs.reminders !== store.remindersEnabled) store.toggleReminders();
    if (prefs.sound !== store.soundEnabled) store.toggleSound();
    completeOnboarding();
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-bg-surface p-6 sm:p-7 space-y-7">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-slate-100"
                  : i < step
                    ? "w-4 bg-slate-400"
                    : "w-4 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 text-slate-950 flex items-center justify-center">
              <Dumbbell size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Welcome to GymTracker
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track your workouts, nutrition, and progress — all in one place.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full min-h-12 bg-slate-100 text-slate-950 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setStep(2);
            }}
            className="space-y-6 animate-fadeIn"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-bg-deep border border-slate-800 flex items-center justify-center mb-3">
                <User size={22} className="text-slate-200" />
              </div>
              <h2 className="text-lg font-bold text-white">Your Profile</h2>
              <p className="text-xs text-slate-400 mt-1">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                aria-label="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full min-h-11 bg-bg-deep text-white rounded-xl px-4 py-3 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors placeholder:text-slate-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    htmlFor="onboarding-weight"
                    className="text-[11px] text-slate-400 mb-1 block"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    id="onboarding-weight"
                    min="0.1"
                    step="any"
                    placeholder="70"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="w-full min-h-11 bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 py-2.5 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="onboarding-height"
                    className="text-[11px] text-slate-400 mb-1 block"
                  >
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    id="onboarding-height"
                    min="0.1"
                    step="any"
                    placeholder="175"
                    value={form.height}
                    onChange={(e) =>
                      setForm({ ...form, height: e.target.value })
                    }
                    className="w-full min-h-11 bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 py-2.5 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="onboarding-age"
                    className="text-[11px] text-slate-400 mb-1 block"
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    id="onboarding-age"
                    min="1"
                    step="1"
                    placeholder="24"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full min-h-11 bg-bg-deep text-white font-mono tabular-nums rounded-xl px-3 py-2.5 border border-slate-700 focus:border-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 min-h-11 py-3 rounded-xl bg-bg-deep border border-slate-700 text-slate-300 font-medium hover:text-white transition-colors text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-[2] min-h-11 bg-slate-100 text-slate-950 py-3 rounded-xl text-sm font-bold hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-bg-deep border border-slate-800 flex items-center justify-center mb-3">
                <Bell size={22} className="text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
              <p className="text-xs text-slate-400 mt-1">
                Set up your reminders
              </p>
            </div>

            <div className="space-y-3">
              <button
                role="switch"
                aria-label="Water Reminders"
                aria-checked={prefs.reminders}
                onClick={() =>
                  setPrefs((p) => ({ ...p, reminders: !p.reminders }))
                }
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  prefs.reminders
                    ? "bg-sky-500/10 border-sky-500/30"
                    : "bg-bg-deep border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Droplets
                    size={18}
                    className={
                      prefs.reminders ? "text-sky-400" : "text-slate-500"
                    }
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      Water Reminders
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Stay hydrated throughout the day
                    </p>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-all shrink-0 ${prefs.reminders ? "bg-sky-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.reminders ? "ml-[22px]" : "ml-0.5"}`}
                  />
                </div>
              </button>

              <button
                role="switch"
                aria-label="Notification Sounds"
                aria-checked={prefs.sound}
                onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  prefs.sound
                    ? "bg-violet-500/10 border-violet-500/30"
                    : "bg-bg-deep border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className={
                      prefs.sound ? "text-violet-400" : "text-slate-500"
                    }
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      Notification Sounds
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Play a chime for reminders
                    </p>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-all shrink-0 ${prefs.sound ? "bg-violet-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${prefs.sound ? "ml-[22px]" : "ml-0.5"}`}
                  />
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 min-h-11 py-3 rounded-xl bg-bg-deep border border-slate-700 text-slate-300 font-medium hover:text-white transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] min-h-11 bg-emerald-500 text-slate-950 py-3 rounded-xl text-sm font-bold hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Start Training
              </button>
            </div>
          </div>
        )}

        {/* Skip link */}
        <button
          onClick={() => {
            completeOnboarding();
            onComplete?.();
          }}
          className="block mx-auto min-h-9 px-3 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Skip Setup →
        </button>
      </div>
    </div>
  );
}
