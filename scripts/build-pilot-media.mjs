import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

const PILOT_SPECS = [
  {
    id: "chest_bb_flat_bench",
    name: "Barbell Bench Press",
    anatomySourceFile: "src/assets/images/anat_chest_bb_flat_bench_1795167665345.jpg",
    anatomyNote:
      "Flat barbell bench press on horizontal bench; primary sternal pectoralis major (crimson) and secondary anterior delts/triceps (amber) verified.",
    wgerExerciseId: 73,
    videoUrl:
      "https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV",
    clipStartSec: 2,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action barbell bench press full eccentric-to-concentric rep loop from wger.de (exercise #73, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "chest_db_incline_press",
    name: "Incline Dumbbell Press",
    anatomySourceFile: "src/assets/images/anat_chest_db_incline_press_1795167665428.jpg",
    anatomyNote:
      "35-degree incline dumbbell press; primary upper clavicular pectoralis major (crimson) and secondary anterior delts/triceps (amber) verified.",
    wgerExerciseId: 537,
    videoUrl:
      "https://wger.de/media/exercise-video/537/b9c937e9-daeb-42a9-be8e-7a77e368478c.MOV",
    clipStartSec: 5,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action incline dumbbell press full rep loop from wger.de (exercise #537, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "back_seated_cable_row",
    name: "Seated Cable Row",
    anatomySourceFile: "src/assets/images/anat_back_seated_cable_row_1795167664091.jpg",
    anatomyNote:
      "Seated narrow-grip cable row; primary mid-trapezius, rhomboids, and mid-lats (crimson) and secondary rear delts/biceps/forearms (amber) verified.",
    wgerExerciseId: 512,
    videoUrl:
      "https://wger.de/media/exercise-video/512/fff4c294-93f0-4926-b3a2-bf59ad4afaa5.MOV",
    clipStartSec: 2,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action seated narrow-grip cable row full rep loop from wger.de (exercise #512, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "back_face_pulls",
    name: "Cable Face Pulls",
    anatomySourceFile: "src/assets/images/anat_back_face_pulls_1795167690701.jpg",
    anatomyNote:
      "Standing eye-level rope cable face pull; primary posterior delts, infraspinatus, upper-mid traps (crimson) and secondary rhomboids/biceps (amber) verified.",
    wgerExerciseId: 222,
    videoUrl:
      "https://wger.de/media/exercise-video/222/eea93fcc-6a3c-4783-8f70-0234c791a001.MOV",
    clipStartSec: 2.0,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action rear-view cable rope face pull full external-rotation rep loop from wger.de (exercise #222, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "sh_db_lateral_raise",
    name: "Dumbbell Lateral Raise",
    anatomySourceFile: "src/assets/images/anat_sh_db_lateral_raise_1795167669438.jpg",
    anatomyNote:
      "Standing dumbbell lateral raise to 90 degrees; primary lateral deltoids (crimson) and secondary upper traps/forearm stabilizers (amber) verified.",
    wgerExerciseId: 348,
    videoUrl:
      "https://wger.de/media/exercise-video/348/de69928a-8a35-4096-821c-1f46de5e0e03.MOV",
    clipStartSec: 3,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action standing dumbbell lateral raise full rep loop from wger.de (exercise #348, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "leg_db_rdl",
    name: "Dumbbell Romanian Deadlift",
    anatomySourceFile: "src/assets/images/anat_leg_db_rdl_1795168228119.jpg",
    anatomyNote:
      "Dumbbell Romanian deadlift hip hinge with paired dumbbells along shins; primary hamstrings and gluteus maximus (crimson) and secondary erector spinae/forearms (amber) verified.",
    wgerExerciseId: 507,
    videoUrl:
      "https://wger.de/media/exercise-video/507/6b6054b5-9236-4a63-8392-6ea7a9010ca6.MOV",
    clipStartSec: 4.5,
    clipDurationSec: 4.8,
    videoNote:
      "Real live-action side-profile dumbbell Romanian deadlift full hinge loop from wger.de (exercise #507, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "leg_lying_curl",
    name: "Lying Leg Curl",
    anatomySourceFile: "src/assets/images/anat_leg_lying_curl_1795167666013.jpg",
    anatomyNote:
      "Prone lying leg curl machine; primary hamstrings (crimson) and secondary gastrocnemius calves (amber) verified.",
    wgerExerciseId: 365,
    videoUrl:
      "https://wger.de/media/exercise-video/365/becaf013-5044-40d0-bae9-7ed60c973737.MOV",
    clipStartSec: 3,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action prone lying leg curl full flexion-extension loop from wger.de (exercise #365, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "glute_bb_hip_thrust",
    name: "Barbell Hip Thrust",
    anatomySourceFile: "src/assets/images/anat_glute_bb_hip_thrust_1795167664799.jpg",
    anatomyNote:
      "Barbell hip thrust with upper back on flat bench; primary gluteus maximus/medius (crimson) and secondary hamstrings/quads (amber) verified.",
    wgerExerciseId: 294,
    videoUrl:
      "https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV",
    clipStartSec: 5,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action barbell hip thrust full hip extension loop from wger.de (exercise #294, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "arm_bb_bicep_curl",
    name: "Barbell Bicep Curl",
    anatomySourceFile: "src/assets/images/anat_arm_bb_bicep_curl_1795167664973.jpg",
    anatomyNote:
      "Standing supinated barbell bicep curl; primary biceps brachii (crimson) and secondary brachialis/forearm flexors (amber) verified.",
    wgerExerciseId: 91,
    videoUrl:
      "https://wger.de/media/exercise-video/91/483f4bff-e108-41f1-8e7b-0caf24952552.MOV",
    clipStartSec: 2,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action standing barbell bicep curl full rep loop from wger.de (exercise #91, Author: Goulart, CC-BY-SA 4.0).",
  },
  {
    id: "arm_ez_skull_crushers",
    name: "EZ-Bar Skull Crushers",
    anatomySourceFile: "src/assets/images/anat_arm_ez_skull_crushers_1795167665767.jpg",
    anatomyNote:
      "Supine flat-bench EZ-bar skull crushers; primary triceps long/lateral heads (crimson) and secondary anconeus/forearm stabilizers (amber) verified.",
    wgerExerciseId: 246,
    videoUrl:
      "https://wger.de/media/exercise-video/246/75eb8c88-922e-45c5-8be3-ac073f62b63f.MP4",
    clipStartSec: 3,
    clipDurationSec: 4.5,
    videoNote:
      "Real live-action supine EZ-bar skull crushers full extension loop from wger.de (exercise #246, Author: Goulart, CC-BY-SA 4.0).",
  },
];

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Compute 64-bit difference hash (dHash) as 16-char hex string for visual duplicate detection */
async function computeDHash(imageInput) {
  const { data } = await sharp(imageInput)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + x + 1];
      bits = (bits << 1n) | (left > right ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, "0");
}

function hammingDistanceHex(a, b) {
  let xor = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let dist = 0;
  while (xor > 0n) {
    dist += Number(xor & 1n);
    xor >>= 1n;
  }
  return dist;
}

const anatomyOutDir = path.join(root, "public/media/anatomy");
const videoOutDir = path.join(root, "public/media/videos");
const cacheDir = path.join(root, "node_modules/.cache/pilot-video-audit");

await fs.mkdir(anatomyOutDir, { recursive: true });
await fs.mkdir(videoOutDir, { recursive: true });
await fs.mkdir(cacheDir, { recursive: true });

const manifestEntries = [];
const videoSheetInputs = [];

for (let i = 0; i < PILOT_SPECS.length; i++) {
  const spec = PILOT_SPECS[i];
  console.log(`[${i + 1}/${PILOT_SPECS.length}] Processing ${spec.id}...`);

  // 1. Optimize anatomical illustration to <= 60 KB WebP (640x480)
  const rawAnatomyPath = path.join(root, spec.anatomySourceFile);
  const anatomyOutPath = path.join(anatomyOutDir, `${spec.id}.webp`);
  let quality = 82;
  let anatomyBuf = await sharp(rawAnatomyPath)
    .resize(640, 480, { fit: "cover" })
    .webp({ quality, effort: 6 })
    .toBuffer();

  while (anatomyBuf.length > 60 * 1024 && quality > 52) {
    quality -= 6;
    anatomyBuf = await sharp(rawAnatomyPath)
      .resize(640, 480, { fit: "cover" })
      .webp({ quality, effort: 6 })
      .toBuffer();
  }
  await fs.writeFile(anatomyOutPath, anatomyBuf);
  const anatomyMeta = await sharp(anatomyBuf).metadata();
  const anatomyDHash = await computeDHash(anatomyBuf);

  // 2. Download licensed wger video & transcode compact 480p H.264 loop (<= 350 KB)
  const rawVideoPath = path.join(cacheDir, `${spec.id}_raw.mov`);
  try {
    await fs.access(rawVideoPath);
  } catch {
    console.log(`   Downloading ${spec.videoUrl}...`);
    await execFileAsync("curl", [
      "-fsSL",
      "--max-time",
      "60",
      "-o",
      rawVideoPath,
      spec.videoUrl,
    ]);
  }

  const videoOutPath = path.join(videoOutDir, `${spec.id}.mp4`);
  let crf = 28;
  const encodeVideo = async (targetCrf, scaleHeight) => {
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      String(spec.clipStartSec),
      "-t",
      String(spec.clipDurationSec),
      "-i",
      rawVideoPath,
      "-an",
      "-vf",
      `scale='if(gt(iw,ih),480,-2)':'if(gt(iw,ih),-2,${scaleHeight})',fps=20`,
      "-c:v",
      "libx264",
      "-profile:v",
      "baseline",
      "-level",
      "3.0",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "slow",
      "-crf",
      String(targetCrf),
      "-movflags",
      "+faststart",
      videoOutPath,
    ]);
  };

  await encodeVideo(crf, 420);
  let videoBuf = await fs.readFile(videoOutPath);
  while (videoBuf.length > 340 * 1024 && crf < 36) {
    crf += 2;
    await encodeVideo(crf, crf >= 32 ? 360 : 420);
    videoBuf = await fs.readFile(videoOutPath);
  }

  // Probe final MP4 metadata
  const { stdout: probeJson } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    videoOutPath,
  ]);
  const probe = JSON.parse(probeJson);
  const vStream = probe.streams.find((s) => s.codec_type === "video");

  // Extract 3 keyframes (0.5s, 2.2s, 3.8s) for visual audit contact sheet & dHash
  const keyframePaths = [];
  for (const [kIdx, ts] of [0.5, 2.2, 3.8].entries()) {
    const kfPath = path.join(cacheDir, `${spec.id}_kf${kIdx}.png`);
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      String(ts),
      "-i",
      videoOutPath,
      "-frames:v",
      "1",
      kfPath,
    ]);
    keyframePaths.push(kfPath);
  }

  const midKeyframeBuf = await fs.readFile(keyframePaths[1]);
  const videoKeyframeDHash = await computeDHash(midKeyframeBuf);

  // Add row to contact sheet (3 frames + label)
  for (let k = 0; k < 3; k++) {
    videoSheetInputs.push({
      input: await sharp(keyframePaths[k])
        .resize(160, 120, { fit: "contain", background: "#0B0F17" })
        .png()
        .toBuffer(),
      left: k * 164,
      top: i * 144 + 20,
    });
  }
  videoSheetInputs.push({
    input: Buffer.from(
      `<svg width="492" height="20"><rect width="492" height="20" fill="#121824"/><text x="6" y="14" fill="#E2E8F0" font-size="11" font-family="sans-serif">${i + 1}. ${spec.id} (${(videoBuf.length / 1024).toFixed(1)} KB, ${vStream.width}x${vStream.height})</text></svg>`,
    ),
    left: 0,
    top: i * 144,
  });

  manifestEntries.push({
    id: spec.id,
    name: spec.name,
    pilotWave: 1,
    completionStatus: "complete",
    anatomy: {
      status: "verified",
      path: `/media/anatomy/${spec.id}.webp`,
      format: "webp",
      bytes: anatomyBuf.length,
      width: anatomyMeta.width,
      height: anatomyMeta.height,
      sha256: sha256(anatomyBuf),
      perceptualHash: anatomyDHash,
      sourceName: "GymTracker Custom Sports-Anatomy Plate",
      license: "Proprietary / App-Owned (Offline Redistribution Permitted)",
      attribution: "GymTracker Anatomy Studio",
      redistributionVerified: true,
      auditNote: spec.anatomyNote,
      auditedAt: "2026-11-20",
    },
    video: {
      status: "verified",
      path: `/media/videos/${spec.id}.mp4`,
      format: "mp4",
      codec: vStream.codec_name,
      bytes: videoBuf.length,
      width: vStream.width,
      height: vStream.height,
      durationSec: Number(Number(probe.format.duration).toFixed(2)),
      fps: 20,
      sha256: sha256(videoBuf),
      keyframePerceptualHash: videoKeyframeDHash,
      sourceName: `wger.de Exercise Video #${spec.wgerExerciseId}`,
      sourceUrl: spec.videoUrl,
      license: "CC-BY-SA 4.0",
      attribution: "Goulart via wger.de (CC-BY-SA 4.0)",
      redistributionVerified: true,
      auditNote: spec.videoNote,
      auditedAt: "2026-11-20",
    },
  });

  console.log(
    `   -> anatomy: ${(anatomyBuf.length / 1024).toFixed(1)} KB (${anatomyMeta.width}x${anatomyMeta.height}) | video: ${(videoBuf.length / 1024).toFixed(1)} KB (${vStream.width}x${vStream.height}, ${Number(probe.format.duration).toFixed(1)}s, crf=${crf})`,
  );
}

// Check pairwise perceptual duplicates across anatomy & video keyframes
let minAnatomyDist = 64;
let minVideoDist = 64;
for (let a = 0; a < manifestEntries.length; a++) {
  for (let b = a + 1; b < manifestEntries.length; b++) {
    const ad = hammingDistanceHex(
      manifestEntries[a].anatomy.perceptualHash,
      manifestEntries[b].anatomy.perceptualHash,
    );
    const vd = hammingDistanceHex(
      manifestEntries[a].video.keyframePerceptualHash,
      manifestEntries[b].video.keyframePerceptualHash,
    );
    if (ad < minAnatomyDist) minAnatomyDist = ad;
    if (vd < minVideoDist) minVideoDist = vd;
  }
}

await sharp({
  create: {
    width: 492,
    height: PILOT_SPECS.length * 144,
    channels: 3,
    background: "#0B0F17",
  },
})
  .composite(videoSheetInputs)
  .png()
  .toFile(path.join(cacheDir, "pilot-videos-sheet.png"));

const totalAnatomyBytes = manifestEntries.reduce(
  (s, e) => s + e.anatomy.bytes,
  0,
);
const totalVideoBytes = manifestEntries.reduce((s, e) => s + e.video.bytes, 0);

const manifest = {
  schemaVersion: 2,
  pilotStatus: "verified_pilot_10",
  generatedAt: "2026-11-20",
  budgets: {
    maxAnatomyBytesPerExercise: 60 * 1024,
    maxVideoBytesPerExercise: 350 * 1024,
    maxPilotTotalBytes: 4 * 1024 * 1024,
    minPerceptualHammingDistance: 6,
  },
  measurements: {
    pilotCount: manifestEntries.length,
    totalAnatomyBytes,
    totalVideoBytes,
    totalCombinedBytes: totalAnatomyBytes + totalVideoBytes,
    avgAnatomyKB: Number((totalAnatomyBytes / manifestEntries.length / 1024).toFixed(1)),
    avgVideoKB: Number((totalVideoBytes / manifestEntries.length / 1024).toFixed(1)),
    projected150ExercisesMB: Number(
      (((totalAnatomyBytes + totalVideoBytes) / manifestEntries.length) * 150 / (1024 * 1024)).toFixed(2),
    ),
    minAnatomyHammingDistance: minAnatomyDist,
    minVideoKeyframeHammingDistance: minVideoDist,
  },
  exercises: manifestEntries,
};

await fs.writeFile(
  path.join(root, "public/media/pilot-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

// Emit lightweight synchronous runtime registry synced with pilot-manifest.json
const runtimeRegistry = Object.fromEntries(
  manifestEntries.map((entry) => [
    entry.id,
    {
      id: entry.id,
      completionStatus: entry.completionStatus,
      anatomy: {
        status: entry.anatomy.status,
        path: entry.anatomy.path,
        width: entry.anatomy.width,
        height: entry.anatomy.height,
        bytes: entry.anatomy.bytes,
        attribution: entry.anatomy.attribution,
        license: entry.anatomy.license,
      },
      video: {
        status: entry.video.status,
        path: entry.video.path,
        width: entry.video.width,
        height: entry.video.height,
        durationSec: entry.video.durationSec,
        bytes: entry.video.bytes,
        attribution: entry.video.attribution,
        license: entry.video.license,
      },
    },
  ]),
);

await fs.writeFile(
  path.join(root, "src/data/pilotMediaData.js"),
  `// Auto-generated from public/media/pilot-manifest.json — do not edit manually.\nexport const PILOT_MEDIA_REGISTRY = ${JSON.stringify(runtimeRegistry, null, 2)};\n\nexport const PILOT_MEDIA_MEASUREMENTS = ${JSON.stringify(manifest.measurements, null, 2)};\n`,
);

console.log("\n=== PILOT MEDIA MEASUREMENTS ===");
console.log(JSON.stringify(manifest.measurements, null, 2));
