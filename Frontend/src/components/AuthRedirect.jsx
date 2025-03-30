import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessAnimation from './ui/SuccessAnimation';
import Logo from './Logo';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, loading } = useAuth();
  const [status, setStatus] = useState('Checking authentication status...');
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    console.log("AuthRedirect: currentUser=", !!currentUser, "userRole=", userRole, "loading=", loading);
    
    if (!loading) {
      if (currentUser) {
        // Determine the correct dashboard based on userRole
        let targetPath = '/student'; // Default fallback
        
        if (userRole === 'admin') {
          targetPath = '/admin';
        } else if (userRole === 'instructor') {
          targetPath = '/instructor';
        } else if (userRole === 'student') {
          targetPath = '/student';
        }
        
        setRedirectPath(targetPath);
        setStatus(`Welcome ${currentUser.displayName || ''}!`);
        setShowSuccess(true);
        
        // Short delay for better user experience
        const redirectTimer = setTimeout(() => {
          console.log("Redirecting to:", targetPath);
          navigate(targetPath);
        }, 2000);
        
        return () => clearTimeout(redirectTimer);
      } else {
        setStatus('Please log in to continue');
        
        // Short delay before redirecting to login
        const loginTimer = setTimeout(() => {
          console.log("No user, redirecting to login");
          navigate('/login');
        }, 1000);
        
        return () => clearTimeout(loginTimer);
      }
    }
  }, [currentUser, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        
        <div className="text-center p-8 bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
          {showSuccess ? (
            <>
              <SuccessAnimation />
              <h2 className="text-2xl font-semibold text-indigo-900 mt-6 mb-2">
                {status}
              </h2>
              <p className="text-indigo-600">
                Redirecting you to your dashboard...
              </p>
              
              {redirectPath && (
                <div className="mt-2 text-sm text-indigo-400">
                  Going to: {redirectPath}
                </div>
              )}
              
              <div className="mt-8 flex justify-center space-x-2">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.0s]"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">
                {status}
              </h2>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthRedirect;
