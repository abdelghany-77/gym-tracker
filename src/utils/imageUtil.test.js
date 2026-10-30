import { afterEach, describe, expect, it, vi } from "vitest";
import { getExerciseImageUrl, getImageUrl } from "./imageUtil";
import { exercisesDatabase } from "../data/exercises";

const unavailableExercises = exercisesDatabase.filter(
  (exercise) => exercise.imageStatus === "unavailable",
);
const availableExercises = exercisesDatabase.filter(
  (exercise) => exercise.imageStatus === "available",
);

afterEach(() => vi.unstubAllEnvs());

describe("getImageUrl", () => {
  it.each([null, undefined, "", "  ", 0, {}])(
    "does not emit an image URL for %j",
    (value) => {
      expect(getImageUrl(value)).toBeUndefined();
    },
  );

  it("resolves local assets under the deployed base", () => {
    vi.stubEnv("BASE_URL", "/gym-tracker/");
    expect(getImageUrl("/exercises/example.png")).toBe(
      "/gym-tracker/exercises/example.png",
    );
    expect(getImageUrl("exercises/example.png")).toBe(
      "/gym-tracker/exercises/example.png",
    );
  });

  it("supports a root base and external images", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getImageUrl("exercises/example.png")).toBe("/exercises/example.png");
    expect(getImageUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
    expect(getImageUrl("data:image/png;base64,test")).toBe(
      "data:image/png;base64,test",
    );
  });
});

describe("getExerciseImageUrl", () => {
  it.each(unavailableExercises)(
    "rejects stale localStorage images for $id",
    (exercise) => {
      for (const image of [
        `/exercises/${exercise.id}.png`,
        "https://example.com/rejected.png",
      ]) {
        expect(getExerciseImageUrl({ id: exercise.id, image })).toBeUndefined();
        expect(
          getExerciseImageUrl({
            id: exercise.id,
            image,
            imageStatus: "available",
            isCustom: true,
          }),
        ).toBeUndefined();
      }
    },
  );

  it.each(availableExercises)(
    "uses the current authoritative image for $id",
    (exercise) => {
      vi.stubEnv("BASE_URL", "/gym-tracker/");
      for (const stale of [
        { image: "/exercises/old-wrong-variant.png", imageStatus: "available" },
        { image: "https://example.com/override.png" },
        { image: null, imageStatus: "unavailable" },
        {},
      ]) {
        expect(getExerciseImageUrl({ id: exercise.id, ...stale })).toBe(
          getImageUrl(exercise.image),
        );
      }
    },
  );
  it("never guesses an ID-based image or revives an unavailable image", () => {
    expect(
      getExerciseImageUrl({
        id: "missing",
        image: null,
        imageStatus: "unavailable",
      }),
    ).toBeUndefined();
    expect(
      getExerciseImageUrl({ image: "/stale.png", imageStatus: "unavailable" }),
    ).toBeUndefined();
    expect(getExerciseImageUrl({ id: "custom" })).toBeUndefined();
    expect(getExerciseImageUrl(null)).toBeUndefined();
  });

  it("resolves explicitly supplied pictures, including custom exercises", () => {
    vi.stubEnv("BASE_URL", "/gym-tracker/");
    expect(
      getExerciseImageUrl({
        image: "/exercises/example.png",
        imageStatus: "available",
      }),
    ).toBe("/gym-tracker/exercises/example.png");
    expect(
      getExerciseImageUrl({
        id: "custom-exercise",
        isCustom: true,
        image: "https://example.com/custom.png",
      }),
    ).toBe("https://example.com/custom.png");
    expect(
      getExerciseImageUrl({
        id: "unknown-exercise",
        image: "/uploads/custom.png",
      }),
    ).toBe("/gym-tracker/uploads/custom.png");
    expect(
      getExerciseImageUrl({
        id: "custom-data",
        image: "data:image/png;base64,test",
      }),
    ).toBe("data:image/png;base64,test");
  });
});
