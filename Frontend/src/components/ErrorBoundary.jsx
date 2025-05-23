import React from 'react';
import * as Sentry from '@sentry/react';

// Using Sentry's ErrorBoundary to automatically capture React errors
const ErrorBoundary = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Something went wrong</h2>
            <p className="text-indigo-600 mb-6">The application has encountered an unexpected error.</p>
            
            <div className="bg-gray-50 p-4 rounded-md text-left mb-4 overflow-auto max-h-32">
              <p className="text-red-600 font-mono text-sm">{error?.toString()}</p>
            </div>
            
            <button
              onClick={resetError}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundary;
