import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Users, MessageSquare, Plus, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const managerNavItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/team', icon: Users, label: 'Team Members' },
    { path: '/feedback/new', icon: Plus, label: 'Give Feedback' },
    { path: '/feedback/history', icon: Clock, label: 'Feedback History' }
  ];

  const employeeNavItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/feedback/received', icon: MessageSquare, label: 'My Feedback' }
  ];

  const navItems = user?.role === 'manager' ? managerNavItems : employeeNavItems;

  return (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;