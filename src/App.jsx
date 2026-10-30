import { lazy } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

import useWorkoutStore from "./store/workoutStore";
import Onboarding from "./pages/Onboarding";

// ── Lazy-loaded pages (item 21) ──
const WorkoutSelect = lazy(() => import("./pages/WorkoutSelect"));
const ActiveWorkout = lazy(() => import("./pages/ActiveWorkout"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));
const ManageExercises = lazy(() => import("./pages/ManageExercises"));
const Profile = lazy(() => import("./pages/Profile"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory"));

export default function App() {
  const onboardingComplete = useWorkoutStore((s) => s.onboardingComplete);

  // Show onboarding for first-time users
  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutSelect />} />
          <Route path="/workout/active" element={<ActiveWorkout />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/exercises/manage" element={<ManageExercises />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
                <p className="text-sm font-semibold text-neon-cyan">404</p>
                <h1 className="text-2xl font-bold text-white">
                  Page not found
                </h1>
                <p className="text-slate-400">
                  This page may have moved. Your workout data is still here.
                </p>
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center rounded-xl bg-neon-cyan px-5 py-3 font-semibold text-slate-950"
                >
                  Back to dashboard
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}
