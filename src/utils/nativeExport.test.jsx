import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
  writeFile: vi.fn(),
  share: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: mocks.isNativePlatform,
  },
}));

vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: mocks.writeFile,
  },
  Directory: { Cache: "CACHE", Data: "DATA" },
  Encoding: { UTF8: "utf8" },
}));

vi.mock("@capacitor/share", () => ({
  Share: {
    share: mocks.share,
  },
}));

vi.mock("@capacitor/status-bar", () => ({
  StatusBar: { setStyle: vi.fn(), setBackgroundColor: vi.fn() },
  Style: { Dark: "DARK" },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    createChannel: vi.fn(),
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    schedule: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock("@capacitor-community/keep-awake", () => ({
  KeepAwake: { keepAwake: vi.fn(), allowSleep: vi.fn() },
}));

vi.mock("@capacitor/haptics", () => ({
  Haptics: { impact: vi.fn(), notification: vi.fn() },
  ImpactStyle: { Light: "LIGHT", Medium: "MEDIUM", Heavy: "HEAVY" },
  NotificationType: { Success: "SUCCESS", Warning: "WARNING" },
}));

import { exportFile } from "./nativeBridge";
import { exportBackupFile, exportUserData } from "../store/helpers";
import DataManagement from "../components/profile/DataManagement";

describe("Cross-platform Export (Web + Capacitor Android)", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.isNativePlatform.mockReturnValue(false);
    mocks.writeFile.mockReset();
    mocks.share.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("writes to Capacitor Cache + Data and opens native Share sheet on APK", async () => {
    mocks.isNativePlatform.mockReturnValue(true);
    mocks.writeFile.mockResolvedValue({
      uri: "file:///data/user/0/com.abdelghany.gymtracker/cache/gym-backup-2026-11-26.json",
    });
    mocks.share.mockResolvedValue({ activityType: "com.google.android.apps.docs" });

    localStorage.setItem(
      "gym_history",
      JSON.stringify([{ id: "s1", date: "2026-11-26", exercises: [] }]),
    );

    const res = await exportBackupFile();
    expect(res.status).toBe("shared");
    expect(mocks.writeFile).toHaveBeenCalledTimes(2);
    expect(mocks.writeFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        path: expect.stringMatching(/^gym-backup-\d{4}-\d{2}-\d{2}\.json$/),
        directory: "CACHE",
        encoding: "utf8",
      }),
    );
    expect(mocks.share).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          "file:///data/user/0/com.abdelghany.gymtracker/cache/gym-backup-2026-11-26.json",
        ],
      }),
    );
  });

  it("returns cancelled gracefully when native Share sheet is dismissed", async () => {
    mocks.isNativePlatform.mockReturnValue(true);
    mocks.writeFile.mockResolvedValue({
      uri: "file:///cache/receipt.png",
    });
    mocks.share.mockRejectedValue(new Error("Share canceled"));

    const res = await exportFile({
      fileName: "receipt.png",
      data: "aGVsbG8=",
      isBase64: true,
      mimeType: "image/png",
      title: "Receipt",
    });

    expect(res.status).toBe("cancelled");
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "receipt.png",
        directory: "CACHE",
        data: "aGVsbG8=",
      }),
    );
  });

  it("defers URL.revokeObjectURL on web downloads and survives corrupt gym_measurements", () => {
    vi.useFakeTimers();
    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    // Corrupt/null measurements previously threw and aborted exportUserData()
    localStorage.setItem("gym_measurements", "null");

    const payload = exportUserData();
    expect(payload.gym_measurements).toEqual({ entries: [] });
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(revokeSpy).toHaveBeenCalledWith("blob:test");
  });

  it("shows native share confirmation in DataManagement when exporting inside APK", async () => {
    mocks.isNativePlatform.mockReturnValue(true);
    mocks.writeFile.mockResolvedValue({ uri: "file:///cache/backup.json" });
    mocks.share.mockResolvedValue({});

    render(<DataManagement />);
    fireEvent.click(screen.getByRole("button", { name: /Export Data/i }));

    await waitFor(() => {
      expect(screen.getByText(/Backup Exported/i)).toBeInTheDocument();
    });
  });
});
