import React, { useState, useEffect } from 'react';

// Simple component to render at the root level for debugging
// Add ?debug=true to the URL to show the debug panel
const Debug = ({ children }) => {
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Check if debug mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    setShowDebug(debugParam === 'true');

    // Intercept console logs for debugging
    if (debugParam === 'true') {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      console.log = (...args) => {
        setLogs(prev => [...prev, { type: 'log', message: args.join(' '), time: new Date() }]);
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        setLogs(prev => [...prev, { type: 'error', message: args.join(' '), time: new Date() }]);
        originalConsoleError(...args);
      };

      console.warn = (...args) => {
        setLogs(prev => [...prev, { type: 'warn', message: args.join(' '), time: new Date() }]);
        originalConsoleWarn(...args);
      };

      return () => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    }
  }, []);

  if (!showDebug) return children;

  return (
    <div className="relative">
      {children}
      
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-black bg-opacity-80 text-white overflow-auto z-50 p-4 text-xs font-mono">
        <div className="flex justify-between mb-2">
          <h3>Debug Console</h3>
          <button 
            onClick={() => setLogs([])}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
          >
            Clear
          </button>
        </div>
        <div>
          {logs.map((log, i) => (
            <div
              key={i}
              className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'warn' ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              [{log.time.toISOString().slice(11, 19)}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Debug;
