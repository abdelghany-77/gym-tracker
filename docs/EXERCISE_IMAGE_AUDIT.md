# Exercise image audit

Audit date: **2026-10-30**. Catalog: **72 exercises**. Outcome: **62 available**, **10 explicitly unavailable**. Thirteen assets were replaced or completed with start/finish pairs; 49 existing pairs were retained.

## Method and limits

- Checked every catalog picture against its English name, equipment and exercise cues, in catalog order. Reviewed original assets and replacement candidates only through Sharp-generated contact sheets: at most 12 exercises per sheet, 160px-wide tiles, 640×492px sheets. Original-resolution pictures and base64 SVG source were not opened in the review interface.
- Checked source catalog metadata/instructions where visual identification was ambiguous. A source name alone was not enough to approve a picture. For example, the available Russian/plate-twist pictures did not establish the required seated, feet-elevated dumbbell setup; the stiff-legged dumbbell deadlift candidate was not substituted for a Romanian deadlift.
- Available means the small-picture review supports the named equipment and gross movement/setup, **not** a certification of safe technique, fine joint angles, precise muscle targeting, or every frame of a movement. Static start/finish photographs cannot establish tempo or continuous motion. No exercise text or biomechanics claims were changed to accommodate a picture.
- Explicitly unavailable means an exact-enough replacement was not established in this audit, not that no such picture exists anywhere. The old misleading public asset was removed. The exercise remains usable without a photograph.
- Visible supported variants are recorded rather than concealed: the rear-delt dumbbell raise uses forehead support; the T-bar row uses a landmine attachment. A machine label encompassing a landmine apparatus does not imply a chest-supported machine.
- The initial small-sheet suspicion that leg extensions reused the leg-press photo was rechecked against the source pair: they are distinct pictures, and the knee-extension machine image was retained.

## Corrections and provenance

`public/exercises/manifest.json` is the machine-readable audit ledger for **all 72** exercises, replacing the old incomplete 57-entry sync mapping. Every available entry records its exact source ID, local path and reviewed PNG SHA-256. Every unavailable entry has null path, source ID and hash, plus a reason. The catalog exposes `imageStatus`; unavailable records also contain `imageUnavailableReason` and `image: null`.

Notable corrections: ab-wheel rollout now uses an actual roller rather than a barbell; standing machine calf raise now uses shoulder pads rather than dumbbells; chest-supported row no longer shows an overhead machine; captain’s-chair raise now has forearm supports. Several legacy one-frame pictures now have both source frames. Dumbbell RDL remains unavailable rather than showing a barbell or relabeling a stiff-legged variant.

Available photographs come from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), under [The Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md). Each local available PNG is a side-by-side composition of `<sourceId>/0.jpg` and `<sourceId>/1.jpg`. See `public/exercises/SOURCE.md`. Program/day covers are outside this 72-exercise audit and are not certified here.

## Required renderer treatment (parent/UI agent)

Use `getExerciseImageUrl(exercise)` from `src/utils/imageUtil.js`. It returns `undefined` for an explicitly unavailable record, even if a stale saved record includes an image path. Render a neutral, localized **“Image unavailable”** placeholder when there is no URL. Do not render `<img src="">`, and do not use `exercise.image || /exercises/${exercise.id}.png`: that fallback revives rejected assets or generates broken requests. Do not use another exercise photo as a fallback. A generic decorative icon is acceptable only as a clearly neutral placeholder, not an instructional photograph.

Apply this treatment to exercise cards, expanded image views, library rows and swap/search lists. This audit intentionally does not edit those components. Legacy persisted built-in exercise records should resolve current catalog image metadata by ID, rather than trusting cached image paths; custom exercises without images should also get the neutral state. Old cached/PWA assets must not override an unavailable catalog decision.

## Reproduce and maintain

```sh
npm run sync:exercise-images -- --check
npm run sync:exercise-images -- --contact-sheets
npm run sync:exercise-images -- --only=core_ab_wheel_rollout
npm test -- src/utils/imageUtil.test.js src/utils/imageUtil.integrity.test.js
```

