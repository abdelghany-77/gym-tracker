import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "../../store/workoutStore";
import OneRepMaxChart from "./OneRepMaxChart";
import AchievementsList from "./AchievementsList";
import DataManagement from "./DataManagement";

vi.mock("../Modal", () => ({
  ConfirmDialog: ({ isOpen, title, message, onConfirm, confirmText }) =>
    isOpen ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    ) : null,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ data }) => (
    <output data-testid="chart-data">{JSON.stringify(data)}</output>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const exercises = [
  { id: "bench", name: "Bench" },
  { id: "squat", name: "Squat" },
];
const sessions = (exerciseId) =>
  ["2026-10-19", "2026-10-20"].map((date, index) => ({
    id: String(index),
    date,
    exercises: [{ exerciseId, sets: [{ weight: 60, reps: 10 }] }],
  }));

describe("reactive profile data", () => {
  beforeEach(() =>
    useWorkoutStore.setState({ history: [], personalRecords: {}, exercises }),
  );

  it("selects an exercise when history arrives after mount, and recovers when it is replaced", () => {
    render(<OneRepMaxChart />);
    act(() => useWorkoutStore.setState({ history: sessions("bench") }));
    expect(screen.getByRole("combobox")).toHaveValue("bench");
    expect(JSON.parse(screen.getByTestId("chart-data").textContent)).toEqual([
      expect.objectContaining({ date: "Oct 19", orm: 80 }),
      expect.objectContaining({ date: "Oct 20", orm: 80 }),
    ]);
    act(() => useWorkoutStore.setState({ history: sessions("squat") }));
    expect(screen.getByRole("combobox")).toHaveValue("squat");
    expect(screen.getByTestId("chart-data")).toBeInTheDocument();
  });

  it("accurately describes the history-only deletion and keeps measurements", () => {
    const measurements = { entries: [{ id: "scan", weight: 75 }] };
    useWorkoutStore.setState({ history: sessions("bench"), measurements });
    render(<DataManagement />);
    fireEvent.click(
      screen.getByRole("button", { name: /Clear Workout History/ }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Your profile, measurements, and other saved data will be kept.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete History" }));
    expect(useWorkoutStore.getState().history).toEqual([]);
    expect(useWorkoutStore.getState().measurements).toEqual(measurements);
  });

  it("does not offer skipped exercises as 1RM data", () => {
    useWorkoutStore.setState({
      history: [
        {
          id: "1",
          date: "2026-10-19",
          exercises: [{ exerciseId: "bench", sets: [] }],
        },
      ],
    });
    render(<OneRepMaxChart />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("updates achievements on finish/import and clear without remounting", () => {
    render(<AchievementsList />);
    const firstStep = screen.getByText("First Step").closest(".group");
    expect(firstStep).toHaveClass("opacity-50");
    act(() =>
      useWorkoutStore.setState({
        history: sessions("bench"),
        personalRecords: { bench: 60 },
      }),
    );
    expect(firstStep).not.toHaveClass("opacity-50");
    expect(
      screen.getByText("Record Breaker").closest(".group"),
    ).not.toHaveClass("opacity-50");
    act(() => useWorkoutStore.getState().clearHistory());
    expect(firstStep).toHaveClass("opacity-50");
  });
});
