// @vitest-environment node
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { exercisesDatabase } from "../data/exercises.js";
import { PILOT_MEDIA_REGISTRY } from "../data/pilotMediaData.js";
import { getExerciseMediaInfo } from "./imageUtil.js";

const root = new URL("../../", import.meta.url);
const pilotManifest = JSON.parse(
  await readFile(new URL("public/media/pilot-manifest.json", root), "utf8"),
);
const catalogById = new Map(exercisesDatabase.map((ex) => [ex.id, ex]));

function hammingDistanceHex(hexA, hexB) {
  let a = BigInt(`0x${hexA}`);
  let b = BigInt(`0x${hexB}`);
  let x = a ^ b;
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

describe("41-exercise dual-asset verified media integrity", () => {
  it("contains all 41 verified entries synchronized with PILOT_MEDIA_REGISTRY", () => {
    expect(pilotManifest.schemaVersion).toBe(2);
    expect(pilotManifest.exercises).toHaveLength(41);
    expect(Object.keys(PILOT_MEDIA_REGISTRY)).toHaveLength(41);

    for (const entry of pilotManifest.exercises) {
      expect(catalogById.has(entry.id)).toBe(true);
      expect(PILOT_MEDIA_REGISTRY[entry.id]).toBeDefined();
      expect(entry.completionStatus).toBe("complete");
      expect(entry.anatomy.status).toBe("verified");
      expect(entry.video.status).toBe("verified");
    }
  });

  it.each(pilotManifest.exercises)(
    "$id has verified anatomy WebP + continuous MP4 video within strict byte budgets and provenance",
    async (entry) => {
      // Anatomy asset checks
      expect(entry.anatomy.path).toBe(`/media/anatomy/${entry.id}.webp`);
      expect(entry.anatomy.redistributionVerified).toBe(true);
      expect(entry.anatomy.license.length).toBeGreaterThan(3);
      expect(entry.anatomy.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.anatomy.perceptualHash).toMatch(/^[a-f0-9]{16}$/);

      const anatomyBytes = await readFile(
        new URL(`public${entry.anatomy.path}`, root),
      );
      expect(anatomyBytes.length).toBe(entry.anatomy.bytes);
      expect(anatomyBytes.length).toBeLessThanOrEqual(60 * 1024);
      expect(createHash("sha256").update(anatomyBytes).digest("hex")).toBe(
        entry.anatomy.sha256,
      );

      const meta = await sharp(anatomyBytes).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(640);
      expect(meta.height).toBe(480);

      // Video asset checks
      expect(entry.video.path).toBe(`/media/videos/${entry.id}.mp4`);
      expect(entry.video.redistributionVerified).toBe(true);
      expect(entry.video.license).toMatch(
        /CC-BY-SA 4\.0|CC BY-SA 4\.0|CC BY 3\.0|Public Domain/,
      );
      expect(entry.video.attribution.length).toBeGreaterThan(5);
      expect(entry.video.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.video.keyframePerceptualHash).toMatch(/^[a-f0-9]{16}$/);

      const videoBytes = await readFile(
        new URL(`public${entry.video.path}`, root),
      );
      expect(videoBytes.length).toBe(entry.video.bytes);
      expect(videoBytes.length).toBeLessThanOrEqual(350 * 1024);
      expect(createHash("sha256").update(videoBytes).digest("hex")).toBe(
        entry.video.sha256,
      );
      // Verify ISO Base Media File Format (MP4 ftyp box)
      expect(videoBytes.subarray(4, 8).toString("ascii")).toBe("ftyp");
    },
  );

  it("enforces zero exact duplicates and zero visually duplicate assets across anatomy and video", () => {
    const entries = pilotManifest.exercises;
    expect(new Set(entries.map((e) => e.anatomy.sha256)).size).toBe(41);
    expect(new Set(entries.map((e) => e.video.sha256)).size).toBe(41);

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const anatDist = hammingDistanceHex(
          entries[i].anatomy.perceptualHash,
          entries[j].anatomy.perceptualHash,
        );
        const vidDist = hammingDistanceHex(
          entries[i].video.keyframePerceptualHash,
          entries[j].video.keyframePerceptualHash,
        );
        expect(
          anatDist,
          `Anatomy visual similarity too close: ${entries[i].id} vs ${entries[j].id}`,
        ).toBeGreaterThanOrEqual(6);
        expect(
          vidDist,
          `Video visual similarity too close: ${entries[i].id} vs ${entries[j].id}`,
        ).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it("stays well under the 16.0 MB total 41-exercise media budget", () => {
    const totalBytes = pilotManifest.exercises.reduce(
      (sum, entry) => sum + entry.anatomy.bytes + entry.video.bytes,
      0,
    );
    expect(totalBytes).toBeLessThanOrEqual(16 * 1024 * 1024);
    expect(pilotManifest.measurements.totalCombinedBytes).toBe(totalBytes);
  });

  it("marks completionStatus as complete ONLY when both anatomy and video are verified", () => {
    const verifiedEx = catalogById.get("chest_bb_flat_bench");
    const verifiedInfo = getExerciseMediaInfo(verifiedEx);
    expect(verifiedInfo.completionStatus).toBe("complete");
    expect(verifiedInfo.hasVerifiedDualMedia).toBe(true);
    expect(verifiedInfo.anatomyUrl).toContain("/media/anatomy/chest_bb_flat_bench.webp");
    expect(verifiedInfo.videoUrl).toContain("/media/videos/chest_bb_flat_bench.mp4");

    // Non-verified exercise with a legacy 2-frame PNG fallback MUST remain "incomplete"
    const legacyEx = catalogById.get("chest_bb_decline_press");
    const legacyInfo = getExerciseMediaInfo(legacyEx);
    expect(legacyInfo.completionStatus).toBe("incomplete");
    expect(legacyInfo.hasVerifiedDualMedia).toBe(false);
    expect(legacyInfo.anatomyUrl).toBeUndefined();
    expect(legacyInfo.videoUrl).toBeUndefined();
    expect(legacyInfo.fallbackImageUrl).toBeDefined();
  });
});
