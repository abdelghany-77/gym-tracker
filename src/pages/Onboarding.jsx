import { useState } from "react";
import { Dumbbell, ChevronRight, User, Droplets, Bell, ArrowLeft } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const steps = [
  { id: "welcome", title: "Welcome to Gym Tracker" },
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
    <div className="min-h-screen bg-[#0D1723] text-[#F1F5F7] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* ═══ TOP STEP INDICATORS & BACK (Matches Reference Panel 10) ═══ */}
      <div className="w-full max-w-sm mx-auto space-y-4 pt-2">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="w-9 h-9 rounded-xl bg-[#142332] border border-[#223348] text-[#8E9FA5] hover:text-[#F1F5F7] flex items-center justify-center"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}

          {/* Horizontal Step Bars */}
          <div className="flex items-center gap-1.5 flex-1 max-w-[140px] mx-auto">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i === step
                    ? "bg-[#C4E58A]"
                    : i < step
                      ? "bg-[#C4E58A]/50"
                      : "bg-[#223348]"
                }`}
              />
            ))}
          </div>

          <div className="w-9 h-9" />
        </div>
      </div>

      {/* ═══ STEP 0: WELCOME HERO (Matches Reference Panel 10) ═══ */}
      {step === 0 && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between py-6 animate-fadeIn">
          {/* Athletic Hero Visual */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-gradient-to-b from-[#142332] to-[#0D1723] border border-[#223348] flex items-center justify-center shadow-xl">
            {/* Visual SVG Graphic depicting athletic silhouette with mountains/energy */}
            <svg viewBox="0 0 320 380" fill="none" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="skyGrad" x1="160" y1="0" x2="160" y2="380" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1E3246" />
                  <stop offset="0.5" stopColor="#142332" />
                  <stop offset="1" stopColor="#0D1723" />
                </linearGradient>
                <linearGradient id="sunGlow" x1="160" y1="120" x2="160" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C4E58A" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#73C8B4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="320" height="380" fill="url(#skyGrad)" />
              <circle cx="160" cy="180" r="100" fill="url(#sunGlow)" />
              {/* Mountain silhouettes */}
              <path d="M0 260 L60 210 L140 280 L220 190 L320 300 L320 380 L0 380 Z" fill="#142332" opacity="0.6" />
              <path d="M0 300 L90 250 L180 320 L270 230 L320 280 L320 380 L0 380 Z" fill="#0D1723" opacity="0.8" />
              {/* Athlete Figure Silhouette */}
              <g fill="#0B131D" stroke="#73C8B4" strokeWidth="1">
                {/* Head */}
                <circle cx="160" cy="120" r="18" fill="#192C3C" stroke="#C4E58A" strokeWidth="1.5" />
                {/* Torso & Athletic posture */}
                <path d="M142 145 C132 165 130 195 136 240 L184 240 C190 195 188 165 178 145 Z" fill="#142332" />
                {/* Shoulders */}
                <path d="M136 150 Q160 142 184 150" stroke="#C4E58A" strokeWidth="2" strokeLinecap="round" />
                {/* Arms */}
                <path d="M136 150 C120 170 115 195 125 220" stroke="#73C8B4" strokeWidth="6" strokeLinecap="round" />
                <path d="M184 150 C200 170 205 195 195 220" stroke="#73C8B4" strokeWidth="6" strokeLinecap="round" />
                {/* Towel over neck */}
                <path d="M148 142 C148 165 152 180 152 195 M172 142 C172 165 168 180 168 195" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Text and Actions */}
          <div className="space-y-4 pt-6 text-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F7] tracking-tight">
                Welcome to <span className="text-[#C4E58A]">Gym Tracker</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8E9FA5] leading-relaxed mt-1 max-w-[280px] mx-auto">
                Your journey to a stronger, healthier you starts here.
              </p>
            </div>

            {/* Primary Action Button: Get Started */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all active:scale-[0.98] shadow-[0_0_16px_rgba(196,229,138,0.25)] flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ChevronRight size={16} strokeWidth={3} />
            </button>

            {/* Skip Text Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-semibold text-[#8E9FA5] hover:text-[#F1F5F7] transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 1: PROFILE SETUP ═══ */}
      {step === 1 && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between py-6 animate-fadeIn">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#142332] border border-[#223348] flex items-center justify-center text-[#C4E58A] mb-3">
                <User size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#F1F5F7]">Your Body Metrics</h2>
              <p className="text-xs text-[#8E9FA5] mt-1">Help us personalize your volume and macros</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8E9FA5] font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#142332] text-[#F1F5F7] rounded-xl px-4 py-3 border border-[#223348] focus:border-[#73C8B4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#8E9FA5] mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="78"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full bg-[#142332] text-[#F1F5F7] rounded-xl px-3 py-2.5 border border-[#223348] font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E9FA5] mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full bg-[#142332] text-[#F1F5F7] rounded-xl px-3 py-2.5 border border-[#223348] font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E9FA5] mb-1 block">Age</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-[#142332] text-[#F1F5F7] rounded-xl px-3 py-2.5 border border-[#223348] font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all active:scale-[0.98]"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full text-xs font-semibold text-[#8E9FA5] text-center"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: PREFERENCES ═══ */}
      {step === 2 && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between py-6 animate-fadeIn">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#142332] border border-[#223348] flex items-center justify-center text-[#C4E58A] mb-3">
                <Bell size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#F1F5F7]">Daily Reminders</h2>
              <p className="text-xs text-[#8E9FA5] mt-1">Stay consistent with smart hydration & workout notifications</p>
            </div>

            <div className="rounded-2xl bg-[#142332] border border-[#223348] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F1F5F7]">Workout Notifications</p>
                  <p className="text-[10px] text-[#8E9FA5]">Remind me on scheduled routine days</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs({ ...prefs, reminders: !prefs.reminders })}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    prefs.reminders ? "bg-[#C4E58A]" : "bg-[#192C3C]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#0D1723] transition-transform ${
                      prefs.reminders ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full bg-[#C4E58A] hover:bg-[#B3D875] text-[#0D1723] font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all active:scale-[0.98] shadow-[0_0_16px_rgba(196,229,138,0.25)]"
          >
            Start Training
          </button>
        </div>
      )}
    </div>
  );
}
