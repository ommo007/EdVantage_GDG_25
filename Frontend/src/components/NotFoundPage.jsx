"use client"
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-indigo-600 mb-2">404</h1>
          <div className="w-16 h-1 bg-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Page Not Found</h2>
          <p className="text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <div className="flex items-center space-x-2 justify-center">
          <div className="text-xl font-bold text-indigo-700">
            Edva<span className="text-purple-600">ntage</span>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Need help? <a href="#" className="text-indigo-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;