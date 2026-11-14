// ── Audio Utility: shared AudioContext with mobile/WebView autoplay unlock ──
// Mobile browsers and WebViews suspend AudioContext creation until the user
// interacts with the page. We create the context once and "unlock" it on the
// first user gesture, then reuse it for all chimes (rest timer, hydration,
// notifications). If the device is muted / silent, oscillator playback simply
// produces no audible output — vibration feedback covers that case.

let sharedContext = null;
let unlockListenerAttached = false;

const getSharedContext = () => {
  if (typeof window === "undefined") return null;
  if (!sharedContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      sharedContext = new Ctx();
    } catch {
      return null;
    }
    attachUnlock();
  }
  // Browsers suspend contexts that were created without a gesture; resume on
  // every playback attempt — resume() is a no-op when already running.
  if (sharedContext.state === "suspended") {
    try {
      sharedContext.resume();
    } catch {
      /* resume may be rejected before unlock — handled silently */
    }
  }
  return sharedContext;
};

const unlock = () => {
  const ctx = getSharedContext();
  if (ctx && ctx.state === "suspended") {
    try {
      ctx.resume();
    } catch {
      /* ignore */
    }
  }
};

function attachUnlock() {
  if (unlockListenerAttached || typeof document === "undefined") return;
  unlockListenerAttached = true;
  // First tap/press anywhere unlocks playback for the whole session.
  const events = ["pointerdown", "touchend", "keydown"];
  events.forEach((type) =>
    document.addEventListener(
      type,
      unlock,
      { once: false, passive: true },
    ),
  );
}

/**
 * Play a short sine tone on the shared (unlocked) AudioContext.
 * Gracefully no-ops when audio is unavailable, suspended, or the device is muted.
 */
export const playTone = (freq, startTimeOffset = 0, duration = 0.3, peak = 0.25) => {
  const ctx = getSharedContext();
  if (!ctx) return;
  try {
    const start = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.start(start);
    osc.stop(start + duration);
  } catch {
    /* playback failure is non-fatal */
  }
};

/** Prefetch/unlock the audio context early (e.g., on app mount). */
export const primeAudio = () => {
  getSharedContext();
};

/** Two-tone completion chime (rest timer). */
export const playRestCompleteChime = () => {
  playTone(880, 0, 0.5, 0.1); // glide handled by caller if needed
};

/** Gentle two-tone water chime (hydration). */
export const playHydrationChime = () => {
  playTone(783.99, 0, 0.22, 0.18); // G5
  playTone(1046.5, 0.14, 0.3, 0.18); // C6
};

/** Pleasant two-tone notification chime (reminders). */
export const playNotificationChime = () => {
  playTone(587.33, 0, 0.25, 0.3); // D5
  playTone(880, 0.18, 0.35, 0.25); // A5
};
