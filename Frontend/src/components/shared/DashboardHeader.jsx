import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Settings,
  Home,
  BookOpen,
  Users as UsersIcon,
  Calendar,
  BookOpenText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

const DashboardHeader = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };

  // Define navigation links based on user role
  const navLinks = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: <Home size={18} /> },
      { name: 'Classes', path: '/admin/classes', icon: <BookOpen size={18} /> },
      { name: 'Users', path: '/admin/users', icon: <UsersIcon size={18} /> },
      { name: 'Reports', path: '/admin/reports', icon: <Calendar size={18} /> },
    ],
    instructor: [
      { name: 'Dashboard', path: '/instructor', icon: <Home size={18} /> },
      { name: 'Classes', path: '/instructor/classes', icon: <BookOpen size={18} /> },
      { name: 'Students', path: '/instructor/students', icon: <UsersIcon size={18} /> },
      { name: 'Materials', path: '/instructor/materials', icon: <BookOpenText size={18} /> },
    ],
    student: [
      { name: 'Dashboard', path: '/student', icon: <Home size={18} /> },
      { name: 'Classes', path: '/student/classes', icon: <BookOpen size={18} /> },
      { name: 'Study Space', path: '/study', icon: <BookOpenText size={18} /> },
      { name: 'Calendar', path: '/student/calendar', icon: <Calendar size={18} /> },
    ],
  };

  // Get the appropriate links based on role
  const links = navLinks[userRole] || navLinks.student;

  return (
    <header className="bg-white border-b border-indigo-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
         

          {/* Right Side - User Menu & Notifications */}
          <div className="flex items-center space-x-4">
           

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {currentUser?.displayName?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {currentUser?.displayName || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
                </span>
                <ChevronDown size={16} className="ml-1" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="inline mr-2" size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="inline mr-2" size={16} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="inline mr-2" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white py-4 px-4 border-t border-indigo-100">
          <div className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
            <div className="border-t border-indigo-100 my-2 pt-2">
              <Link
                to="/profile"
                className="flex items-center text-sm font-medium px-3 py-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                <span className="ml-2">Profile</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full text-left text-sm font-medium px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
