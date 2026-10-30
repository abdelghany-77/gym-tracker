import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "../store/workoutStore";
import { todayKey } from "../store/helpers";
import Nutrition from "../pages/Nutrition";
import NutritionCard from "./NutritionCard";
import ReminderSettings from "./ReminderSettings";
import ReminderWidget from "./ReminderWidget";
import NotificationManager from "./NotificationManager";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29, 7, 59));
  useWorkoutStore.setState(
    {
      ...useWorkoutStore.getInitialState(),
      dailyChecklistDate: todayKey(),
      dailyChecklist: {
        water: 0,
        vitamin: false,
        mealsEaten: [],
        mealCalories: {},
        caloriesConsumed: 0,
        mealPlanFollowed: false,
      },
      userProfile: { name: "Alex", weight: 70, height: 175, age: 24 },
      nutritionTargets: {
        calories: 3000,
        protein: 150,
        carbs: 300,
        fat: 80,
        fiber: 35,
        calcium: 1000,
      },
      remindersEnabled: true,
      soundEnabled: false,
      waterIntervalMinutes: 60,
      lastWaterReminderTime: Date.now(),
      lastVitaminReminderDate: null,
    },
    true,
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

describe("nutrition UI", () => {
  it("refreshes protein-only changes in the page and open meal dialog", () => {
    render(<Nutrition />);
    fireEvent.click(
      screen.getByRole("button", { name: "View full meal plan" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Your Meal Plan" });
    expect(within(dialog).getByText("29g P")).toBeInTheDocument();
    act(() =>
      useWorkoutStore.getState().updateNutritionTargets({ protein: 200 }),
    );
    expect(within(dialog).getByText("38g P")).toBeInTheDocument();
    expect(screen.getAllByText("38g P")).toHaveLength(2);
  });

  it("shares meal selection between page and dialog and supports keyboard dismissal", () => {
    render(<Nutrition />);
    const breakfast = screen.getByRole("button", {
      name: /Mark Breakfast as eaten/,
    });
    breakfast.focus();
    fireEvent.click(breakfast);
    expect(breakfast).toHaveAttribute("aria-pressed", "true");
    const opener = screen.getByRole("button", { name: "View full meal plan" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Your Meal Plan" });
    expect(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    ).toHaveFocus();
    const meal = within(dialog).getByRole("button", { name: /Breakfast/ });
    expect(meal).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(meal);
    expect(breakfast).toHaveAttribute("aria-pressed", "false");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([true, false])(
    "exposes finite calorie progress with compact=%s",
    (compact) => {
      useWorkoutStore.setState({
        nutritionTargets: { calories: 0 },
        dailyChecklist: { caloriesConsumed: 0 },
      });
      render(<NutritionCard compact={compact} />);
      expect(
        screen.getByRole("progressbar", { name: "Daily calories" }),
      ).toHaveAttribute("aria-valuenow", "0");
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    },
  );
});

describe("reminder controls", () => {
  it("exposes vitamin state and water progress, and never decrements below zero", () => {
    render(<ReminderWidget />);
    const remove = screen.getByRole("button", {
      name: "Remove a cup of water",
    });
    expect(remove).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Add a cup of water" }));
    expect(
      screen.getByRole("progressbar", { name: "Water intake" }),
    ).toHaveAttribute("aria-valuetext", "1 of 10 cups");
    fireEvent.click(remove);
    expect(remove).toBeDisabled();
    const vitamin = screen.getByRole("button", {
      name: "Mark multivitamins as taken",
    });
    fireEvent.click(vitamin);
    expect(vitamin).toHaveAttribute("aria-pressed", "true");
    advance(500);
  });

  it("allows interval editing before clamping on blur and exposes switch state", () => {
    render(<ReminderSettings />);
    const interval = screen.getByRole("spinbutton", {
      name: "Water reminder interval in minutes",
    });
    fireEvent.change(interval, { target: { value: "" } });
    fireEvent.change(interval, { target: { value: "120" } });
    fireEvent.blur(interval);
    expect(useWorkoutStore.getState().waterIntervalMinutes).toBe(120);
    const next = screen.getByRole("spinbutton", {
      name: "Water reminder interval in minutes",
    });
    fireEvent.change(next, { target: { value: "500" } });
    fireEvent.blur(next);
    expect(useWorkoutStore.getState().waterIntervalMinutes).toBe(180);
    fireEvent.click(
      screen.getByRole("switch", { name: "Toggle notification sound" }),
    );
    expect(
      screen.getByRole("switch", { name: "Toggle notification sound" }),
    ).toBeChecked();
    fireEvent.click(screen.getByRole("switch", { name: "Toggle reminders" }));
    expect(
      screen.getByRole("switch", { name: "Toggle reminders" }),
    ).not.toBeChecked();
  });

  it("reports rejected notification permission requests without an unhandled rejection", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockRejectedValue(new Error("Unavailable")),
    });
    render(<ReminderSettings />);
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Enable" })),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not enable notifications",
    );
    expect(useWorkoutStore.getState().notificationsGranted).toBe(false);
    expect(screen.getByRole("button", { name: "Enable" })).toBeEnabled();
  });
});

describe("notification scheduling", () => {
  it("checks vitamins again when the app was opened before the reminder window", () => {
    render(<NotificationManager />);
    advance(5000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    advance(55_000);
    expect(screen.getByRole("status")).toHaveTextContent("multivitamins");
    expect(useWorkoutStore.getState().lastVitaminReminderDate).toBe(todayKey());
    advance(6000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    advance(60_000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not reset an older toast's expiry when another reminder appears", () => {
    vi.setSystemTime(new Date(2026, 9, 29, 8));
    render(<NotificationManager />);
    advance(5000);
    expect(screen.getByText(/multivitamins today/)).toBeInTheDocument();
    advance(3000);
    useWorkoutStore.setState({ lastWaterReminderTime: null });
    fireEvent(window, new Event("focus"));
    expect(screen.getByText(/Time to drink water/)).toBeInTheDocument();
    advance(3000);
    expect(screen.queryByText(/multivitamins today/)).not.toBeInTheDocument();
    expect(screen.getByText(/Time to drink water/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss reminder" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("resets tracking on resume even with reminders disabled", () => {
    useWorkoutStore.setState({
      remindersEnabled: false,
      dailyChecklist: {
        water: 9,
        vitamin: true,
        mealsEaten: [0],
        caloriesConsumed: 600,
      },
    });
    const yesterday = todayKey();
    render(<NotificationManager />);
    vi.setSystemTime(new Date(2026, 9, 30, 9));
    fireEvent(window, new Event("focus"));
    expect(useWorkoutStore.getState().dailyChecklistDate).not.toBe(yesterday);
    expect(useWorkoutStore.getState().dailyChecklist).toMatchObject({
      water: 0,
      vitamin: false,
      mealsEaten: [],
      caloriesConsumed: 0,
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("sends vitamins on the next day even if the app was suspended through midnight", () => {
    vi.setSystemTime(new Date(2026, 9, 29, 9));
    useWorkoutStore.setState({ lastVitaminReminderDate: todayKey() });
    const { unmount } = render(<NotificationManager />);
    vi.setSystemTime(new Date(2026, 9, 30, 9));
    fireEvent(window, new Event("focus"));
    expect(screen.getByText(/multivitamins today/)).toBeInTheDocument();
    unmount();
    render(<NotificationManager />);
    advance(5000);
    expect(screen.queryByText(/multivitamins today/)).not.toBeInTheDocument();
  });

  it("resets tracking at midnight on the interval even with reminders disabled", () => {
    vi.setSystemTime(new Date(2026, 10, 1, 23, 59, 30));
    useWorkoutStore.setState({
      dailyChecklistDate: todayKey(),
      remindersEnabled: false,
      dailyChecklist: {
        water: 4,
        vitamin: true,
        mealsEaten: [0],
        caloriesConsumed: 600,
      },
    });
    render(<NotificationManager />);
    advance(60_000);
    expect(useWorkoutStore.getState().dailyChecklist).toMatchObject({
      water: 0,
      vitamin: false,
      mealsEaten: [],
      caloriesConsumed: 0,
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("reads the latest water count and stops reminding once the goal is met", () => {
    useWorkoutStore.setState({ lastWaterReminderTime: null });
    render(<NotificationManager />);
    act(() => {
      for (let index = 0; index < 10; index++)
        useWorkoutStore.getState().incrementWater();
    });
    advance(5000);
    expect(screen.queryByText(/Time to drink water/)).not.toBeInTheDocument();
  });
});
