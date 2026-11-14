import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SOURCE_ICON = path.resolve("public/icons/icon-512.png");
const RES_DIR = path.resolve("android/app/src/main/res");
const BG_COLOR = { r: 11, g: 15, b: 23, alpha: 1 }; // #0B0F17 (App dark background)

// Copy to public/icon.png so web root icon also matches
fs.copyFileSync(SOURCE_ICON, path.resolve("public/icon.png"));

const iconDensities = [
  { dir: "mipmap-mdpi", size: 48, fgSize: 108 },
  { dir: "mipmap-hdpi", size: 72, fgSize: 162 },
  { dir: "mipmap-xhdpi", size: 96, fgSize: 216 },
  { dir: "mipmap-xxhdpi", size: 144, fgSize: 324 },
  { dir: "mipmap-xxxhdpi", size: 192, fgSize: 432 },
];

const splashScreens = [
  { dir: "drawable", w: 480, h: 800, iconSize: 180 },
  { dir: "drawable-port-mdpi", w: 320, h: 480, iconSize: 130 },
  { dir: "drawable-port-hdpi", w: 480, h: 800, iconSize: 180 },
  { dir: "drawable-port-xhdpi", w: 720, h: 1280, iconSize: 260 },
  { dir: "drawable-port-xxhdpi", w: 960, h: 1600, iconSize: 340 },
  { dir: "drawable-port-xxxhdpi", w: 1280, h: 1920, iconSize: 420 },
  { dir: "drawable-land-mdpi", w: 480, h: 320, iconSize: 130 },
  { dir: "drawable-land-hdpi", w: 800, h: 480, iconSize: 180 },
  { dir: "drawable-land-xhdpi", w: 1280, h: 720, iconSize: 240 },
  { dir: "drawable-land-xxhdpi", w: 1600, h: 960, iconSize: 320 },
  { dir: "drawable-land-xxxhdpi", w: 1920, h: 1280, iconSize: 380 },
];

async function generate() {
  console.log(`Generating Android launcher icons and splash screens from ${SOURCE_ICON}...`);

  // 1. Generate Mipmap Icons
  for (const { dir, size, fgSize } of iconDensities) {
    const targetDir = path.join(RES_DIR, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (composite on #0B0F17)
    const iconInnerSize = Math.round(size * 0.82);
    const iconBuffer = await sharp(SOURCE_ICON)
      .resize(iconInnerSize, iconInnerSize, { fit: "contain" })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: iconBuffer, gravity: "center" }])
      .png()
      .toFile(path.join(targetDir, "ic_launcher.png"));

    // ic_launcher_round.png
    const radius = size / 2;
    const circleSvg = Buffer.from(
      `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#0B0F17"/></svg>`
    );
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: circleSvg, blend: "over" },
        { input: iconBuffer, blend: "over", gravity: "center" },
      ])
      .png()
      .toFile(path.join(targetDir, "ic_launcher_round.png"));

    // ic_launcher_foreground.png (transparent background, adaptive icon safe zone ~65%)
    const fgInnerSize = Math.round(fgSize * 0.65);
    const fgIconBuffer = await sharp(SOURCE_ICON)
      .resize(fgInnerSize, fgInnerSize, { fit: "contain" })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: fgIconBuffer, gravity: "center" }])
      .png()
      .toFile(path.join(targetDir, "ic_launcher_foreground.png"));

    console.log(`✓ ${dir} generated`);
  }

  // 2. Generate Splash Screens
  for (const { dir, w, h, iconSize } of splashScreens) {
    const targetDir = path.join(RES_DIR, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const splashIconBuffer = await sharp(SOURCE_ICON)
      .resize(iconSize, iconSize, { fit: "contain" })
      .toBuffer();

    await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: splashIconBuffer, gravity: "center" }])
      .png()
      .toFile(path.join(targetDir, "splash.png"));

    console.log(`✓ ${dir}/splash.png (${w}x${h}) generated`);
  }

  console.log("All Android assets successfully generated from public/icons/icon-512.png!");
}

generate().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
