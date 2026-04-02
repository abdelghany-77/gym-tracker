import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Initialize theme from localStorage (item 13)
const savedTheme = (() => {
  try {
    const t = localStorage.getItem('gym_theme');
    return t ? JSON.parse(t) : 'dark';
  } catch { return 'dark'; }
})();
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
