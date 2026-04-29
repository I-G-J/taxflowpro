import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, FileText, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AccountantSidebar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/accountant' },
    { icon: Users, label: 'Assigned Clients', path: '/accountant/clients' },
    { icon: FileText, label: 'Documents', path: '/accountant/documents' },
    { icon: MessageSquare, label: 'Chat', path: '/accountant/chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-primary-500 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-primary-500 text-white transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } z-30 md:z-0`}>
        <div className="p-6">
          <Link to="/accountant" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-500 font-bold">TF</span>
            </div>
            <span className="text-xl font-bold">TaxFlow</span>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={`${item.label}-${index}`}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white text-primary-500 font-semibold'
                    : 'text-white hover:bg-primary-600'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-primary-600 mt-8 pt-8">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-primary-600 transition-all duration-300 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default AccountantSidebar;
