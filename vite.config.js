import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import process from "node:process";

// ── Base path strategy ──
// Relative base "./" ensures all bundled JS, CSS, local exercise images,
// and audio files resolve cleanly inside Capacitor's local WebView (https://localhost)
// as well as in GitHub Pages with HashRouter.
const BASE = "./";

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.png", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Gym",
        short_name: "Gym",
        description:
          "Track your hypertrophy journey with biomechanically complete programs",
        start_url: BASE,
        scope: BASE,
        theme_color: "#0B0F17",
        background_color: "#0B0F17",
        display: "standalone",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Same-origin app assets cached for offline resilience
            urlPattern: ({ url }) =>
              url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "gym-cache-v3",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
