import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

const DashboardHeader = ({ userRole }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, currentUser, userProfile } = useAuth();
  
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const displayName = currentUser?.displayName || userProfile?.displayName || displayRole;
  
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-indigo-100 h-14">
      <nav className="container mx-auto px-4 h-full flex justify-between items-center">
        <Logo />
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition duration-300"
          >
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover border border-indigo-200"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span>{displayName}</span>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
              {displayRole}
            </span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-indigo-100">
              <Link 
                to="/profile"
                className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <User className="inline-block w-4 h-4 mr-2" />
                Profile
              </Link>
              <button className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100">
                <Settings className="inline-block w-4 h-4 mr-2" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-100"
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;
