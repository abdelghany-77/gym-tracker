import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initStatusBar, ensureNotificationChannel, isNative } from './utils/nativeBridge'

// Initialize native platform integrations (status bar style, Android notification channel)
void initStatusBar();
void ensureNotificationChannel();

// Service Worker management:
// - On Capacitor native shells, assets are bundled inside the APK. Unregister any stale
//   Workbox SW/caches from older APKs so upgrades immediately load the latest exercise catalog.
// - On web/PWA production builds, register ./sw.js normally for offline support.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (isNative()) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    void (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
        if ('caches' in window) {
          const cacheKeys = await window.caches.keys();
          await Promise.all(
            cacheKeys
              .filter(
                (key) =>
                  key.startsWith('workbox-') ||
                  key.startsWith('gym-cache-') ||
                  key.startsWith('gym-videos-'),
              )
              .map((key) => window.caches.delete(key)),
          );
        }
        if (
          hadController &&
          registrations.length > 0 &&
          !sessionStorage.getItem('gym_native_sw_reset')
        ) {
          sessionStorage.setItem('gym_native_sw_reset', '1');
          window.location.reload();
        }
      } catch (err) {
        console.warn('Native service worker cleanup skipped:', err);
      }
    })();
  } else if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    });
  }
}

// Initialize theme from localStorage (item 13)
const savedTheme = (() => {
  try {
    const t = localStorage.getItem('gym_theme');
    return t ? JSON.parse(t) : 'dark';
  } catch { return 'dark'; }
})();
document.documentElement.setAttribute('data-theme', savedTheme);

// Disable pinch-to-zoom gestures (especially on iOS Safari)
if (typeof window !== 'undefined') {
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
