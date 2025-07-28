import React, { useState, useEffect } from 'react';
import { Star, Users, Calendar, TrendingUp, Plus, Utensils, PartyPopper, Building2, Brush, Phone, Mail, Calendar as CalendarIcon, Circle } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../contexts/NotificationContext';
import RestaurantReviewForm from './RestaurantReviewForm';
import BanquetReviewForm from './BanquetReviewForm';
import FrontOfficeReviewForm from './FrontOfficeReviewForm';
import HousekeepingReviewForm from './HousekeepingReviewForm';

const departments = [
  {
    name: 'Restaurant',
    description: 'Share your dining experience',
    color: 'bg-green-500',
    button: 'Start Review',
    icon: Utensils,
  },
  {
    name: 'Banquet',
    description: 'Rate your event experience',
    color: 'bg-purple-500',
    button: 'Start Review',
    icon: PartyPopper,
  },
  {
    name: 'Front Office',
    description: 'Review your stay experience',
    color: 'bg-blue-500',
    button: 'Start Review',
    icon: Building2,
  },
  {
    name: 'Housekeeping',
    description: 'Rate our cleaning service',
    color: 'bg-orange-500',
    button: 'Start Review',
    icon: Brush,
  },
];

function GuestReviewModal({ onClose }) {
  const [selectedDept, setSelectedDept] = React.useState(null);

  if (selectedDept === 'Restaurant') {
    return (
      <RestaurantReviewForm
        onBack={() => setSelectedDept(null)}
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }
  if (selectedDept === 'Banquet') {
    return (
      <BanquetReviewForm
        onBack={() => setSelectedDept(null)}
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }
  if (selectedDept === 'Front Office') {
    return (
      <FrontOfficeReviewForm
        onBack={() => setSelectedDept(null)}
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }
  if (selectedDept === 'Housekeeping') {
    return (
      <HousekeepingReviewForm
        onBack={() => setSelectedDept(null)}
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-2">Guest Review Form</h2>
        <h3 className="text-3xl font-bold text-center mb-6">Guest Review</h3>
        <p className="text-center text-gray-600 mb-8">Select the department you'd like to review</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="border rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full text-white text-3xl mb-4 ${dept.color}`}>
                <dept.icon className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">{dept.name}</h4>
              <p className="text-gray-500 mb-4 text-center">{dept.description}</p>
              <button
                className={`px-6 py-2 rounded-lg text-white font-semibold ${dept.color} hover:opacity-90 transition-colors`}
                onClick={() => setSelectedDept(dept.name)}
              >
                {dept.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const Dashboard = ({ setCurrentPage, user }) => {
  const [showGuestReviewModal, setShowGuestReviewModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    activeUsers: 1,
    activePromotions: 1,
    avgRating: 0.0
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 1000); // Poll every 1 second
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, reviewsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/dashboard`),
        axios.get(`${API_BASE_URL}/reviews?limit=5`)
      ]);

      setAnalytics(analyticsRes.data);
      setRecentReviews(reviewsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className="text-green-600 text-sm font-medium">+{change}</span>
        <span className="text-gray-500 text-sm ml-1">from last month</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user?.username && (
            <p className="text-gray-600 mt-1">Welcome back, {user.username}</p>
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          onClick={() => setShowGuestReviewModal(true)}
        >
          <span>Guest Review Form</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reviews"
          value={analytics.totalReviews}
          change="12%"
          icon={Star}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers}
          change="5%"
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Promotions"
          value={analytics.activePromotions}
          change="8%"
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="Avg Rating"
          value={analytics.avgRating.toFixed(1)}
          change="2.1%"
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Urgent Reviews (if any) and Recent Guest Reviews */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Urgent Reviews Requiring Attention - now just above Recent Guest Reviews */}
          {recentReviews.some(r => r.rating <= 2) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-red-600 font-semibold text-lg mr-2">&#9888;</span>
                <span className="text-red-700 font-bold text-md">Urgent Reviews Requiring Attention ({recentReviews.filter(r => r.rating <= 2).length})</span>
              </div>
              <div className="space-y-3">
                {recentReviews.filter(r => r.rating <= 2).map((review) => (
                  <div key={review._id} className="flex flex-col bg-white border border-red-200 rounded-lg p-4 shadow-sm mb-3">
                    {/* Top: Name, Department, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                        <span className="font-bold text-red-700 text-lg break-all">{review.guest_name}</span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">{review.department}</span>
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">URGENT</span>
                    </div>
                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-700 text-sm mb-2">
                      <span className="flex items-center break-all"><Phone className="h-4 w-4 mr-1 text-gray-400" />{review.phone}</span>
                      <span className="flex items-center break-all"><Mail className="h-4 w-4 mr-1 text-gray-400" />{review.email}</span>
                      </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 text-gray-700 font-semibold">{review.rating.toFixed(1)}</span>
                    </div>
                    {/* Comment */}
                    <div className="text-gray-700 text-sm mb-2 break-words">{review.comment}</div>
                    {/* Bottom Row: Reviewed by, Date */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 border-t border-red-100 pt-2 mt-auto gap-1">
                      <span>Reviewed by: {user?.username || 'Unknown User'}</span>
                      <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Recent Guest Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Guest Reviews</h2>
              <span className="text-sm text-gray-500">Last updated: 4:00:46 PM</span>
            </div>
            <div className="p-6 space-y-3">
              {recentReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent reviews to display.</p>
                </div>
              ) : (
                (showAllReviews ? recentReviews : recentReviews.slice(0, 4)).map((review) => (
                  <div key={review._id} className={`flex flex-col rounded-lg p-4 shadow-sm border ${review.rating <= 2 ? 'bg-red-50 border-red-200' : 'bg-[#fff6f6] border-[#f3eaea]'} mb-3`}>
                    {/* Top: Name, Department, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Circle className={`h-3 w-3 ${review.rating <= 2 ? 'text-red-500 fill-red-500' : 'text-blue-500 fill-blue-500'}`} />
                        <span className={`font-bold text-lg break-all ${review.rating <= 2 ? 'text-red-700' : 'text-blue-700'}`}>{review.guest_name}</span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">{review.department}</span>
                      {review.rating <= 2 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">NEEDS ATTENTION</span>
                      )}
                    </div>
                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-700 text-sm mb-2">
                      <span className="flex items-center break-all"><Phone className="h-4 w-4 mr-1 text-gray-400" />{review.phone}</span>
                      <span className="flex items-center break-all"><Mail className="h-4 w-4 mr-1 text-gray-400" />{review.email}</span>
                      </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 text-gray-700 font-semibold">{review.rating.toFixed(1)}</span>
                    </div>
                    {/* Comment */}
                    <div className="text-gray-700 text-sm mb-2 break-words">{review.comment}</div>
                    {/* Bottom Row: Reviewed by, Date */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 border-t border-gray-200 pt-2 mt-auto gap-1">
                      <span>Reviewed by: {user?.username || 'Unknown User'}</span>
                      <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
              {recentReviews.length > 4 && !showAllReviews && (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    onClick={() => setShowAllReviews(true)}
                  >
                    Show More
                  </button>
                </div>
              )}
              {recentReviews.length > 4 && showAllReviews && (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    onClick={() => setShowAllReviews(false)}
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <button
              className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 px-4 rounded-lg text-left hover:bg-blue-100 transition-colors"
              onClick={() => setCurrentPage('reviews')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Guest Reviews</span>
              </div>
            </button>
            <button
              className="w-full bg-green-50 border border-green-200 text-green-700 py-3 px-4 rounded-lg text-left hover:bg-green-100 transition-colors"
              onClick={() => setCurrentPage('analytics')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">View Analytics</span>
                {unreadCount > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
                )}
              </div>
            </button>
            <button
              className="w-full bg-purple-50 border border-purple-200 text-purple-700 py-3 px-4 rounded-lg text-left hover:bg-purple-100 transition-colors"
              onClick={() => setCurrentPage('promotions')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Manage Promotions</span>
                {/* Example: show badge if you add promotion notifications in the future */}
              </div>
            </button>
            <button
              className="w-full bg-orange-50 border border-orange-200 text-orange-700 py-3 px-4 rounded-lg text-left hover:bg-orange-100 transition-colors"
              onClick={() => setCurrentPage('calendar')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Calendar Events</span>
                {/* Example: show badge if you add calendar notifications in the future */}
              </div>
            </button>
          </div>
        </div>
      </div>
      {showGuestReviewModal && (
        <GuestReviewModal onClose={() => setShowGuestReviewModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;

