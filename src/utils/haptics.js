// ── Haptic Feedback Utility ──
// Native (Capacitor): routes through the @capacitor/haptics plugin for crisp,
// system-managed tactile feedback. Web/PWA: falls back to navigator.vibrate()
// (Android Chrome; silently no-ops on iOS/desktop).

import { isNative } from "./nativeBridge";

const native = (method, options) => {
  if (!isNative()) return false;
  const Haptics = window.Capacitor?.Plugins?.Haptics;
  if (!Haptics?.[method]) return false;
  try {
    void Haptics[method](options);
    return true;
  } catch {
    return false;
  }
};

export const haptics = {
  /** Light tap — completing a set, toggling items */
  light: () => {
    if (native("impact", { style: "LIGHT" })) return;
    try { navigator.vibrate?.(10); } catch { /* unsupported */ }
  },

  /** Medium tap — adding water cup, confirming actions, swapping exercises */
  medium: () => {
    if (native("impact", { style: "MEDIUM" })) return;
    try { navigator.vibrate?.(25); } catch { /* unsupported */ }
  },

  /** Success pattern — finishing workout, hitting PR */
  success: () => {
    if (native("notification", { type: "SUCCESS" })) return;
    try { navigator.vibrate?.([50, 30, 50]); } catch { /* unsupported */ }
  },

  /** Warning pattern — timer complete, alerts */
  warning: () => {
    if (native("notification", { type: "WARNING" })) return;
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* unsupported */ }
  },

  /** Heavy — delete/clear actions */
  heavy: () => {
    if (native("impact", { style: "HEAVY" })) return;
    try { navigator.vibrate?.(50); } catch { /* unsupported */ }
  },
};
