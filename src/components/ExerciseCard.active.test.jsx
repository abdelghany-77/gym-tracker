import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExerciseCard from "./ExerciseCard";
import useWorkoutStore from "../store/workoutStore";
import exercisesDatabase from "../data/exercises";

describe("Active Workout ExerciseCard Side-by-Side Slider + Video & UX Helpers", () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      exercises: exercisesDatabase,
      history: [
        {
          id: "prev_1",
          date: "2026-11-18",
          exercises: [
            {
              exerciseId: "chest_bb_flat_bench",
              sets: [
                { weight: 80, reps: 10, type: "N" },
                { weight: 85, reps: 8, type: "N" },
              ],
            },
          ],
        },
      ],
      activeWorkout: {
        programId: "push_day",
        programName: "Push Day",
        startedAt: new Date().toISOString(),
        exercises: [
          {
            exerciseId: "chest_bb_flat_bench",
            sets: [
              { weight: "", reps: "", done: false, type: "N" },
              { weight: "", reps: "", done: false, type: "N" },
            ],
          },
        ],
      },
    });
  });

  it("renders Image Slider (Anatomy + Form slides) side-by-side with Movement Video", () => {
    const active = useWorkoutStore.getState().activeWorkout;
    render(
      <ExerciseCard
        exerciseIndex={0}
        exerciseData={active.exercises[0]}
      />,
    );

    // Slide 1 is Targeted Anatomy; next slide switches to Start / Peak Form
    expect(screen.getByText(/1\/2 · Targeted Anatomy/i)).toBeInTheDocument();
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toContain(
      "/media/videos/chest_bb_flat_bench.mp4",
    );

    fireEvent.click(screen.getByRole("button", { name: "Next image slide" }));
    expect(screen.getByText(/2\/2 · Start \/ Peak Form/i)).toBeInTheDocument();
  });

  it("toggles inline Quick Cues, fills sets from previous log, and nudges active weight by +2.5 kg", () => {
    const active = useWorkoutStore.getState().activeWorkout;
    render(
      <ExerciseCard
        exerciseIndex={0}
        exerciseData={active.exercises[0]}
      />,
    );

    // Quick Cues drawer
    fireEvent.click(screen.getByRole("button", { name: /Quick cues/i }));
    expect(screen.getByText(/Setup:/i)).toBeInTheDocument();

    // Quick weight nudge +2.5 kg from ghost weight (80 -> 82.5)
    fireEvent.click(
      screen.getByRole("button", { name: /Adjust set 1 weight by \+2\.5 kg/i }),
    );
    expect(
      useWorkoutStore.getState().activeWorkout.exercises[0].sets[0].weight,
    ).toBe("82.5");
  });
});
