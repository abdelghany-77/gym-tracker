import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Process back images: crop off the bottom stray headers
const backCrops = {
  'back1.png': 638,
  'back2.png': 684,
  'back3.png': 681,
  'back4.png': 680,
  'back6.png': 601,
  'back7.png': 627,
  'back8.png': 468,
};

for (const [file, maxY] of Object.entries(backCrops)) {
  const p = path.join('public/back', file);
  if (fs.existsSync(p)) {
    const meta = await sharp(p).metadata();
    const cropped = await sharp(p)
      .extract({ left: 0, top: 0, width: meta.width, height: maxY })
      .png()
      .toBuffer();
    fs.writeFileSync(p, cropped);
    console.log(`Cleanly cropped stray header from ${file} (height: ${meta.height} -> ${maxY})`);
  }
}

// 2. Map every exercise to its verified, correct illustration
const exerciseAssetMap = {
  // ── CHEST ──
  chest_bb_flat_bench: 'public/chest/chest1.png',         // ضغط بنش بالبار مستوي (BARBELL BENCH PRESS)
  chest_db_flat_press: 'public/chest/chest5.png',         // تجميع دمبل مستوي (FLAT DB FLY / PRESS)
  chest_bb_incline_press: 'public/chest/chest2.png',      // بنش بار عالي (INCLINE BARBELL PRESS)
  chest_db_incline_press: 'public/chest/chest2.png',      // تجميع دمبل عالي
  chest_machine_flat_press: 'public/new/chest_machine_press.png', // ضغط صدر بالآلة مستوي (1024x1024 dark)
  chest_machine_incline_press: 'public/new/chest_machine_press.png',
  chest_bb_decline_press: 'public/new/chest_decline_bench.png',   // ضغط بنش مائل للأسفل بالبار (1024x1024 dark)
  chest_db_decline_press: 'public/new/chest_decline_bench.png',
  chest_high_to_low_cable_fly: 'public/chest/chest3.png', // سحب كابل من أعلى لأسفل (High-to-Low Cable Fly)
  chest_low_to_high_cable_fly: 'public/new/chest_svend_press.png', // عزل صدر داخلي / سفلي
  chest_pec_deck_fly: 'public/chest/chest4.png',          // فتح جهاز صدر (Pec Deck Fly)
  chest_dips: 'public/chest/chest6.png',                  // غطس صدر (Chest Dips)

  // ── BACK ──
  back_wide_lat_pulldown: 'public/back/back1.png',        // سحب عالي واسع (WIDE-GRIP LAT PULLDOWN)
  back_close_grip_pulldown: 'public/back/back8.png',      // سحب قبضة ضيقة (CLOSE-GRIP PULLDOWN)
  back_pullups: 'public/back/back4.png',                  // عقلة (PULL-UPS)
  back_bb_bent_over_row: 'public/back/back2.png',         // سحب بالبار مائل (BENT-OVER BARBELL ROW)
  back_tbar_row: 'public/new/back_t_bar_row.png',         // سحب تي بار (1024x1024 dark)
  back_seated_cable_row: 'public/back/back3.png',         // سحب أرضي بالكابل (SEATED CABLE ROW)
  back_db_single_arm_row: 'public/back/back5.png',        // سحب دمبل فردي (SINGLE-ARM DB ROW)
  back_chest_supported_row: 'public/new/back_t_bar_row.png',
  back_straight_arm_pulldown: 'public/new/back_straight_arm_pulldown.png', // سحب مستقيم بالكابل (1024x1024 dark)
  back_db_pullover: 'public/new/back_straight_arm_pulldown.png',
  back_face_pulls: 'public/new/shoulders_face_pulls.png', // فيس بول (1024x1024 dark)
  back_hyperextension: 'public/back/back7.png',           // تمديد ظهر (HYPEREXTENSION)

  // ── SHOULDERS ──
  sh_standing_bb_ohp: 'public/new/shoulders_front_raise.png', // ضغط كتف بار أمامي (1024x1024 dark)
  sh_seated_db_press: 'public/shoulders/shoulder5.png',   // ضغط دمبل جالس (SEATED DB PRESS)
  sh_machine_shoulder_press: 'public/shoulders/shoulder1.png',
  sh_arnold_press: 'public/new/shoulders_arnold_press.png', // أرنولد برس (1024x1024 dark)
  sh_db_lateral_raise: 'public/shoulders/shoulder2.png',  // رفرفة جانبي دمبل (DB LATERAL RAISE)
  sh_cable_lateral_raise: 'public/shoulders/shoulder2.png',
  sh_machine_lateral_raise: 'public/shoulders/shoulder2.png',
  sh_reverse_pec_deck: 'public/shoulders/shoulder4.png',  // رفرفة خلفي جهاز (REVERSE PEC DECK)
  sh_bent_over_db_raise: 'public/shoulders/shoulder4.png',
  sh_cable_rear_delt_fly: 'public/shoulders/shoulder6.png',
  sh_db_shrugs: 'public/new/shoulders_shrugs.png',        // ترابيس دمبل (1024x1024 dark)
  sh_bb_shrugs: 'public/new/shoulders_upright_row.png',   // ترابيس بار (1024x1024 dark)

  // ── LEGS ──
  leg_bb_back_squat: 'public/legs/leg1.png',              // سكوات خلفي بالبار (BARBELL BACK SQUAT)
  leg_hack_squat: 'public/new/legs_hack_squat.png',       // ضغط هاك (HACK SQUAT - Reference Image!)
  leg_45_press: 'public/legs/leg2.png',                   // ضغط رجل 45 (LEG PRESS)
  leg_extension: 'public/legs/leg2.png',
  leg_bulgarian_split_squat: 'public/new/legs_bulgarian_split_squat.png', // بلجاريان سبليت سكوات (1024x1024 dark)
  leg_walking_lunges: 'public/legs/leg3.png',             // طعنات مشي (WALKING LUNGES)
  leg_bb_rdl: 'public/legs/leg4.png',                     // رفعة ميتة رومانية (ROMANIAN DEADLIFT)
  leg_db_rdl: 'public/legs/leg4.png',
  leg_lying_curl: 'public/legs/leg5.png',                 // مرجحة رجل نائم (LYING LEG CURL)
  leg_seated_curl: 'public/legs/leg6.png',                 // مرجحة رجل جالس (SEATED LEG CURL)
  leg_standing_calf_raise: 'public/new/legs_standing_calf_raises.png', // سمانة واقف (1024x1024 dark)
  leg_seated_calf_raise: 'public/legs/leg7.png',          // سمانة جالس (SEATED CALF RAISE)

  // ── ARMS ──
  arm_bb_bicep_curl: 'public/arm/arm1.png',               // مرجحة باي بالبار (BARBELL BICEP CURL)
  arm_db_incline_curl: 'public/arm/arm3.png',             // مرجحة دمبل بنش مائل (INCLINE DB CURL)
  arm_preacher_curl: 'public/new/arms_preacher_curl.png', // مرجحة لاري سكوت / بريتشر (1024x1024 dark)
  arm_db_hammer_curl: 'public/arm/arm2.png',              // شاكوش دمبل (HAMMER CURL)
  arm_cable_rope_curl: 'public/arm/arm8.png',             // مرجحة كابل حبل
  arm_concentration_curl: 'public/arm/arm3.png',
  arm_rope_pushdown: 'public/arm/arm4.png',               // تراي حبل بالكابل (TRICEP PUSHDOWN)
  arm_straight_bar_pushdown: 'public/arm/arm4.png',
  arm_ez_skull_crushers: 'public/arm/arm7.png',           // سكل كراشر (SKULL CRUSHERS)
  arm_overhead_cable_ext: 'public/arm/arm5.png',          // تمديد تراي علوي بالكابل (OVERHEAD EXTENSION)
  arm_db_overhead_ext: 'public/arm/arm5.png',
  arm_close_grip_bench: 'public/arm/arm6.png',            // بنش قبضة ضيقة (CLOSE GRIP BENCH)
};

// 3. Copy mapped files directly to public/exercises/
for (const [id, srcPath] of Object.entries(exerciseAssetMap)) {
  const destPath = path.join('public/exercises', `${id}.png`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Mapped ${id} -> ${srcPath}`);
  } else {
    console.warn(`Source missing: ${srcPath} for ${id}`);
  }
}

console.log('All exercise images mapped and synchronized!');
