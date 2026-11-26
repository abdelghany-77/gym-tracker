import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

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
      injectRegister: false,
      includeAssets: ["icon.png", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: "./",
        name: "GymTracker",
        short_name: "GymTracker",
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
        importScripts: ["sw-notifications.js"],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,webp,svg,jpg,jpeg}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Dedicated Range-request aware offline cache for verified movement MP4 videos
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.includes("/media/videos/"),
            handler: "CacheFirst",
            options: {
              cacheName: "gym-videos-v1",
              rangeRequests: true,
              cacheableResponse: {
                statuses: [0, 200, 206],
              },
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            // Same-origin app assets cached for offline resilience
            urlPattern: ({ url }) =>
              url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "gym-cache-v4",
              expiration: {
                maxEntries: 200,
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
