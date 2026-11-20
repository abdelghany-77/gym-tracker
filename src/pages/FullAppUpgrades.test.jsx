import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import PlateCalculatorModal from "../components/PlateCalculatorModal";
import ExerciseProgressionChart from "../components/ExerciseProgressionChart";
import ActivityChart from "../components/ActivityChart";
import { syncBackgroundReminders } from "../utils/notificationService";
import WorkoutSelect from "./WorkoutSelect";
import Nutrition from "./Nutrition";

describe("Full-app UX upgrades", () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({
      activeWorkout: null,
      exerciseNotes: {},
      history: [
        {
          id: "s1",
          date: "2026-10-12",
          programId: "push",
          programName: "Push Day",
          exercises: [
            {
              exerciseId: "barbell-bench-press",
              sets: [
                { weight: 60, reps: 8, type: "N" },
                { weight: 65, reps: 8, type: "N" },
              ],
            },
          ],
        },
        {
          id: "s2",
          date: "2026-10-19",
          programId: "push",
          programName: "Push Day",
          exercises: [
            {
              exerciseId: "barbell-bench-press",
              sets: [
                { weight: 70, reps: 8, type: "N" },
                { weight: 70, reps: 8, type: "N" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("calculates barbell plates accurately and applies target weight", () => {
    let applied = null;
    render(
      <PlateCalculatorModal
        isOpen
        initialWeight={100}
        onClose={() => {}}
        onApplyWeight={(w) => {
          applied = w;
        }}
      />,
    );

    // 100kg with 20kg bar = 40kg per side = 1x25kg + 1x15kg
    expect(screen.getByText(/1× 25 kg \+ 1× 15 kg/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Use 100 kg/i }));
    expect(applied).toBe("100");
  });

  it("persists per-exercise notes via workoutStore", () => {
    useWorkoutStore
      .getState()
      .setExerciseNote("barbell-bench-press", "Seat pin 4, slow eccentric");
    expect(useWorkoutStore.getState().exerciseNotes["barbell-bench-press"]).toBe(
      "Seat pin 4, slow eccentric",
    );
    expect(JSON.parse(localStorage.getItem("gym_exercise_notes"))).toEqual({
      "barbell-bench-press": "Seat pin 4, slow eccentric",
    });
  });

  it("renders ExerciseProgressionChart KPIs from session history", () => {
    render(<ExerciseProgressionChart />);
    expect(screen.getByLabelText(/Exercise progression/i)).toBeTruthy();
    expect(screen.getByText("Latest")).toBeTruthy();
    expect(screen.getByText("All-Time Best")).toBeTruthy();
    expect(screen.getByText("Net Change")).toBeTruthy();
  });

  it("supports quick-add and removal of off-plan snacks in Nutrition", () => {
    const startCal =
      useWorkoutStore.getState().dailyChecklist.caloriesConsumed || 0;

    render(
      <MemoryRouter>
        <Nutrition />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Food name"), {
      target: { value: "Whey Shake" },
    });
    fireEvent.change(screen.getByLabelText("Food calories"), {
      target: { value: "240" },
    });
    fireEvent.change(screen.getByLabelText("Food protein grams"), {
      target: { value: "40" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));

    expect(screen.getByText("Whey Shake")).toBeTruthy();
    expect(useWorkoutStore.getState().dailyChecklist.caloriesConsumed).toBe(
      startCal + 240,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Whey Shake" }));
    expect(screen.queryByText("Whey Shake")).toBeNull();
    expect(useWorkoutStore.getState().dailyChecklist.caloriesConsumed).toBe(
      startCal,
    );
  });

  it("expands inline exercise preview on WorkoutSelect without starting workout", () => {
    render(
      <MemoryRouter>
        <WorkoutSelect />
      </MemoryRouter>,
    );

    const previewButtons = screen.getAllByRole("button", { name: /Preview/i });
    fireEvent.click(previewButtons[0]);

    expect(screen.getByText("Planned Exercises")).toBeTruthy();
    expect(useWorkoutStore.getState().activeWorkout).toBeNull();
  });

  it("renders redesigned ActivityChart with monthly consistency progress and interactive day inspector", () => {
    render(
      <ActivityChart
        data={{ "2026-10-12": 1, "2026-10-13": 2 }}
        currentDate={new Date(2026, 9, 15)}
        weeklyTargetDays={4}
      />,
    );

    expect(screen.getByText("Monthly Consistency Progress")).toBeTruthy();
    expect(
      screen.getByRole("progressbar", { name: "Monthly training consistency" }),
    ).toBeTruthy();

    const day13 = screen.getByRole("button", {
      name: /Oct 13: 2 workouts/i,
    });
    fireEvent.click(day13);
    expect(screen.getByText("2 workouts")).toBeTruthy();
  });

  it("syncs reminder state safely to the Service Worker when running on web", async () => {
    const result = await syncBackgroundReminders({
      enabled: true,
      waterIntervalMinutes: 60,
      waterCount: 2,
      waterGoal: 8,
      vitaminDone: false,
      today: "2026-10-19",
    });
    expect(result).toBe(1);
  });
});
