import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import axios from 'axios';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/promotions`);
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`${API_BASE_URL}/promotions/${promotionId}`);
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  const filteredPromotions = promotions.filter(promotion => {
    if (filter === 'active') return !isExpired(promotion.valid_to);
    if (filter === 'expired') return isExpired(promotion.valid_to);
    return true;
  });

  const PromotionForm = ({ promotion, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: promotion?.title || '',
      description: promotion?.description || '',
      discount: promotion?.discount || '',
      valid_from: promotion?.valid_from ? promotion.valid_from.split('T')[0] : '',
      valid_to: promotion?.valid_to ? promotion.valid_to.split('T')[0] : ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = {
          ...formData,
          discount: parseFloat(formData.discount),
          valid_from: new Date(formData.valid_from),
          valid_to: new Date(formData.valid_to)
        };

        if (promotion) {
          await axios.put(`${API_BASE_URL}/promotions/${promotion._id}`, data);
        } else {
          await axios.post(`${API_BASE_URL}/promotions`, data);
        }
        onSave();
        onClose();
        fetchPromotions();
      } catch (error) {
        console.error('Error saving promotion:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {promotion ? 'Edit Promotion' : 'Add New Promotion'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid To
              </label>
              <input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {promotion ? 'Update' : 'Add'} Promotion
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
        <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Promotion</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Promotions
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'expired' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promotion) => {
          const expired = isExpired(promotion.valid_to);
          
          return (
            <div key={promotion._id} className={`bg-white rounded-xl border p-6 relative transition-all ${expired ? 'border-red-200' : 'border-gray-200'}`}
                 style={{ boxShadow: expired ? 'none' : '0 1px 2px 0 rgba(16,30,54,0.04)' }}>
              {/* Edit/Delete icons */}
              <div className="absolute top-5 right-5 flex space-x-2">
                <button
                  onClick={() => setEditingPromotion(promotion)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePromotion(promotion._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {/* Title and Description */}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{promotion.title}</h3>
              <p className="text-gray-600 mb-5">{promotion.description}</p>
              {/* Discount, Valid From/To */}
              <div className="grid grid-cols-2 gap-y-2 mb-8">
                <div className="text-gray-700">Discount</div>
                <div className="text-green-600 font-bold text-2xl text-right">{promotion.discount}%</div>
                <div className="text-gray-500">Valid From</div>
                <div className="text-gray-900 text-right">{new Date(promotion.valid_from).toLocaleDateString()}</div>
                <div className="text-gray-500">Valid To</div>
                <div className="text-gray-900 text-right">{new Date(promotion.valid_to).toLocaleDateString()}</div>
              </div>
              {/* Bottom row: Expired badge and faded text */}
              <div className="flex items-center justify-between pt-2 border-t border-red-100 mt-2">
                {/* Left: Expired badge */}
                {expired ? (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
                ) : <span></span>}
                {/* Right: Status tag (only show if not expired) */}
                {!expired && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold select-none bg-green-100 text-green-600">Active</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No {filter === 'all' ? '' : filter} promotions found.
          </p>
        </div>
      )}

      {/* Add/Edit Promotion Modal */}
      {(showAddForm || editingPromotion) && (
        <PromotionForm
          promotion={editingPromotion}
          onClose={() => {
            setShowAddForm(false);
            setEditingPromotion(null);
          }}
          onSave={() => {
            setShowAddForm(false);
            setEditingPromotion(null);
          }}
        />
      )}
    </div>
  );
};

export default Promotions;

