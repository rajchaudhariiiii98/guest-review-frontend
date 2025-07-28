import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem('unreadCount');
    return saved ? JSON.parse(saved) : 0;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unreadCount', JSON.stringify(unreadCount));
  }, [unreadCount]);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Prevent duplicate notifications by 'message' property
      const exists = prev.some(n => n.message === notification.message);
      if (exists) return prev;
      setUnreadCount((prevCount) => prevCount + 1);
      return [notification, ...prev].slice(0, 20);
    });
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const removeNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAllAsRead,
      dropdownOpen,
      setDropdownOpen,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 