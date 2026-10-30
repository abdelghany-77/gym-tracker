import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import RestTimer from "./RestTimer";
import useWorkoutStore from "../store/workoutStore";

describe("RestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    useWorkoutStore.setState({
      activeWorkout: {
        startedAt: new Date().toISOString(),
        exercises: [
          { exerciseId: "first", sets: [{ done: true }, { done: false }] },
          { exerciseId: "last", sets: [{ done: true }] },
        ],
      },
      restTimerTrigger: 10,
      restTimerExerciseId: "last",
      exerciseRestTimes: { first: 30, last: 90 },
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const completeFirst = () => {
    act(() => useWorkoutStore.getState().toggleSetDone(0, 1));
    act(() => vi.advanceTimersByTime(1));
  };

  it("does not replay a previous completion when mounted", () => {
    render(<RestTimer inline />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("uses the just-completed exercise, including preset persistence, in StrictMode", () => {
    render(
      <StrictMode>
        <RestTimer inline />
      </StrictMode>,
    );
    completeFirst();
    expect(screen.getByRole("timer")).toHaveTextContent(/^30sec$/);
    fireEvent.click(screen.getByRole("button", { name: "Presets" }));
    fireEvent.click(screen.getByRole("button", { name: "2m" }));
    expect(useWorkoutStore.getState().exerciseRestTimes).toEqual({
      first: 120,
      last: 90,
    });
  });

  it("catches up after background throttling and pauses without losing remaining time", () => {
    render(<RestTimer inline />);
    completeFirst();
    act(() => vi.setSystemTime(Date.now() + 20000));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("timer")).toHaveTextContent(/^9sec$/);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole("timer")).toHaveTextContent(/^9sec$/);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("timer")).toHaveTextContent(/^8sec$/);
  });

  it("starts a manually opened floating timer from zero", () => {
    render(<RestTimer />);
    fireEvent.click(screen.getByRole("button", { name: "Open rest timer" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByRole("timer")).toHaveTextContent(/^60Seconds$/);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("timer")).toHaveTextContent(/^59Seconds$/);
  });
});
