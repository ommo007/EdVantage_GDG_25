import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize Sentry as early as possible
Sentry.init({
  dsn: "https://cba4a8144cc01c7b17bd22983d878399@o4508795242414080.ingest.us.sentry.io/4509370440155136",
  // Setting this option to true will send default PII data to Sentry
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/edvantage-gdg-25\.onrender\.com\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
  replaysOnErrorSampleRate: 1.0 // 100% of sessions with errors will be recorded
});

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  Sentry.captureException(event.error);
});

// Add unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  Sentry.captureException(event.reason);
});

// Log initial render for debugging
console.log('Starting application render...');
console.log("Starting React application...");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log("React application rendered.");