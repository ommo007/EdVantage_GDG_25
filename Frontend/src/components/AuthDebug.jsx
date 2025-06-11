import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const authContext = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase auth
        const { data: { user }, error } = await supabase.auth.getUser();
        setSupabaseUser(user);
        setSupabaseError(error);

        // Get user profile if user exists
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (!profileError) {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        setSupabaseError(err);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🔍 Auth Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Supabase Auth:</strong>
          <div className="ml-2">
            {supabaseError ? (
              <span className="text-red-600">❌ Error: {supabaseError.message}</span>
            ) : supabaseUser ? (
              <span className="text-green-600">✅ Authenticated</span>
            ) : (
              <span className="text-yellow-600">⚠️ No user</span>
            )}
          </div>
          {supabaseUser && (
            <div className="ml-2 text-xs text-gray-600">
              ID: {supabaseUser.id}<br/>
              Email: {supabaseUser.email}
            </div>
          )}
        </div>

        <div>
          <strong>Context Auth:</strong>
          <div className="ml-2">
            {authContext.isAuthenticated ? (
              <span className="text-green-600">✅ Authenticated</span>
            ) : (
              <span className="text-red-600">❌ Not authenticated</span>
            )}
          </div>
          {authContext.currentUser && (
            <div className="ml-2 text-xs text-gray-600">
              Role: {authContext.userRole || 'Unknown'}
            </div>
          )}
        </div>

        {userProfile && (
          <div>
            <strong>User Profile:</strong>
            <div className="ml-2 text-xs text-gray-600">
              Name: {userProfile.first_name} {userProfile.last_name}<br/>
              Role ID: {userProfile.role_id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug; 