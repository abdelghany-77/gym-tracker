import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useWorkoutStore from "../store/workoutStore";
import Profile from "./Profile";
import Onboarding from "./Onboarding";

vi.mock("../components/ReminderSettings", () => ({ default: () => <div>Reminder settings</div> }));
vi.mock("../components/ScheduleEditor", () => ({ default: () => null }));
vi.mock("../components/profile/AchievementsList", () => ({ default: () => null }));
vi.mock("../components/profile/PersonalRecordsTab", () => ({ default: () => null }));
vi.mock("../components/profile/DataManagement", () => ({ default: () => null }));
vi.mock("../components/profile/BodyMeasurementsTab", () => ({ default: () => null }));
vi.mock("../components/ProgramSelector", () => ({ default: () => null }));

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({
    ...useWorkoutStore.getInitialState(),
    userProfile: { name: "", weight: 70, height: 175, age: 24 },
    history: [], personalRecords: {}, remindersEnabled: true, soundEnabled: true,
    onboardingComplete: false,
  }, true);
});

describe("onboarding", () => {
  it("saves profile and both preferences on completion", () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: " Alex " } });
    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "80.5" } });
    fireEvent.change(screen.getByLabelText("Height (cm)"), { target: { value: "180.5" } });
    fireEvent.change(screen.getByLabelText("Age", { exact: true }), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("switch", { name: "Water Reminders" }));
    fireEvent.click(screen.getByRole("switch", { name: "Notification Sounds" }));
    expect(screen.getByRole("switch", { name: "Water Reminders" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /start training/i }));
    expect(useWorkoutStore.getState()).toMatchObject({
      userProfile: { name: "Alex", weight: 80.5, height: 180.5, age: 30 },
      onboardingComplete: true, remindersEnabled: false, soundEnabled: false,
    });
    expect(JSON.parse(localStorage.getItem("gym_reminders"))).toMatchObject({ remindersEnabled: false, soundEnabled: false });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not advance with invalid optional numeric fields", () => {
    render(<Onboarding />);
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("heading", { name: "Your Profile" })).toBeInTheDocument();
    expect(screen.getByLabelText("Weight (kg)")).toBeInvalid();
  });

  it("skips without applying a partially entered profile or overwriting preferences", () => {
    useWorkoutStore.setState({ remindersEnabled: false, soundEnabled: false });
    render(<Onboarding />);
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /skip setup/i }));
    expect(useWorkoutStore.getState()).toMatchObject({ userProfile: { weight: 70 }, remindersEnabled: false, soundEnabled: false, onboardingComplete: true });
  });
});

describe("profile controls", () => {
  it("labels editable fields and preserves nutrition targets when renaming", () => {
    useWorkoutStore.getState().updateNutritionTargets({ calories: 2200, protein: 150 });
    render(<Profile />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: "Sam" } });
    expect(useWorkoutStore.getState().nutritionTargets).toMatchObject({ calories: 2200, protein: 150 });
    expect(screen.getByLabelText("Weight (kg)")).toHaveValue(70);
    expect(screen.getByLabelText("Height (cm)")).toHaveValue(175);
    expect(screen.getByLabelText("Age", { exact: true })).toHaveValue(24);
    fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "80.5" } });
    expect(useWorkoutStore.getState().userProfile.weight).toBe(80.5);
    fireEvent.change(screen.getByLabelText("Height (cm)"), { target: { value: "" } });
    expect(screen.queryByText("BMI")).not.toBeInTheDocument();
  });

  it("exposes selected navigation and theme state", () => {
    render(<Profile />);
    expect(screen.getByRole("button", { name: "Overview" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("switch", { name: "Light theme" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("switch", { name: "Light theme" }));
    expect(screen.getByRole("switch", { name: "Light theme" })).toBeChecked();
    act(() => useWorkoutStore.getState().setTheme("dark"));
  });
});
