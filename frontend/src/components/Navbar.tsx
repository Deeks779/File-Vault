import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../content/AuthContext';
import { QueueListIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout,role } = useAuth(); 
  const navigate = useNavigate();

  const activeLinkStyle = {
    color: '#4F46E5', 
    fontWeight: '600',
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false); 
    navigate('/');
  };

  const navLinkClass = "text-gray-600 hover:text-indigo-600 transition-colors";

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Brand/Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <QueueListIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-800">File-Vault</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          {isLoggedIn && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              <NavLink to="/" className={navLinkClass} style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Public Files</NavLink>
              <NavLink to="/dashboard" className={navLinkClass} style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>My Files</NavLink>
              <NavLink to="/profile" className={navLinkClass} style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>My Profile</NavLink>
              {role==="admin" && (
              <NavLink to="/admin" className={navLinkClass} style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Admin Panel</NavLink>
              )
              }
            </div>
          )}

          {/* Right Side: Desktop Action Button */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu*/}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLoggedIn ? (
            // --- Logged-in Mobile Menu ---
            <>
              <NavLink to="/" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} onClick={() => setIsOpen(false)}>Public Files</NavLink>
              <NavLink to="/dashboard" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} onClick={() => setIsOpen(false)}>My Files</NavLink>
              <NavLink to="/profile" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} onClick={() => setIsOpen(false)}>My Profile</NavLink>
              {role==="admin" && (
              <NavLink to="/admin" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Admin Panel</NavLink>
              )
              }
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-red-600 transition-all duration-200 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            // --- Guest Mobile Menu ---
            <>
              <NavLink to="/" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} onClick={() => setIsOpen(false)}>Public Files</NavLink>
              <Link to="/login" className="w-full text-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 block mt-2" onClick={() => setIsOpen(false)}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;