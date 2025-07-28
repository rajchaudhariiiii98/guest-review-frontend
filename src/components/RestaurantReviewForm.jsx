import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import axios from 'axios';
import { User, Mail, Calendar as CalendarIcon, Phone, Building, UtensilsCrossed, Users, Sparkles, Coins, Star, MessageCircle, Send, X } from 'lucide-react';
import { Form, FormLabel, FormMessage } from './ui/form';

const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const ratingFields = [
  {
    key: 'ambiance',
    label: 'Ambiance of the Restaurant',
    icon: <Building className="h-6 w-6 text-gray-500 mr-2" />,
  },
  {
    key: 'presentation',
    label: 'Presentation of Food Items and Quality',
    icon: <UtensilsCrossed className="h-6 w-6 text-purple-500 mr-2" />,
  },
  {
    key: 'staff',
    label: 'Staff Service and Friendliness',
    icon: <Users className="h-6 w-6 text-purple-800 mr-2" />,
  },
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    icon: <Sparkles className="h-6 w-6 text-orange-400 mr-2" />,
  },
  {
    key: 'value',
    label: 'Value for Money',
    icon: <Coins className="h-6 w-6 text-yellow-600 mr-2" />,
  },
];

const RestaurantReviewForm = ({ onBack, onClose, onSuccess, viewOnly = false, initialValues = {} }) => {
  const methods = useForm({
    defaultValues: {
      guest_name: '',
      email: '',
      review_taken_by: '',
      phone: '',
      dob: '',
      visit_date: formatDate(new Date()),
      comments: '',
      ...initialValues,
    },
    values: initialValues,
  });
  const { handleSubmit, register, setValue, formState: { errors } } = methods;
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState(
    viewOnly && initialValues.ratings
      ? initialValues.ratings
      : {
          ambiance: 0,
          presentation: 0,
          staff: 0,
          cleanliness: 0,
          value: 0,
        }
  );

  useEffect(() => {
    if (viewOnly && initialValues.ratings) {
      setRatings(initialValues.ratings);
    }
  }, [viewOnly, initialValues.ratings]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/users`).then(res => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  // For dd-mm-yyyy input, convert to yyyy-mm-dd for backend
  const parseDate = (str) => {
    if (!str) return '';
    const [day, month, year] = str.split('-');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Calculate average rating
      const ratingValues = Object.values(ratings).filter(r => typeof r === 'number' && r > 0);
      const rating = ratingValues.length > 0 ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) : 0;
      await axios.post(`${API_BASE_URL}/reviews`, {
        username: data.guest_name, // Use guest_name as username
        guest_name: data.guest_name,
        email: data.email || '',
        review_taken_by: data.review_taken_by,
        phone: data.phone,
        dob: data.dob ? parseDate(data.dob) : '',
        visit_date: data.visit_date ? parseDate(data.visit_date) : '',
        comments: data.comments,
        comment: data.comments, // Use comments as comment
        ratings,
        rating, // Send calculated average rating
        department: 'Restaurant',
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (e) {
      // handle error (could show toast)
    } finally {
      setSubmitting(false);
    }
  };

  const dobValue = methods.watch('dob');

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0,2)}-${value.slice(2,4)}-${value.slice(4)}`;
    } else if (value.length > 2) {
      formatted = `${value.slice(0,2)}-${value.slice(2)}`;
    }
    methods.setValue('dob', formatted, { shouldValidate: true, shouldDirty: true });
  };
  const handleDobBlur = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length === 8) {
      const formatted = `${value.slice(0,2)}-${value.slice(2,4)}-${value.slice(4)}`;
      methods.setValue('dob', formatted, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-0 w-full max-w-2xl shadow-xl relative max-h-[95vh] overflow-y-auto border border-gray-200">
        {/* Modal Close */}
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          style={{ fontSize: 28 }}
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-7 h-7" />
        </button>
        {/* Back Link */}
        <button
          className="absolute top-6 left-6 text-sm text-blue-600 hover:underline flex items-center"
          onClick={onBack}
        >
          <span className="mr-1 text-lg">&#8592;</span> Back to Department Selection
        </button>
        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-2 mt-8">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <UtensilsCrossed className="text-green-500 h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-1">Restaurant Review</h2>
          {viewOnly && (
            <div className="text-center text-yellow-700 text-base font-semibold mb-2">(View Only)</div>
          )}
          <p className="text-center text-gray-600 mb-4">Share your dining experience with us</p>
        </div>
        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mx-6 mb-8 p-0">
          <div className="px-8 pt-6 pb-0">
            <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Guest Name */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><User className="mr-2 h-4 w-4" /> Guest Name <span className="text-red-500 ml-1">*</span></FormLabel>
                <input
                  {...register('guest_name', { required: 'Please fill out this field.' })}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={viewOnly}
                />
                <FormMessage>{errors.guest_name?.message}</FormMessage>
              </div>
              {/* Email Address */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><Mail className="mr-2 h-4 w-4" /> Email Address <span className="text-red-500 ml-1">*</span></FormLabel>
                <input
                  {...register('email', { required: 'Please fill out this field.', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={viewOnly}
                />
                <FormMessage>{errors.email?.message}</FormMessage>
              </div>
              {/* Review Taken By */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><User className="mr-2 h-4 w-4" /> Review Taken By <span className="text-red-500 ml-1">*</span></FormLabel>
                <select
                  {...register('review_taken_by', { required: 'Please fill out this field.' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue=""
                  disabled={viewOnly}
                >
                  <option value="" disabled>Select reviewer</option>
                  {users.map(u => (
                    <option key={u._id} value={u.username}>{u.username}</option>
                  ))}
                </select>
                <FormMessage>{errors.review_taken_by?.message}</FormMessage>
              </div>
              {/* Phone Number */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><Phone className="mr-2 h-4 w-4" /> Phone Number</FormLabel>
                <input
                  {...register('phone', { pattern: { value: /^\d{10,15}$/, message: 'Invalid phone number' } })}
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={viewOnly}
                />
                <FormMessage>{errors.phone?.message}</FormMessage>
              </div>
              {/* Date of Birth */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><CalendarIcon className="mr-2 h-4 w-4" /> Date of Birth</FormLabel>
                <input
                  {...register('dob', {
                    pattern: {
                      value: /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$/,
                      message: 'Format should be dd-mm-yyyy',
                    },
                  })}
                  type="text"
                  placeholder="dd-mm-yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  autoComplete="off"
                  onChange={handleDobChange}
                  onBlur={handleDobBlur}
                  value={dobValue}
                  disabled={viewOnly}
                />
                <FormMessage>{errors.dob?.message}</FormMessage>
              </div>
              {/* Visit Date */}
              <div className="col-span-1">
                <FormLabel className="flex items-center mb-1"><CalendarIcon className="mr-2 h-4 w-4" /> Visit Date <span className="text-red-500 ml-1">*</span></FormLabel>
                <input
                  {...register('visit_date')}
                  type="text"
                  placeholder="dd-mm-yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-gray-100 cursor-not-allowed"
                  value={methods.getValues('visit_date')}
                  readOnly
                  tabIndex={-1}
                  disabled={viewOnly}
                />
                <FormMessage>{errors.visit_date?.message}</FormMessage>
              </div>
              {/* Rate Your Experience */}
              <div className="col-span-2 mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-left">Rate Your Experience</h3>
                <div className="space-y-4">
                  {ratingFields.map(field => (
                    <div
                      key={field.key}
                      className="bg-[#f9fafb] border border-gray-200 rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
                      style={{ boxShadow: '0 1px 2px 0 rgba(16,30,54,0.04)' }}
                    >
                      <div className="flex items-center mb-2 md:mb-0">
                        {field.icon}
                        <span className="font-semibold text-base text-gray-900 ml-2">{field.label}</span>
                      </div>
                      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center space-x-1">
                          {[1,2,3,4,5].map(star => (
                            <button
                              type="button"
                              key={star}
                              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              onClick={() => !viewOnly && setRatings(r => ({ ...r, [field.key]: star }))}
                              className="focus:outline-none"
                              style={{ lineHeight: 0 }}
                              disabled={viewOnly}
                            >
                              <Star className={`h-7 w-7 ${ratings[field.key] >= star ? 'text-gray-900 fill-yellow-400' : 'text-gray-300'}`} fill={ratings[field.key] >= star ? '#fde68a' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm min-w-[70px] text-right font-normal">{ratings[field.key] === 0 ? 'Not rated' : `${ratings[field.key]} / 5`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Additional Comments */}
              <div className="col-span-2 mt-8">
                <FormLabel className="flex items-center mb-1 text-gray-900 font-semibold">
                  <MessageCircle className="mr-2 h-5 w-5 text-gray-500" /> Additional Comments <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <textarea
                  {...register('comments', { required: 'Please fill out this field.' })}
                  placeholder="Please share your detailed feedback about your dining experience..."
                  className="w-full min-h-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-base resize-none bg-white"
                  required
                  disabled={viewOnly}
                />
                <FormMessage>{errors.comments?.message}</FormMessage>
              </div>
              {/* Buttons */}
              {!viewOnly && (
                <div className="col-span-2 flex justify-end mt-8">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-semibold text-lg py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-5 w-5" /> Submit Restaurant Review
                  </button>
                </div>
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default RestaurantReviewForm; 