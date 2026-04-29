import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-soft border-b border-gray-100' : 'bg-white'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-shadow duration-300">
  <span className="text-white font-bold text-lg">TF</span>
</div>
            <span className="text-xl font-bold text-primary-500 hidden sm:inline transition-colors group-hover:text-accent-500">
              TaxFlow Pro
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/#home" 
              className="text-gray-700 hover:text-primary-500 transition-colors duration-300 font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/#services" 
              className="text-gray-700 hover:text-primary-500 transition-colors duration-300 font-medium relative group"
            >
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/#pricing" 
              className="text-gray-700 hover:text-primary-500 transition-colors duration-300 font-medium relative group"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/#about" 
              className="text-gray-700 hover:text-primary-500 transition-colors duration-300 font-medium relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Trust Badge - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 border border-accent-200">
            <Shield size={16} className="text-accent-500" />
            <span className="text-xs font-semibold text-accent-600">ISO Certified • 10K+ Trusted</span>
          </div>

          {/* Auth Links */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-5 py-2 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all duration-300"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-5 py-2 text-sm font-semibold text-primary-500 border-2 border-primary-500 rounded-xl hover:bg-primary-50 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2.5 text-sm font-semibold text-primary-500 border-2 border-primary-500 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:border-primary-600"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 text-sm font-semibold text-primary-500 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl hover:shadow-soft-lg hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={24} className="text-primary-500" />
            ) : (
              <Menu size={24} className="text-primary-500" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 border-t border-gray-200 pt-4 animate-slide-down">
            <Link to="/#home" className="block text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Home
            </Link>
            <Link to="/#services" className="block text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Services
            </Link>
            <Link to="/#pricing" className="block text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Pricing
            </Link>
            <Link to="/#about" className="block text-gray-700 hover:text-primary-500 font-medium transition-colors">
              About
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  {role === 'admin' && (
                    <Link to="/admin" className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="block text-center px-4 py-2.5 text-sm font-semibold text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-center px-4 py-2.5 text-sm font-semibold text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="block text-center px-4 py-2.5 text-sm font-semibold text-primary-500 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg hover:shadow-soft-lg transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
