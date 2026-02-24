import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WorkoutSelect from "./pages/WorkoutSelect";
import ActiveWorkout from "./pages/ActiveWorkout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ManageExercises from "./pages/ManageExercises";
import Profile from "./pages/Profile";
import Nutrition from "./pages/Nutrition";

export default function App() {
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
        </Route>
      </Routes>
    </HashRouter>
  );
}
