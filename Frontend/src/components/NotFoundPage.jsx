"use client"
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-md border border-indigo-100 max-w-md">
        <h1 className="text-6xl font-bold text-indigo-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Page Not Found</h2>
        <p className="text-indigo-600 mb-6">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;