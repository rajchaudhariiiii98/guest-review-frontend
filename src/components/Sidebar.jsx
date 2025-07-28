import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Calendar, 
  Tag, 
  BarChart3, 
  Settings
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reviews', label: 'Guest Reviews', icon: MessageSquare },
    // Only add User Management if user is Master
    ...(user && user.role === 'Master' ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="bg-slate-800 text-white w-64 min-h-screen p-4 transition-all duration-300 relative">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <div className="bg-blue-600 rounded-lg p-2 mr-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold">ReviewPro</span>
      </div>
      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {/* Removed badge numbers */}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

