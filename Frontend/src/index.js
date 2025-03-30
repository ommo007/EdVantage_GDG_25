import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Debug from './Debug';

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Log initial render for debugging
console.log('Starting application render...');
console.log("Starting React application...");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Debug>
      <App />
    </Debug>
  </React.StrictMode>
);

console.log("React application rendered.");
