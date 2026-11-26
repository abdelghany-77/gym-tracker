import type { CapacitorConfig } from "@capacitor/cli";

// ── Capacitor native configuration ──
// Web assets are built with `npm run build:capacitor` (relative base "./")
// so everything resolves inside the WebView at https://localhost.
const config: CapacitorConfig = {
  appId: "com.abdelghany.gymtracker",
  appName: "Gym Tracker",
  webDir: "dist",
  // Serve the bundle from https://localhost so service worker / fetch semantics
  // match the PWA build (no http://localhost insecure context).
  server: {
    androidScheme: "https",
  },
  android: {
    // Dark theme launch background is set in android/app/src/main/res/values/styles.xml
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
      style: "DARK",
    },
    // Dark, icon-centered splash so there is no white flash on cold launch.
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#0B0F17",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // JS-side styling via nativeBridge.initStatusBar() (Style.Dark + bg #0B0F17)
      backgroundColor: "#0B0F17",
      style: "DARK",
    },
    LocalNotifications: {
      // Icon shown in the Android status bar for rest/hydration alerts
      smallIcon: "ic_launcher",
      iconColor: "#06B6D4",
    },
  },
};

export default config;
