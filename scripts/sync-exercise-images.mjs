import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main";
const outputDir = path.resolve("public/exercises");

const imageSources = {
  chest_bb_flat_bench: "Barbell_Bench_Press_-_Medium_Grip",
  chest_db_flat_press: "Dumbbell_Bench_Press",
  chest_bb_incline_press: "Barbell_Incline_Bench_Press_-_Medium_Grip",
  chest_db_incline_press: "Incline_Dumbbell_Press",
  chest_machine_flat_press: "Leverage_Chest_Press",
  chest_bb_decline_press: "Decline_Barbell_Bench_Press",
  chest_db_decline_press: "Decline_Dumbbell_Bench_Press",
  chest_dips: "Dips_-_Chest_Version",
  back_wide_lat_pulldown: "Wide-Grip_Lat_Pulldown",
  back_close_grip_pulldown: "V-Bar_Pulldown",
  back_pullups: "Pullups",
  back_bb_bent_over_row: "Bent_Over_Barbell_Row",
  back_tbar_row: "T-Bar_Row_with_Handle",
  back_seated_cable_row: "Seated_Cable_Rows",
  back_db_single_arm_row: "One-Arm_Dumbbell_Row",
  back_straight_arm_pulldown: "Straight-Arm_Pulldown",
  back_db_pullover: "Bent-Arm_Dumbbell_Pullover",
  back_face_pulls: "Face_Pull",
  back_hyperextension: "Hyperextensions_Back_Extensions",
  sh_seated_db_press: "Seated_Dumbbell_Press",
  sh_standing_bb_ohp: "Standing_Military_Press",
  sh_machine_shoulder_press: "Machine_Shoulder_Military_Press",
  sh_arnold_press: "Arnold_Dumbbell_Press",
  sh_db_lateral_raise: "Side_Lateral_Raise",
  sh_cable_lateral_raise: "Cable_Seated_Lateral_Raise",
  sh_reverse_pec_deck: "Reverse_Machine_Flyes",
  sh_bent_over_db_raise: "Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench",
  sh_cable_rear_delt_fly: "Cable_Rear_Delt_Fly",
  sh_db_shrugs: "Dumbbell_Shrug",
  sh_bb_shrugs: "Barbell_Shrug",
  leg_bb_back_squat: "Barbell_Squat",
  leg_hack_squat: "Hack_Squat",
  leg_45_press: "Leg_Press",
  leg_extension: "Leg_Extensions",
  leg_bulgarian_split_squat: "Split_Squat_with_Dumbbells",
  leg_walking_lunges: "Dumbbell_Lunges",
  leg_bb_rdl: "Romanian_Deadlift",
  leg_db_rdl: "Romanian_Deadlift",
  leg_lying_curl: "Lying_Leg_Curls",
  leg_seated_curl: "Seated_Leg_Curl",
  leg_standing_calf_raise: "Standing_Dumbbell_Calf_Raise",
  leg_seated_calf_raise: "Seated_Calf_Raise",
  arm_bb_bicep_curl: "Barbell_Curl",
  arm_db_incline_curl: "Incline_Dumbbell_Curl",
  arm_preacher_curl: "Preacher_Curl",
  arm_db_hammer_curl: "Alternate_Hammer_Curl",
  arm_concentration_curl: "Concentration_Curls",
  arm_rope_pushdown: "Triceps_Pushdown_-_Rope_Attachment",
  arm_ez_skull_crushers: "EZ-Bar_Skullcrusher",
  arm_overhead_cable_ext: "Triceps_Overhead_Extension_with_Rope",
  arm_close_grip_bench: "Close-Grip_Barbell_Bench_Press",
  core_hanging_leg_raise: "Hanging_Leg_Raise",
  core_cable_kneeling_crunch: "Cable_Crunch",
  core_decline_crunch: "Decline_Crunch",
  core_ab_wheel_rollout: "Barbell_Ab_Rollout_-_On_Knees",
  core_russian_twist: "Russian_Twist",
  core_lying_leg_raise: "Flat_Bench_Lying_Leg_Raise",
};

const catalog = await fetch(`${sourceRoot}/dist/exercises.json`).then((response) => {
  if (!response.ok) throw new Error(`Could not read source catalog (${response.status})`);
  return response.json();
});

const catalogIds = new Set(catalog.map((exercise) => exercise.id));
const missingSourceEntries = Object.entries(imageSources).filter(([, sourceId]) => !catalogIds.has(sourceId));
if (missingSourceEntries.length > 0) {
  throw new Error(`Unknown source IDs: ${missingSourceEntries.map(([id, sourceId]) => `${id}=${sourceId}`).join(", ")}`);
}

await fs.mkdir(outputDir, { recursive: true });

for (const [exerciseId, sourceId] of Object.entries(imageSources)) {
  const [start, finish] = await Promise.all(
    [0, 1].map(async (stage) => {
      const response = await fetch(`${sourceRoot}/exercises/${sourceId}/${stage}.jpg`);
      if (!response.ok) throw new Error(`Could not download ${sourceId}/${stage}.jpg (${response.status})`);
      return Buffer.from(await response.arrayBuffer());
    }),
  );

  const [startImage, finishImage] = await Promise.all(
    [start, finish].map((image) =>
      sharp(image)
        .resize(384, 384, { fit: "contain", background: "#0B0F17" })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer(),
    ),
  );

  const outputPath = path.join(outputDir, `${exerciseId}.png`);
  const temporaryPath = `${outputPath}.tmp`;
  await sharp({
    create: {
      width: 768,
      height: 384,
      channels: 3,
      background: "#0B0F17",
    },
  })
    .composite([
      { input: startImage, left: 0, top: 0 },
      { input: finishImage, left: 384, top: 0 },
    ])
    .png()
    .toFile(temporaryPath);
  await fs.rename(temporaryPath, outputPath);
}

const attribution = `# Exercise image attribution

The exercise illustrations in this directory are sourced from
[yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), distributed
under [The Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md).

Each replacement image is a local side-by-side composition of the source
exercise's \`0.jpg\` starting position and \`1.jpg\` finishing position.
`;
await fs.writeFile(path.join(outputDir, "SOURCE.md"), attribution);

console.log(`Updated ${Object.keys(imageSources).length} exercise images.`);
