// @vitest-environment node
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { exercisesDatabase } from "../data/exercises.js";
import { getExerciseImageUrl } from "./imageUtil.js";

const root = new URL("../../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("public/exercises/manifest.json", root), "utf8"),
);
const available = manifest.images.filter(
  (entry) => entry.status === "available",
);
const unavailable = manifest.images.filter(
  (entry) => entry.status === "unavailable",
);
const byId = new Map(
  exercisesDatabase.map((exercise) => [exercise.id, exercise]),
);

describe("exercise image audit integrity", () => {
  it("covers all 72 exercises once, including explicit unavailable decisions", () => {
    expect(exercisesDatabase).toHaveLength(72);
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.images).toHaveLength(72);
    expect(new Set(manifest.images.map((entry) => entry.id)).size).toBe(72);
    expect(manifest.images.map((entry) => entry.id).sort()).toEqual(
      [...byId.keys()].sort(),
    );
    expect(available).toHaveLength(62);
    expect(unavailable).toHaveLength(10);
    for (const entry of manifest.images) {
      const exercise = byId.get(entry.id);
      expect(entry.name).toBe(exercise.name);
      expect(entry.status).toBe(exercise.imageStatus);
      expect(entry.path).toBe(exercise.image);
      expect(entry.note.length).toBeGreaterThan(20);
    }
  });

  it.each(available)(
    "$id has a local, decodable, reviewed PNG with provenance",
    async (entry) => {
      expect(entry.path).toBe(`/exercises/${entry.id}.png`);
      expect(entry.sourceId).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      const bytes = await readFile(new URL(`public${entry.path}`, root));
      expect(bytes.length).toBeLessThan(2 * 1024 * 1024);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        entry.sha256,
      );
      const metadata = await sharp(bytes).metadata();
      expect(metadata.format).toBe("png");
      expect([metadata.width, metadata.height]).toEqual([768, 384]);
      // Force a decode as well as checking headers; never display the original.
      const decoded = await sharp(bytes)
        .resize(8, 4)
        .removeAlpha()
        .raw()
        .toBuffer();
      expect(decoded).toHaveLength(8 * 4 * 3);
    },
  );

  it.each(unavailable)(
    "$id cannot resolve to a misleading stale picture",
    async (entry) => {
      expect(entry.path).toBeNull();
      expect(entry.sourceId).toBeNull();
      expect(entry.sha256).toBeNull();
      expect(byId.get(entry.id).imageUnavailableReason).toBe(entry.note);
      expect(
        getExerciseImageUrl({
          id: entry.id,
          image: `/exercises/${entry.id}.png`,
          imageStatus: "available",
        }),
      ).toBeUndefined();
      await expect(
        access(
          fileURLToPath(new URL(`public/exercises/${entry.id}.png`, root)),
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
    },
  );

  it("never reuses the same picture for different exercises", () => {
    expect(new Set(available.map((entry) => entry.sha256)).size).toBe(
      available.length,
    );
  });

  it("locks the known equipment/variant regressions", () => {
    const entries = new Map(manifest.images.map((entry) => [entry.id, entry]));
    expect(entries.get("core_ab_wheel_rollout").sourceId).toBe("Ab_Roller");
    expect(entries.get("leg_standing_calf_raise").sourceId).toBe(
      "Standing_Calf_Raises",
    );
    expect(entries.get("back_chest_supported_row").sourceId).toBe(
      "Leverage_Iso_Row",
    );
    expect(entries.get("core_captain_chair_raise").sourceId).toBe(
      "Knee_Hip_Raise_On_Parallel_Bars",
    );
    expect(entries.get("arm_db_overhead_ext").sourceId).toBe(
      "Standing_One-Arm_Dumbbell_Triceps_Extension",
    );
    for (const id of [
      "leg_db_rdl",
      "leg_walking_lunges",
      "sh_machine_lateral_raise",
      "core_weighted_plank",
      "core_hollow_body_hold",
    ]) {
      expect(entries.get(id).status).toBe("unavailable");
    }
  });

  it("documents a decision for every catalog exercise", async () => {
    const report = await readFile(
      new URL("docs/EXERCISE_IMAGE_AUDIT.md", root),
      "utf8",
    );
    for (const exercise of exercisesDatabase)
      expect(report).toContain(`\`${exercise.id}\``);
  });
});
