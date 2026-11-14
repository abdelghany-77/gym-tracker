import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initStatusBar, ensureNotificationChannel } from './utils/nativeBridge'

// Initialize native platform integrations (status bar style, Android notification channel)
void initStatusBar();
void ensureNotificationChannel();

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
