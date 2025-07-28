import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GuestReviews from './components/GuestReviews';
import UserManagement from './components/UserManagement';
import Calendar from './components/Calendar';
import Promotions from './components/Promotions';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

function AppContent() {
  const { user, loading } = useAuth();
  const { addNotification } = useNotifications();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Load notifiedReviewIds from localStorage
  const [notifiedReviewIds, setNotifiedReviewIds] = useState(() => {
    const saved = localStorage.getItem('notifiedReviewIds');
    return saved ? JSON.parse(saved) : [];
  });

  // Load notifiedBirthdayTitles from localStorage
  const [notifiedBirthdayTitles, setNotifiedBirthdayTitles] = useState(() => {
    const saved = localStorage.getItem('notifiedBirthdayTitles');
    return saved ? JSON.parse(saved) : [];
  });

  const [calendarJumpDate, setCalendarJumpDate] = useState(null);
  const [calendarJumpEventTitle, setCalendarJumpEventTitle] = useState(null);

  useEffect(() => {
    localStorage.setItem('notifiedReviewIds', JSON.stringify(notifiedReviewIds));
  }, [notifiedReviewIds]);

  useEffect(() => {
    localStorage.setItem('notifiedBirthdayTitles', JSON.stringify(notifiedBirthdayTitles));
  }, [notifiedBirthdayTitles]);

  useEffect(() => {
    // Only fetch if user is logged in
    if (!user) return;
    // Fetch events for this and next month to catch upcoming birthdays
    const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';
    const now = new Date();
    const monthsToFetch = [now.getMonth() + 1, now.getMonth() === 11 ? 1 : now.getMonth() + 2];
    const year = now.getFullYear();
    monthsToFetch.forEach(async (month) => {
      try {
        const response = await fetch(`${API_BASE_URL}/events?month=${month}&year=${year}`);
        const events = await response.json();
        events.forEach(event => {
          if (event.title && event.title.startsWith('Birthday:')) {
            const eventDate = new Date(event.start_date);
            const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7 && !notifiedBirthdayTitles.includes(event.title)) {
              setNotifiedBirthdayTitles(prev => {
                const updated = [...prev, event.title];
                localStorage.setItem('notifiedBirthdayTitles', JSON.stringify(updated));
                return updated;
              });
              addNotification({
                title: event.title,
                message: `Upcoming guest birthday: ${event.title.replace('Birthday: ', '')} in ${diffDays} day(s).`,
                date: eventDate.toISOString(), // Use ISO string for date
                type: 'birthday',
                read: false
              });
            }
          }
        });
      } catch (err) {
        // Ignore errors
      }
    });
  }, [user, addNotification, notifiedBirthdayTitles]);

  useEffect(() => {
    if (!user) return;
    const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';
    let interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews?limit=1`);
        const reviews = await response.json();
        if (reviews && reviews[0] && !notifiedReviewIds.includes(reviews[0]._id)) {
          setNotifiedReviewIds(prev => {
            const updated = [...prev, reviews[0]._id];
            localStorage.setItem('notifiedReviewIds', JSON.stringify(updated));
            return updated;
          });
          addNotification({
            message: `A new review is added by the guest for ${reviews[0].department}`,
            timestamp: reviews[0].created_at,
            type: 'review',
            department: reviews[0].department,
            rating: reviews[0].rating
          });
        }
      } catch (err) {
        // Ignore errors
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user, addNotification, notifiedReviewIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} user={user} />;
      case 'reviews':
        return <GuestReviews />;
      case 'users':
        return <UserManagement />;
      case 'calendar': {
        const calendar = <Calendar initialDate={calendarJumpDate} initialEventTitle={calendarJumpEventTitle} />;
        // Reset jump event title after rendering Calendar so it doesn't persist
        if (calendarJumpEventTitle) setTimeout(() => setCalendarJumpEventTitle(null), 0);
        return calendar;
      }
      case 'promotions':
        return <Promotions />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setCurrentPage={setCurrentPage} setCalendarJumpDate={setCalendarJumpDate} setCalendarJumpEventTitle={setCalendarJumpEventTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;

