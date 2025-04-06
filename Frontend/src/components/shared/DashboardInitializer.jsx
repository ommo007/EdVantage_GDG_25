import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
//import { isValidRole, getDashboardPath } from '../../services/RoleManager';

/**
 * This component handles initial dashboard validation and routing.
 * It ensures users are in the dashboard that matches their role.
 */
const DashboardInitializer = ({ expectedRole, children }) => {
  const { currentUser, userRole, loading } = useAuth();
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Skip if still loading auth state
    if (loading) return;

    /* Mock Implementation: Allow all roles for testing */
    console.log("Mock Implementation: Skipping role validation for testing.");
    setVerified(true);
    return;

    /* Firebase Implementation: Uncomment this block for actual role validation
    // If no user, ProtectedRoute will handle this
    if (!currentUser) return;

    // Verify role matches the expected role for this dashboard
    if (userRole && expectedRole && userRole !== expectedRole) {
      console.warn(
        `Role mismatch: User has role "${userRole}" but is accessing "${expectedRole}" dashboard`
      );

      // Redirect them to their correct dashboard if role is valid
      if (isValidRole(userRole)) {
        console.log(`Redirecting to proper dashboard: /${userRole}`);
        navigate(getDashboardPath(userRole), { replace: true });
        return;
      }
    }

    // Role matches expected role, consider verification complete
    setVerified(true);
    */
  }, [currentUser, userRole, expectedRole, loading, navigate]);

  // Show minimal loading UI while verifying
  if (!verified && expectedRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Render children when verification passes or no role enforcement
  return children;
};

export default DashboardInitializer;