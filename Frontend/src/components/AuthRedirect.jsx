import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isValidRole, getDashboardPath, getDefaultRole } from '../services/RoleManager';

const AuthRedirect = () => {
  const { currentUser, userRole, authRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log("AuthRedirect: User role detected:", userRole);

    // Prevent infinite redirect loops
    if (redirectAttempted) return;

    // Function to determine and execute the redirect
    const executeRedirect = () => {
      // If not authenticated, go to login
      if (!currentUser) {
        console.log("No authenticated user, redirecting to login");
        navigate('/login', { replace: true });
        setRedirectAttempted(true);
        return;
      }

      // Priority order for redirect path
      let redirectPath = '/login'; // Default fallback

      // 1. Explicit auth redirect from context (highest priority)
      if (authRedirect) {
        redirectPath = authRedirect;
        console.log(`Using explicit authRedirect: ${redirectPath}`);
      }
      // 2. From location state
      else if (location.state?.from) {
        redirectPath = location.state.from;
        console.log(`Using location state path: ${redirectPath}`);
      }
      // 3. Based on user role from context or localStorage
      else if (userRole) {
        if (isValidRole(userRole)) {
          redirectPath = `/${userRole}`;
          console.log(`Using role-based path for ${userRole}: ${redirectPath}`);
        } else {
          console.warn(`Invalid role detected: ${userRole}, using default role`);
          redirectPath = `/${getDefaultRole()}`;
        }
      } else {
        // 4. Fallback to stored role in localStorage as last resort
        const storedRole = localStorage.getItem('userRole');
        if (storedRole && isValidRole(storedRole)) {
          redirectPath = `/${storedRole}`;
          console.log(`Using localStorage role: ${storedRole}`);
        }
      }

      console.log(`Executing redirect to: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
      setRedirectAttempted(true);
    };

    // Execute immediately - don't wait
    executeRedirect();
  }, [currentUser, userRole, authRedirect, location.state, navigate, redirectAttempted]);

  // Show loading UI
  return (
    <div className="flex items-center justify-center h-screen bg-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-indigo-600">Redirecting to your dashboard...</p>
        <p className="text-sm text-indigo-400 mt-2">
          {userRole ? `Detected role: ${userRole}` : "Verifying your account..."}
        </p>
      </div>
    </div>
  );
};

export default AuthRedirect;
