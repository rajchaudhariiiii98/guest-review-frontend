import React, { useRef } from 'react';
import { Bell, Download, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Header = ({ user, setCurrentPage }) => {
  const { logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    dropdownOpen,
    setDropdownOpen,
    removeNotification
  } = useNotifications();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, setDropdownOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Review Management</h1>
          <p className="text-gray-600">
            Welcome back, {user?.username} | Praveg's Grand Eulogia
          </p>
        </div>
        <div className="flex items-center space-x-4 relative">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setDropdownOpen((open) => {
                  if (!open) markAllAsRead();
                  return !open;
                });
              }}
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No notifications</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((notif, idx) => {
                      const isUrgent = notif.urgent === true || notif.rating <= 2;
                      return (
                        <li
                          key={idx}
                          className={`relative flex items-start p-4 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 ${isUrgent ? '' : ''}`}
                          style={isUrgent ? { borderLeft: '4px solid #ef4444', borderRadius: '0 0.5rem 0.5rem 0' } : {}}
                          onClick={() => {
                            if (notif.type === 'review') {
                              setCurrentPage('reviews');
                              setDropdownOpen(false);
                              removeNotification(idx);
                            } else if (notif.type === 'birthday' && notif.date) {
                              setCurrentPage('calendar');
                              if (typeof setCalendarJumpDate === 'function') {
                                setCalendarJumpDate(notif.date);
                              }
                              if (typeof setCalendarJumpEventTitle === 'function') {
                                setCalendarJumpEventTitle(null);
                              }
                              setDropdownOpen(false);
                              removeNotification(idx);
                            } else if (notif.type === 'event') {
                              removeNotification(idx);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">{notif.message}</span>
                              {isUrgent && (
                                <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold ml-2">Urgent</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {notif.department || ''}{notif.department ? ' • ' : ''}{notif.rating ? `${notif.rating} Stars` : ''}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : ''}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-full p-2">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            </div>
          </div>
          {/* Logout Button */}
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

