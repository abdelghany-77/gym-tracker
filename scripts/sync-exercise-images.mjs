import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import process from "node:process";
import sharp from "sharp";
import { exercisesDatabase } from "../src/data/exercises.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputDir = path.join(root, "public/exercises");
const manifest = JSON.parse(
  await fs.readFile(path.join(outputDir, "manifest.json"), "utf8"),
);
const args = process.argv.slice(2);
const onlyArg = args.find((arg) => arg.startsWith("--only="));
if (
  args.some(
    (arg) => !["--check", "--contact-sheets"].includes(arg) && arg !== onlyArg,
  ) ||
  args.length > 1
) {
  throw new Error(
    "Use no arguments, --check, --contact-sheets, or --only=<exercise-id>.",
  );
}
const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");
const byId = new Map(manifest.images.map((entry) => [entry.id, entry]));
if (
  manifest.schemaVersion !== 1 ||
  byId.size !== manifest.images.length ||
  byId.size !== exercisesDatabase.length
) {
  throw new Error(
    "Image manifest must cover every catalog exercise exactly once.",
  );
}
for (const exercise of exercisesDatabase) {
  const entry = byId.get(exercise.id);
  if (
    !entry ||
    entry.name !== exercise.name ||
    !entry.note ||
    entry.status !== exercise.imageStatus ||
    entry.path !== exercise.image
  ) {
    throw new Error(`Image audit/catalog mismatch: ${exercise.id}`);
  }
  if (entry.status === "available") {
    if (
      entry.path !== `/exercises/${entry.id}.png` ||
      !/^[a-zA-Z0-9_-]+$/.test(entry.id) ||
      !/^[a-zA-Z0-9_-]+$/.test(entry.sourceId) ||
      !/^[a-f0-9]{64}$/.test(entry.sha256)
    ) {
      throw new Error(`Incomplete image provenance: ${entry.id}`);
    }
  } else if (
    entry.status !== "unavailable" ||
    entry.path !== null ||
    entry.sourceId !== null ||
    entry.sha256 !== null ||
    !exercise.imageUnavailableReason
  ) {
    throw new Error(
      `Unavailable image must have no asset/source/hash: ${entry.id}`,
    );
  }
}

async function checkImages() {
  const hashes = new Set();
  for (const entry of manifest.images) {
    const filename = path.join(outputDir, `${entry.id}.png`);
    if (entry.status === "unavailable") {
      try {
        await fs.access(filename);
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
      throw new Error(`Remove misleading unavailable asset: ${entry.id}`);
    }
    const buffer = await fs.readFile(filename);
    const metadata = await sharp(buffer).metadata();
    if (digest(buffer) !== entry.sha256)
      throw new Error(`Unaudited image bytes: ${entry.id}`);
    if (
      metadata.format !== "png" ||
      metadata.width !== 768 ||
      metadata.height !== 384 ||
      buffer.length > 2 * 1024 * 1024
    )
      throw new Error(`Invalid image format/size: ${entry.id}`);
    if (hashes.has(entry.sha256))
      throw new Error(`Duplicate exercise picture: ${entry.id}`);
    hashes.add(entry.sha256);
  }
}

if (args.includes("--check") || args.includes("--contact-sheets")) {
  await checkImages();
  if (args.includes("--contact-sheets")) {
    // Never open full-size assets or base64 SVG sources during visual review.
    const sheetsDir = path.join(
      root,
      "node_modules/.cache/exercise-image-audit",
    );
    await fs.mkdir(sheetsDir, { recursive: true });
    for (let offset = 0; offset < manifest.images.length; offset += 12) {
      const inputs = [];
      for (const [index, entry] of manifest.images
        .slice(offset, offset + 12)
        .entries()) {
        const left = (index % 4) * 160;
        const top = Math.floor(index / 4) * 164;
        if (entry.status === "available") {
          inputs.push({
            input: await sharp(path.join(outputDir, `${entry.id}.png`))
              .resize(160, 140, { fit: "contain", background: "white" })
              .png()
              .toBuffer(),
            left,
            top,
          });
        }
        const label = `${offset + index + 1}: ${entry.status === "unavailable" ? "UNAVAILABLE" : entry.id}`;
        inputs.push({
          input: Buffer.from(
            `<svg width="160" height="24"><rect width="160" height="24" fill="white"/><text x="4" y="16" font-size="11">${label}</text></svg>`,
          ),
          left,
          top: top + 140,
        });
      }
      await sharp({
        create: { width: 640, height: 492, channels: 3, background: "white" },
      })
        .composite(inputs)
        .png()
        .toFile(path.join(sheetsDir, `review-${offset}.png`));
    }
    console.log(`Small review sheets: ${sheetsDir}`);
  }
} else {
  const selected = onlyArg
    ? [byId.get(onlyArg.slice("--only=".length))]
    : manifest.images;
  if (onlyArg && (!selected[0] || selected[0].status !== "available")) {
    throw new Error("--only must identify an available, audited exercise.");
  }
  const catalogResponse = await fetch(
    `${manifest.sourceRoot}/dist/exercises.json`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (!catalogResponse.ok)
    throw new Error(
      `Could not read source catalog (${catalogResponse.status})`,
    );
  const sourceIds = new Set(
    (await catalogResponse.json()).map((exercise) => exercise.id),
  );
  for (const entry of selected) {
    // Explicitly unavailable entries never borrow a different exercise's illustration.
    if (entry.status === "unavailable") continue;
    if (!sourceIds.has(entry.sourceId))
      throw new Error(`Unknown source ID: ${entry.sourceId}`);
    const inputs = await Promise.all(
      [0, 1].map(async (stage) => {
        const response = await fetch(
          `${manifest.sourceRoot}/exercises/${entry.sourceId}/${stage}.jpg`,
          { signal: AbortSignal.timeout(30000) },
        );
        if (!response.ok)
          throw new Error(
            `Could not download ${entry.sourceId}/${stage}.jpg (${response.status})`,
          );
        return {
          input: await sharp(Buffer.from(await response.arrayBuffer()))
            .resize(384, 384, { fit: "contain", background: "#0B0F17" })
            .png({ compressionLevel: 9, palette: true })
            .toBuffer(),
          left: stage * 384,
          top: 0,
        };
      }),
    );
    const image = await sharp({
      create: { width: 768, height: 384, channels: 3, background: "#0B0F17" },
    })
      .composite(inputs)
      .png()
      .toBuffer();
    // Upstream main can change. Do not silently bless new bytes (including encoder changes).
    if (digest(image) !== entry.sha256) {
      throw new Error(
        `Source/encoder changed for ${entry.id}; visually re-audit small contact sheets before updating its manifest hash.`,
      );
    }
    const destination = path.join(outputDir, `${entry.id}.png`);
    const temporary = `${destination}.tmp`;
    try {
      await fs.writeFile(temporary, image);
      await fs.rename(temporary, destination);
    } finally {
      await fs.rm(temporary, { force: true });
    }
  }
  await checkImages();
}
const available = manifest.images.filter(
  (entry) => entry.status === "available",
).length;
console.log(
  `Image audit: ${manifest.images.length} catalog entries; ${available} available, ${manifest.images.length - available} explicitly unavailable.`,
);