- `--check` is offline: verifies complete catalog coverage, provenance, image hashes, PNG dimensions/size, uniqueness, and absence of unavailable assets.
- `--contact-sheets` first runs integrity checks, then writes six small sheets to ignored `node_modules/.cache/exercise-image-audit/review-{0,12,24,36,48,60}.png`. Numbered tiles follow the table below. Only open these small sheets for review, never the original assets.
- With no arguments, sync downloads and composes the 62 available entries; `--only=<id>` restores a single available entry. Each downloaded output must match the reviewed hash **before** replacing the local file. Network access to `raw.githubusercontent.com` is required only for downloads. Sync does not rewrite this ledger or turn unavailable entries into available ones.
- The upstream URL tracks `main`, but SHA-256 guards reviewed content: upstream changes or Sharp encoder/version differences fail closed and require small-sheet re-review before an intentional hash update. Do not bypass a hash mismatch just to make a sync pass. Keep catalog status/reason, manifest, this report and regression tests consistent when adding a genuinely reviewed replacement.

## Per-exercise decisions

The source column is the exact upstream exercise directory; append `/0.jpg` or `/1.jpg` under the source repository’s `exercises/` directory. “Unavailable” rows intentionally have no active source.

| # | Exercise ID | Name | Result | Source ID | Audit observation / reason |
| --- | --- | --- | --- | --- | --- |
| 1 | `chest_bb_flat_bench` | Barbell Bench Press | Available | `Barbell_Bench_Press_-_Medium_Grip` | Flat barbell bench press; bar and flat bench visible. |
| 2 | `chest_db_flat_press` | Flat Dumbbell Press | Available | `Dumbbell_Bench_Press` | Flat dumbbell press; paired dumbbells on flat bench. |
| 3 | `chest_bb_incline_press` | Incline Barbell Press | Available | `Barbell_Incline_Bench_Press_-_Medium_Grip` | Incline barbell press; inclined backrest and barbell. |
| 4 | `chest_db_incline_press` | Incline Dumbbell Press | Available | `Incline_Dumbbell_Press` | Incline dumbbell press; inclined bench and paired dumbbells. |
| 5 | `chest_machine_incline_press` | Incline Machine Press | Available | `Leverage_Incline_Chest_Press` | Replaced single frame with incline machine press start/finish; upward press path. |
| 6 | `chest_machine_flat_press` | Machine Chest Press | Available | `Leverage_Chest_Press` | Seated machine chest press start/finish. |
| 7 | `chest_bb_decline_press` | Decline Barbell Press | Available | `Decline_Barbell_Bench_Press` | Decline barbell bench press with secured legs. |
| 8 | `chest_db_decline_press` | Decline Dumbbell Press | Available | `Decline_Dumbbell_Bench_Press` | Decline dumbbell press on declined bench. |
| 9 | `chest_high_to_low_cable_fly` | High-to-Low Cable Fly | Available | `Cable_Crossover` | Replaced single frame with high-pulley crossover start/finish. |
| 10 | `chest_low_to_high_cable_fly` | Low-to-High Cable Fly | Available | `Low_Cable_Crossover` | Replaced single frame with low-pulley upward crossover start/finish. |
| 11 | `chest_pec_deck_fly` | Pec Deck Fly | Available | `Butterfly` | Replaced single frame with pec-deck fly start/finish. |
| 12 | `chest_dips` | Chest Dips | Available | `Dips_-_Chest_Version` | Parallel-bar chest dips with forward torso lean. |
| 13 | `back_wide_lat_pulldown` | Wide-Grip Lat Pulldown | Available | `Wide-Grip_Lat_Pulldown` | Wide overhand pulldown to front of torso. |
| 14 | `back_close_grip_pulldown` | Close-Grip V-Bar Pulldown | Available | `V-Bar_Pulldown` | Close neutral V-bar pulldown. |
| 15 | `back_pullups` | Pull-Ups | Available | `Pullups` | Overhand pull-up start/finish. |
| 16 | `back_bb_bent_over_row` | Barbell Bent-Over Row | Available | `Bent_Over_Barbell_Row` | Hip-hinged barbell row towards abdomen. |
| 17 | `back_tbar_row` | T-Bar Row | Available | `T-Bar_Row_with_Handle` | Landmine T-bar row with close handle; machine category includes this apparatus. |
| 18 | `back_seated_cable_row` | Seated Cable Row | Available | `Seated_Cable_Rows` | Seated cable row with foot supports. |
| 19 | `back_db_single_arm_row` | Single-Arm Dumbbell Row | Available | `One-Arm_Dumbbell_Row` | Bench-supported single-arm dumbbell row. |
| 20 | `back_chest_supported_row` | Chest-Supported Machine Row | Available | `Leverage_Iso_Row` | Replaced overhead-machine picture with chest-supported seated leverage row. |
| 21 | `back_straight_arm_pulldown` | Straight-Arm Cable Pulldown | Available | `Straight-Arm_Pulldown` | Standing straight-arm cable pulldown towards thighs. |
| 22 | `back_db_pullover` | Dumbbell Pullover | Available | `Bent-Arm_Dumbbell_Pullover` | Dumbbell pullover lying across bench. |
| 23 | `back_face_pulls` | Cable Face Pulls | Available | `Face_Pull` | Rope face pull with hands near face. |
| 24 | `back_hyperextension` | Hyperextension | Available | `Hyperextensions_Back_Extensions` | Roman-chair hip extension on angled support. |
| 25 | `sh_seated_db_press` | Seated Dumbbell Shoulder Press | Available | `Seated_Dumbbell_Press` | Seated, back-supported dumbbell overhead press. |
| 26 | `sh_standing_bb_ohp` | Overhead Barbell Press | Available | `Standing_Military_Press` | Standing barbell overhead press. |
| 27 | `sh_machine_shoulder_press` | Machine Shoulder Press | Available | `Machine_Shoulder_Military_Press` | Seated fixed-path shoulder-press machine. |
| 28 | `sh_arnold_press` | Arnold Press | Available | `Arnold_Dumbbell_Press` | Seated dumbbell press with palm rotation between frames. |
| 29 | `sh_db_lateral_raise` | Dumbbell Lateral Raise | Available | `Side_Lateral_Raise` | Standing dumbbell lateral raise. |
| 30 | `sh_cable_lateral_raise` | Cable Lateral Raise | **Unavailable** | — | Existing picture shows a seated bent-over rear-delt raise, not the described standing lateral raise with cable behind the legs. |
| 31 | `sh_machine_lateral_raise` | Machine Lateral Raise | **Unavailable** | — | Existing picture uses dumbbells, not a lateral-raise machine with forearm pads. |
| 32 | `sh_reverse_pec_deck` | Reverse Pec Deck Fly | Available | `Reverse_Machine_Flyes` | Reverse pec-deck fly facing machine. |
| 33 | `sh_bent_over_db_raise` | Bent-Over Rear Delt Raise | Available | `Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench` | Head-supported bent-over dumbbell rear-delt raise; support variant is visible. |
| 34 | `sh_cable_rear_delt_fly` | Cable Rear Delt Fly | **Unavailable** | — | Available source demonstrates an overhead-pulley variant, not the described chest-height cable setup. |
| 35 | `sh_db_shrugs` | Dumbbell Shrugs | Available | `Dumbbell_Shrug` | Standing dumbbell shoulder shrug. |
| 36 | `sh_bb_shrugs` | Barbell Shrugs | Available | `Barbell_Shrug` | Standing barbell shoulder shrug. |
| 37 | `leg_bb_back_squat` | Barbell Back Squat | Available | `Barbell_Squat` | Barbell back squat with bar on upper back. |
| 38 | `leg_hack_squat` | Hack Squat Machine | Available | `Hack_Squat` | Back-supported angled hack-squat machine. |
| 39 | `leg_45_press` | 45° Leg Press | Available | `Leg_Press` | Reclined sled leg press. |
| 40 | `leg_extension` | Seated Leg Extension | Available | `Leg_Extensions` | Seated leg-extension machine; knee-extension pad, not a leg press (rechecked against source pair). |
| 41 | `leg_bulgarian_split_squat` | Bulgarian Split Squat | Available | `Split_Squat_with_Dumbbells` | Rear-foot-elevated split squat with dumbbells. |
| 42 | `leg_walking_lunges` | Walking Dumbbell Lunges | **Unavailable** | — | Source demonstrates a forward lunge returning to the starting position, not walking lunges. |
| 43 | `leg_bb_rdl` | Barbell Romanian Deadlift | Available | `Romanian_Deadlift` | Barbell hip-hinge start/finish; source instructions specify slight knee bend and hips back. |
| 44 | `leg_db_rdl` | Dumbbell Romanian Deadlift | **Unavailable** | — | Existing picture uses a barbell. The dumbbell candidate is labeled stiff-legged deadlift; an exact dumbbell Romanian deadlift was not established. |
| 45 | `leg_lying_curl` | Lying Leg Curl | Available | `Lying_Leg_Curls` | Prone machine leg curl on angled pad. |
| 46 | `leg_seated_curl` | Seated Leg Curl | Available | `Seated_Leg_Curl` | Seated machine leg curl with thigh restraint. |
| 47 | `leg_standing_calf_raise` | Standing Calf Raise | Available | `Standing_Calf_Raises` | Replaced dumbbell calf raise with shoulder-pad standing calf machine start/finish. |
| 48 | `leg_seated_calf_raise` | Seated Calf Raise | Available | `Seated_Calf_Raise` | Seated loaded calf machine with bent knees. |
| 49 | `arm_bb_bicep_curl` | Barbell Bicep Curl | Available | `Barbell_Curl` | Standing underhand barbell curl. |
| 50 | `arm_db_incline_curl` | Incline Dumbbell Curl | Available | `Incline_Dumbbell_Curl` | Incline-bench dumbbell curl. |
| 51 | `arm_preacher_curl` | EZ-Bar Preacher Curl | Available | `Preacher_Curl` | Preacher-pad curl with angled/EZ bar. |
| 52 | `arm_db_hammer_curl` | Dumbbell Hammer Curl | Available | `Alternate_Hammer_Curl` | Alternating neutral-grip dumbbell hammer curl. |
| 53 | `arm_cable_rope_curl` | Cable Rope Hammer Curl | Available | `Cable_Hammer_Curls_-_Rope_Attachment` | Replaced single frame with rope cable hammer-curl start/finish. |
| 54 | `arm_concentration_curl` | Concentration Dumbbell Curl | Available | `Concentration_Curls` | Seated concentration curl with upper arm supported on thigh. |
| 55 | `arm_rope_pushdown` | Tricep Rope Pushdown | Available | `Triceps_Pushdown_-_Rope_Attachment` | Rope triceps pushdown at high cable. |
| 56 | `arm_straight_bar_pushdown` | Straight-Bar Tricep Pushdown | Available | `Triceps_Pushdown` | Replaced single frame with straight-bar cable pushdown start/finish. |
| 57 | `arm_ez_skull_crushers` | EZ-Bar Skull Crushers | Available | `EZ-Bar_Skullcrusher` | Supine EZ-bar elbow extension/skull crusher. |
| 58 | `arm_overhead_cable_ext` | Overhead Cable Triceps Extension | Available | `Triceps_Overhead_Extension_with_Rope` | Overhead rope cable elbow extension. |
| 59 | `arm_db_overhead_ext` | Single-Arm DB Overhead Extension | Available | `Standing_One-Arm_Dumbbell_Triceps_Extension` | Replaced single frame with one-arm dumbbell overhead extension start/finish. |
| 60 | `arm_close_grip_bench` | Close-Grip Bench Press | Available | `Close-Grip_Barbell_Bench_Press` | Narrow-grip barbell bench press. |
| 61 | `core_hanging_leg_raise` | Hanging Leg Raise | Available | `Hanging_Leg_Raise` | Hanging leg raise from overhead bar. |
| 62 | `core_captain_chair_raise` | Captain’s Chair Knee Raise | Available | `Knee_Hip_Raise_On_Parallel_Bars` | Replaced hanging-bar picture with forearm-pad captain-chair knee raise start/finish. |
| 63 | `core_cable_kneeling_crunch` | Kneeling Cable Crunch | Available | `Cable_Crunch` | Kneeling rope cable crunch. |
| 64 | `core_decline_crunch` | Decline Bench Crunch | Available | `Decline_Crunch` | Decline bench crunch with feet secured. |
| 65 | `core_weighted_plank` | Weighted Plank | **Unavailable** | — | Existing picture is a kneeling plate exercise, not a plank with a plate on the back. |
| 66 | `core_side_plank` | Side Plank | **Unavailable** | — | Existing picture and replacement candidate show bent-knee side bridges, not the described straight-leg side plank on the side of the foot. |
| 67 | `core_ab_wheel_rollout` | Ab Wheel Rollout | Available | `Ab_Roller` | Replaced barbell rollout with actual ab-wheel/roller start/finish. |
| 68 | `core_russian_twist` | Russian Twists | **Unavailable** | — | Existing source appears supine and does not establish the described seated, feet-elevated dumbbell twist. Plate-twist candidate is also unsuitable. |
| 69 | `core_woodchopper` | Cable Woodchopper | Available | `Standing_Cable_Wood_Chop` | High-to-low standing cable wood chop; completed second frame instead of single overhead pose. |
| 70 | `core_lying_leg_raise` | Lying Floor Leg Raise | **Unavailable** | — | Existing picture uses a bench, not the floor with lower back pressed down as described. |
| 71 | `core_bicycle_crunches` | Bicycle Crunches | Available | `Air_Bike` | Replaced single ambiguous pose with air-bike alternating elbow-to-knee sequence. |
| 72 | `core_hollow_body_hold` | Hollow Body Hold | **Unavailable** | — | Existing picture shows near-vertical limbs, not the described extended hollow-body position. |
