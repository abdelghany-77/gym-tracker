import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import ActiveWorkout from "./ActiveWorkout";
import WorkoutHistory from "./WorkoutHistory";
import useWorkoutStore from "../store/workoutStore";

vi.mock("../components/ExerciseCard", () => ({ default: () => null }));
vi.mock("../components/RestTimer", () => ({ default: () => null }));
vi.mock("../components/AngleCoverageBadge", () => ({ default: () => null }));
vi.mock("../components/SwapExerciseModal", () => ({ default: () => null }));
vi.mock("../components/AngleRadarChart", () => ({ default: () => null }));
vi.mock("../components/WorkoutReceiptModal", () => ({
  default: ({ session, previousPRs }) => (
    <output data-testid="receipt">
      {JSON.stringify({ session, previousPRs })}
    </output>
  ),
}));
vi.mock("../components/Modal", () => ({
  default: ({ isOpen, title, children, onClose }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button onClick={onClose}>Close dialog</button>
      </div>
    ) : null,
  ConfirmDialog: ({ isOpen, title, onConfirm, confirmText }) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    ) : null,
}));

describe("workout page data flows", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useWorkoutStore.setState({
      activeWorkout: null,
      history: [],
      exercises: [],
      personalRecords: {},
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("opens finish confirmation for an empty routine instead of leaving the primary action inert", () => {
    useWorkoutStore.setState({
      activeWorkout: {
        programId: "empty",
        programName: "Empty Routine",
        startedAt: new Date().toISOString(),
        exercises: [],
      },
    });
    render(
      <MemoryRouter>
        <ActiveWorkout />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish workout" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Finish Workout?");
  });

  it("keeps the pre-finish PR snapshot for the workout receipt", () => {
    useWorkoutStore.setState({
      personalRecords: { bench: 60 },
      activeWorkout: {
        programId: "push",
        programName: "Push",
        startedAt: new Date().toISOString(),
        exercises: [
          { exerciseId: "bench", sets: [{ weight: 65, reps: 10, done: true }] },
        ],
      },
    });
    render(
      <MemoryRouter>
        <ActiveWorkout />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish workout" }));
    fireEvent.click(screen.getByRole("button", { name: "Save & Finish" }));
    const receipt = JSON.parse(screen.getByTestId("receipt").textContent);
    expect(receipt.previousPRs).toEqual({ bench: 60 });
    expect(receipt.session.exercises[0].sets).toEqual([
      { weight: 65, reps: 10 },
    ]);
    expect(useWorkoutStore.getState().personalRecords).toEqual({ bench: 65 });
  });

  it("jumps between exercises and keeps next/previous navigation in sync", () => {
    useWorkoutStore.setState({
      exercises: [
        { id: "bench", name: "Bench Press" },
        { id: "row", name: "Cable Row" },
      ],
      activeWorkout: {
        programId: "upper",
        programName: "Upper",
        startedAt: new Date().toISOString(),
        exercises: [
          {
            exerciseId: "bench",
            sets: [{ weight: "", reps: "", done: false }],
          },
          { exerciseId: "row", sets: [{ weight: "", reps: "", done: false }] },
        ],
      },
    });
    render(
      <MemoryRouter>
        <ActiveWorkout />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Training coverage" }));
    expect(
      screen.getByRole("dialog", { name: "Training coverage" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const selector = screen.getByRole("combobox", { name: "Jump to exercise" });
    expect(selector).toHaveValue("0");
    expect(
      screen.queryByRole("button", { name: "Finish workout" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Log Set/ }),
    ).not.toBeInTheDocument();
    fireEvent.change(selector, { target: { value: "1" } });
    expect(
      screen.getByRole("button", { name: "Finish workout" }),
    ).toBeInTheDocument();
    expect(selector).toHaveValue("1");
    expect(
      screen.getByRole("button", { name: "Next exercise" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Previous exercise" }));
    expect(selector).toHaveValue("0");
    expect(
      screen.getByRole("progressbar", { name: "Workout progress" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders a workout calendar day without interpreting it as midnight UTC", () => {
    useWorkoutStore.setState({
      history: [
        {
          id: "session",
          date: "2026-10-19",
          programName: "Push",
          exercises: [],
        },
      ],
    });
    render(
      <MemoryRouter>
        <WorkoutHistory />
      </MemoryRouter>,
    );
    expect(screen.getByText("Oct 19")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Mon, Oct 19")).toBeInTheDocument();
  });
});
