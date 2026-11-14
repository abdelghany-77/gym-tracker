import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// JDK 21 downloaded and provisioned
const JAVA_HOME = "C:\\Users\\محمداحمدعبدالغنىاحمد\\.gradle\\jdks\\eclipse_adoptium-21-amd64-windows.2";
const ANDROID_HOME = "D:\\AndroidToolchain\\sdk";

const env = {
  ...process.env,
  JAVA_HOME,
  ANDROID_HOME,
  PATH: `${path.join(JAVA_HOME, "bin")};${process.env.PATH}`,
};

console.log("Stopping previous Gradle daemons...");
const gradlew = path.resolve("android/gradlew.bat");
spawnSync(gradlew, ["--stop"], {
  cwd: path.resolve("android"),
  env,
  stdio: "inherit",
  shell: true,
});

console.log("\nStarting Gradle assembleDebug with JDK 21...");
console.log("JAVA_HOME:", JAVA_HOME);
console.log("ANDROID_HOME:", ANDROID_HOME);

const result = spawnSync(gradlew, ["assembleDebug"], {
  cwd: path.resolve("android"),
  env,
  stdio: "inherit",
  shell: true,
});

if (result.status === 0) {
  const apkPath = path.resolve("android/app/build/outputs/apk/debug/app-debug.apk");
  if (fs.existsSync(apkPath)) {
    const stats = fs.statSync(apkPath);
    console.log("\n=======================================================");
    console.log("🎉 APK GENERATED SUCCESSFULLY!");
    console.log("File:", apkPath);
    console.log("Size:", (stats.size / (1024 * 1024)).toFixed(2), "MB");
    console.log("=======================================================\n");
  } else {
    console.log("Gradle succeeded, but APK was not found at standard path.");
  }
} else {
  console.error("Gradle build failed with status code:", result.status);
  process.exit(result.status ?? 1);
}
