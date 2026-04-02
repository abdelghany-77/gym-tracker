// ── Haptic Feedback Utility ──
// Uses navigator.vibrate() on supported devices (Android Chrome, etc.)
// Silently no-ops on unsupported devices (iOS, desktop)

export const haptics = {
  /** Light tap — completing a set, toggling items */
  light: () => {
    try { navigator.vibrate?.(10); } catch { /* unsupported */ }
  },

  /** Medium tap — adding water cup, confirming actions */
  medium: () => {
    try { navigator.vibrate?.(25); } catch { /* unsupported */ }
  },

  /** Success pattern — finishing workout, hitting PR */
  success: () => {
    try { navigator.vibrate?.([50, 30, 50]); } catch { /* unsupported */ }
  },

  /** Warning pattern — timer complete, alerts */
  warning: () => {
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* unsupported */ }
  },

  /** Heavy — delete/clear actions */
  heavy: () => {
    try { navigator.vibrate?.(50); } catch { /* unsupported */ }
  },
};
