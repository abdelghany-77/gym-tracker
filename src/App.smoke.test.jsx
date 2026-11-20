import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "./store/workoutStore";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WorkoutSelect from "./pages/WorkoutSelect";
import ActiveWorkout from "./pages/ActiveWorkout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ManageExercises from "./pages/ManageExercises";
import Nutrition from "./pages/Nutrition";
import WorkoutHistory from "./pages/WorkoutHistory";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ children }) => <div>{children}</div>,
  Area: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  RadarChart: ({ children }) => <div>{children}</div>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

const initialSnapshot = useWorkoutStore.getState();

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutSelect />} />
          <Route path="/workout/active" element={<ActiveWorkout />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/exercises/manage" element={<ManageExercises />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Full-app route render smoke suite", () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      onboardingComplete: true,
      activeWorkout: null,
      history: [],
      weeklySchedule: { ...initialSnapshot.weeklySchedule },
      programs: initialSnapshot.programs,
      exercises: initialSnapshot.exercises,
      personalRecords: {},
    });
  });

  it("renders Dashboard cleanly with default object weeklySchedule and empty history", () => {
    expect(Array.isArray(useWorkoutStore.getState().weeklySchedule)).toBe(
      false,
    );
    renderAt("/");
    expect(
      screen.getByRole("heading", { name: "GymTracker" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Monthly Consistency")).toBeInTheDocument();
  });

  it("renders Dashboard cleanly with populated history and opens schedule editor", () => {
    const firstProgram = Object.values(useWorkoutStore.getState().programs)[0];
    const firstExId = firstProgram.exercises[0];
    useWorkoutStore.setState({
      history: [
        {
          id: "sess-1",
          programId: firstProgram.id,
          programName: firstProgram.name,
          date: "2026-10-20",
          startedAt: "2026-10-20T10:00:00.000Z",
          finishedAt: "2026-10-20T10:45:00.000Z",
          exercises: [
            { exerciseId: firstExId, sets: [{ weight: 80, reps: 8, done: true }] },
          ],
        },
      ],
    });
    renderAt("/");
    expect(screen.getByText("Last Session")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Edit schedule/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders WorkoutSelect and toggles inline exercise preview", () => {
    renderAt("/workout");
    expect(screen.getByText("Start Workout")).toBeInTheDocument();
    const previewButtons = screen.getAllByRole("button", { name: /Preview/i });
    fireEvent.click(previewButtons[0]);
    expect(screen.getByText("Planned Exercises")).toBeInTheDocument();
  });

  it("renders ActiveWorkout both when idle and when an active session is running", () => {
    const { unmount } = renderAt("/workout/active");
    expect(screen.getByText("No active workout session.")).toBeInTheDocument();
    unmount();

    const firstProgramId = Object.keys(useWorkoutStore.getState().programs)[0];
    useWorkoutStore.getState().startWorkout(firstProgramId);
    renderAt("/workout/active");
    expect(
      screen.getByLabelText("Workout elapsed time"),
    ).toBeInTheDocument();
  });

  it("renders ExerciseLibrary and ManageExercises without crashing", () => {
    const { unmount } = renderAt("/exercises");
    expect(
      screen.getByRole("heading", { level: 1, name: /Exercise/i }),
    ).toBeInTheDocument();
    unmount();

    renderAt("/exercises/manage");
    expect(screen.getByText("Manage Exercises")).toBeInTheDocument();
  });

  it("renders Nutrition page cleanly", () => {
    renderAt("/nutrition");
    expect(screen.getByText("Nutrition & Fuel")).toBeInTheDocument();
    expect(screen.getByText("Quick Add Food or Snack")).toBeInTheDocument();
  });

  it("renders WorkoutHistory across all 4 tabs (Sessions, Strength, Calendar, Angles)", () => {
    const firstProgram = Object.values(useWorkoutStore.getState().programs)[0];
    const firstExId = firstProgram.exercises[0];
    useWorkoutStore.setState({
      history: [
        {
          id: "sess-1",
          programId: firstProgram.id,
          programName: firstProgram.name,
          date: "2026-10-20",
          exercises: [
            { exerciseId: firstExId, sets: [{ weight: 80, reps: 8, done: true }] },
          ],
        },
      ],
    });

    renderAt("/history");
    expect(screen.getByText("Progress & History")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Strength" }));
    expect(screen.getByLabelText("Exercise progression")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));
    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Angles" }));
    expect(screen.getByRole("button", { name: "Angles" })).toBeInTheDocument();
  });

  it("renders Profile across all 4 tabs (Overview, InBody, Progress, Settings)", () => {
    renderAt("/profile");
    expect(screen.getByText("Your Stats")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "InBody" }));
    fireEvent.click(screen.getByRole("button", { name: "Progress" }));
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText("Reminders & Background Alerts")).toBeInTheDocument();
  });

  it("renders Onboarding cleanly", () => {
    render(<Onboarding />);
    expect(screen.getByText(/GymTracker/i)).toBeInTheDocument();
  });
});
