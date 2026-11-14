// ── Haptic Feedback Utility ──
// Native (Capacitor): routes through @capacitor/haptics plugin for crisp tactile feedback.
// Web/PWA: falls back to navigator.vibrate() (Android Chrome; silently no-ops on iOS/desktop).

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export const haptics = {
  /** Light tap — completing a set, toggling items */
  light: () => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      return;
    }
    try {
      navigator.vibrate?.(10);
    } catch {
      /* unsupported */
    }
  },

  /** Medium tap — adding water cup, confirming actions, swapping exercises */
  medium: () => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      return;
    }
    try {
      navigator.vibrate?.(25);
    } catch {
      /* unsupported */
    }
  },

  /** Success pattern — finishing workout, hitting PR */
  success: () => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      return;
    }
    try {
      navigator.vibrate?.([50, 30, 50]);
    } catch {
      /* unsupported */
    }
  },

  /** Warning pattern — timer complete, alerts */
  warning: () => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
      return;
    }
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* unsupported */
    }
  },

  /** Heavy — delete/clear actions */
  heavy: () => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
      return;
    }
    try {
      navigator.vibrate?.(50);
    } catch {
      /* unsupported */
    }
  },
};
