import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExerciseLibrary from "./ExerciseLibrary";
import useWorkoutStore from "../store/workoutStore";
import exercisesDatabase from "../data/exercises";

describe("ExerciseLibrary Dual-Asset Pilot UX", () => {
  beforeEach(() => {
    useWorkoutStore.setState({ exercises: exercisesDatabase });
  });

  it("filters to the 41 verified dual-asset exercises and opens both video and anatomy together", () => {
    render(
      <MemoryRouter>
        <ExerciseLibrary />
      </MemoryRouter>,
    );

    const verifiedBtn = screen.getByRole("button", {
      name: /Verified Video \+ Anatomy \(41\)/i,
    });
    fireEvent.click(verifiedBtn);

    expect(screen.getByRole("status")).toHaveTextContent("41 exercises found");

    // Open Barbell Bench Press details
    fireEvent.click(
      screen.getByRole("button", { name: /View Barbell Bench Press details/i }),
    );

    // Both continuous movement video AND exercise-specific anatomical plate must render together
    expect(screen.getByText("Movement Video")).toBeInTheDocument();
    expect(screen.getByText("Targeted Anatomy")).toBeInTheDocument();
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toContain(
      "/media/videos/chest_bb_flat_bench.mp4",
    );
    expect(
      screen.getByAltText(/Barbell Bench Press anatomical illustration/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Primary:")).toBeInTheDocument();
    expect(screen.getByText("Secondary:")).toBeInTheDocument();
  });

  it("shows transparent static fallback label for non-pilot exercises", () => {
    render(
      <MemoryRouter>
        <ExerciseLibrary />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /View Decline Barbell Press details/i,
      }),
    );

    expect(document.querySelector("video")).toBeNull();
    expect(
      screen.getByText(/Static reference preview — verified movement video/i),
    ).toBeInTheDocument();
  });

  it("filters via interactive body map and opens side-by-side comparison modal", () => {
    render(
      <MemoryRouter>
        <ExerciseLibrary />
      </MemoryRouter>,
    );

    // Switch body map to Back view and tap Glutes
    const orientationGroup = screen.getByRole("group", {
      name: "Body map orientation",
    });
    fireEvent.click(within(orientationGroup).getByRole("button", { name: "Back" }));

    const gluteButtons = screen.getAllByRole("button", { name: /Glutes/i });
    fireEvent.click(gluteButtons[0]);

    expect(screen.getByRole("status")).toHaveTextContent("1 exercise found");
    expect(screen.getByText("Barbell Hip Thrust")).toBeInTheDocument();

    // Reset and compare two Chest exercises
    fireEvent.click(screen.getByRole("button", { name: /Reset filters/i }));
    fireEvent.click(
      screen.getByRole("button", {
        name: /Add Barbell Bench Press to comparison/i,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /Add Flat Dumbbell Press to comparison/i,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Compare now/i }));
    expect(screen.getByText("Compare Alternatives")).toBeInTheDocument();
  });
});
