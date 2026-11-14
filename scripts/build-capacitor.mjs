// Cross-platform Capacitor build: sets CAPACITOR_BUILD=1 so Vite emits a
// relative-base bundle that works inside the native WebView (https://localhost).
import { spawnSync } from "node:child_process";

process.env.CAPACITOR_BUILD = "1";
const result = spawnSync("npx", ["vite", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(result.status ?? 1);
