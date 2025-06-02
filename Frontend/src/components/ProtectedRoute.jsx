import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // If no specific role required, just check authentication
        if (!requiredRole) {
          setIsLoading(false);
          return;
        }

        // Get user role from database
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("role_id")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) {
          console.error("Failed to fetch user role:", profileError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Map role_id to role names
        const roleMap = {
          1: 'admin',
          2: 'instructor', 
          3: 'student'
        };

        const roleName = roleMap[profileData.role_id];
        setUserRole(roleName);

      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If specific role required, check role match
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = userRole ? `/${userRole}` : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has correct role (or no role required)
  return children;
};

export default ProtectedRoute;
