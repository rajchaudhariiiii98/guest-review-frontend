import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Star, Plus, Edit, Trash2, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../contexts/NotificationContext';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const GuestReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  const departments = ['All Departments', 'Front Office', 'Restaurant', 'Banquet', 'Housekeeping'];
  const ratings = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, departmentFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'All Departments') {
      filtered = filtered.filter(review => review.department === departmentFilter);
    }

    if (ratingFilter !== 'All Ratings') {
      const rating = parseInt(ratingFilter.charAt(0));
      filtered = filtered.filter(review => review.rating === rating);
    }

    setFilteredReviews(filtered);
  };

  const handleDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/reviews/${reviewToDelete}`);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setShowDeleteDialog(false);
      setReviewToDelete(null);
    }
  };

  const cancelDeleteReview = () => {
    setShowDeleteDialog(false);
    setReviewToDelete(null);
  };

  // Excel export handler
  const handleExport = () => {
    const data = filteredReviews.map(r => ({
      Date: formatDate(r.created_at),
      Name: r.guest_name,
      'Phone Number': r.phone,
      'Email Id': r.email,
      'Date of Birth': r.dob,
      Department: r.department,
      Rating: r.rating,
      Comment: r.comment || r.comments
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reviews');
    XLSX.writeFile(wb, 'guest-reviews.xlsx');
  };

  const ReviewForm = ({ review, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      guest_name: review?.guest_name || '',
      department: review?.department || 'Front Office',
      rating: review?.rating || 5,
      comment: review?.comment || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (review) {
          await axios.put(`${API_BASE_URL}/reviews/${review._id}`, formData);
        } else {
          await axios.post(`${API_BASE_URL}/reviews`, formData);
          // Removed addNotification here to prevent duplicate notifications
        }
        onSave();
        onClose();
        fetchReviews();
      } catch (error) {
        console.error('Error saving review:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {review ? 'Edit Review' : 'Add New Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guest Name
              </label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.slice(1).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {review ? 'Update' : 'Add'} Review
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
        {/* Removed Add Review button from the top navigation */}
        <div className="flex space-x-3">
          {/* <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Review</span>
          </button> */}
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors" onClick={handleExport}>
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ratings.map(rating => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto w-full">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 w-full">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2 gap-2 w-full flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 break-all w-full md:w-auto">{review.guest_name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full whitespace-nowrap">{review.department}</span>
                      <span className="flex items-center text-gray-700 text-sm break-all w-full md:w-auto"><Phone className="h-4 w-4 mr-1 text-gray-400" />{review.phone}</span>
                      <span className="flex items-center text-gray-700 text-sm break-all w-full md:w-auto"><Mail className="h-4 w-4 mr-1 text-gray-400" />{review.email}</span>
                      <span className="flex items-center text-gray-700 text-sm break-all w-full md:w-auto"><CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />{formatDate(review.visit_date) || ''}</span>
                      <div className="flex items-center flex-wrap gap-1 w-full md:w-auto">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 break-words w-full">{review.comment}</p>
                    <p className="text-sm text-gray-500 break-words w-full">
                      {formatDate(review.created_at)}
                      <span style={{ marginLeft: 12 }}></span>
                      By {review.review_taken_by || 'Unknown User'}
                    </p>
                  </div>
                  <div className="flex flex-row gap-2 md:flex-col md:space-x-0 md:space-y-2 ml-0 md:ml-4 flex-shrink-0">
                    {user && user.role === 'Master' && (
                      <>
                        <button
                          onClick={() => setEditingReview(review)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Review Modal */}
      {(showAddForm || editingReview) && (
        <ReviewForm
          review={editingReview}
          onClose={() => {
            setShowAddForm(false);
            setEditingReview(null);
          }}
          onSave={() => {
            setShowAddForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Review</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteReview}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={cancelDeleteReview}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestReviews;

