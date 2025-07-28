import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Star, Users, Calendar, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    avgRating: 0,
    activeUsers: 0,
    activePromotions: 0
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [dashboardRes, departmentRes, ratingRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/dashboard`),
        axios.get(`${API_BASE_URL}/analytics/reviews-by-department`),
        axios.get(`${API_BASE_URL}/analytics/rating-distribution`),
        axios.get(`${API_BASE_URL}/analytics/recent-activity`)
      ]);

      setAnalytics(dashboardRes.data);
      setDepartmentData(departmentRes.data.map(item => ({
        name: item._id,
        value: item.count
      })));
      setRatingData(ratingRes.data.map(item => ({
        rating: `${item.rating} Star${item.rating !== 1 ? 's' : ''}`,
        count: item.count
      })));
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-gray-600">Last 30 days</span>
            <select className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reviews"
          value={analytics.totalReviews}
          change="15%"
          icon={Star}
          color="bg-blue-500"
        />
        <StatCard
          title="Average Rating"
          value={analytics.avgRating.toFixed(1)}
          change="0.2"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers}
          change="2"
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Active Promotions"
          value={analytics.activePromotions}
          change="1"
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews by Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reviews by Department</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          {departmentData.length > 0 ? (
            <div className="space-y-5">
              {(() => {
                // Department color mapping and fixed list
                const DEPT_LIST = [
                  { name: 'Front Office', color: '#3B82F6' },
                  { name: 'Restaurant', color: '#10B981' },
                  { name: 'Banquet', color: '#A78BFA' },
                  { name: 'Housekeeping', color: '#F59E0B' },
                ];
                // Map department name to value
                const valueMap = Object.fromEntries(departmentData.map(d => [d.name, d.value]));
                const maxValue = Math.max(...DEPT_LIST.map(d => valueMap[d.name] || 0), 1);
                return DEPT_LIST.map((dept) => {
                  const value = valueMap[dept.name] || 0;
                  return (
                    <div key={dept.name} className="flex items-center w-full">
                      {/* Dot and Department Name */}
                      <div className="flex items-center min-w-[140px]">
                        <div
                          className="w-4 h-4 rounded-md mr-3"
                          style={{ backgroundColor: dept.color }}
                        ></div>
                        <span className="text-gray-800 font-medium">{dept.name}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="flex-1 mx-6">
                        <div className="w-full h-[6px] bg-gray-200 rounded-full relative">
                          <div
                            className="h-[6px] rounded-full absolute top-0 left-0"
                            style={{
                              width: `${(value / maxValue) * 100}%`,
                              backgroundColor: value > 0 ? dept.color : '#E5E7EB',
                              transition: 'width 0.3s',
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Count */}
                      <span className="font-bold text-black min-w-[24px] text-right">{value}</span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Rating Distribution</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.75L18.16 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.48 4.73L5.82 21z" /></svg>
          </div>
          <div className="space-y-5">
            {(() => {
              // Fixed list for 1-5 stars
              const RATING_LIST = [1, 2, 3, 4, 5];
              // Map rating to count
              const valueMap = Object.fromEntries(ratingData.map(d => [parseInt(d.rating), d.count]));
              const maxValue = Math.max(...RATING_LIST.map(r => valueMap[r] || 0), 1);
              return RATING_LIST.map((rating) => {
                const value = valueMap[rating] || 0;
                return (
                  <div key={rating} className="flex items-center w-full">
                    {/* Number and Star */}
                    <div className="flex items-center min-w-[60px]">
                      <span className="text-gray-800 font-medium mr-1">{rating}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 17.75L18.16 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.48 4.73L5.82 21z" /></svg>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex-1 mx-6">
                      <div className="w-full h-[6px] bg-gray-200 rounded-full relative">
                        <div
                          className="h-[6px] rounded-full absolute top-0 left-0"
                          style={{
                            width: `${(value / maxValue) * 100}%`,
                            backgroundColor: value > 0 ? '#FACC15' : '#E5E7EB',
                            transition: 'width 0.3s',
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Count */}
                    <span className="font-bold text-black min-w-[24px] text-right">{value}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                // Parse activity details (assuming message: 'New review from NAME', department, rating, date)
                // You may need to adjust this parsing based on your actual activity data structure
                const match = activity.message.match(/New review from (.+)/);
                const name = match ? match[1] : '';
                const department = activity.department || 'banquet';
                const rating = activity.rating || 2;
                const date = activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : '';
                return (
                  <div key={index} className="flex items-center w-full">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    {/* Main content */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{activity.message}</span>
                      <span className="text-xs text-gray-500 truncate">{department} • {rating} stars • {date}</span>
                    </div>
                    {/* Star rating */}
                    <div className="flex items-center ml-4 min-w-[110px] justify-end">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} viewBox="0 0 24 24"><path d="M12 17.75L18.16 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.48 4.73L5.82 21z" /></svg>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              <p className="text-gray-500">No activity data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

