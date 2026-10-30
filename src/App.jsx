import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LoadingSkeleton from "./components/LoadingSkeleton";
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
      <Suspense fallback={<LoadingSkeleton />}>
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
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
