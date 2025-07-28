import React from 'react';
import { User, Mail, Calendar as CalendarIcon, Phone, Building, UtensilsCrossed, Users, Sparkles, Coins, Star, MessageCircle } from 'lucide-react';

const ratingFields = [
  { key: 'ambiance', label: 'Ambiance of the Restaurant', icon: <Building className="h-6 w-6 text-gray-500 mr-2" /> },
  { key: 'presentation', label: 'Presentation of Food Items and Quality', icon: <UtensilsCrossed className="h-6 w-6 text-purple-500 mr-2" /> },
  { key: 'staff', label: 'Staff Service and Friendliness', icon: <Users className="h-6 w-6 text-purple-800 mr-2" /> },
  { key: 'cleanliness', label: 'Cleanliness', icon: <Sparkles className="h-6 w-6 text-orange-400 mr-2" /> },
  { key: 'value', label: 'Value for Money', icon: <Coins className="h-6 w-6 text-yellow-600 mr-2" /> },
];

const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && date.includes('-') && date.split('-')[0].length === 4) {
    // yyyy-mm-dd
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const RestaurantReviewView = ({ review }) => (
  <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 mx-auto">
    <div className="flex flex-col items-center pt-10 pb-2">
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
        <span className="text-3xl">ψ</span>
      </div>
      <h2 className="text-3xl font-bold text-center mb-1">Restaurant Review</h2>
      <p className="text-center text-gray-600 mb-4">Guest Feedback (View Only)</p>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mx-6 mb-8 p-0">
      <div className="px-8 pt-6 pb-0">
        <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex items-center"><User className="mr-2 h-4 w-4" /> <span>{review.guest_name}</span></div>
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> <span>{review.email}</span></div>
          <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /> <span>{review.phone}</span></div>
          <div className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> <span>{formatDate(review.dob)}</span></div>
          <div className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> <span>{formatDate(review.visit_date)}</span></div>
          <div className="flex items-center"><User className="mr-2 h-4 w-4" /> <span>{review.review_taken_by}</span></div>
        </div>
      </div>
      <div className="px-8 pt-6 pb-0">
        <h3 className="text-lg font-semibold mb-4">Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {ratingFields.map(field => (
            <div key={field.key} className="flex items-center">
              {field.icon}
              <span className="flex-1">{field.label}</span>
              <span className="ml-2 font-bold">{review.ratings?.[field.key] ?? 'Not rated'}</span>
              <Star className="h-4 w-4 text-yellow-400 ml-1" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center">
          <span className="font-semibold mr-2">Overall Rating:</span>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`inline h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          ))}
          <span className="ml-2">({review.rating})</span>
        </div>
      </div>
      <div className="px-8 pt-6 pb-8">
        <h3 className="text-lg font-semibold mb-4">Additional Comments</h3>
        <div className="bg-gray-100 rounded p-3 min-h-[60px]">{review.comment || review.comments}</div>
      </div>
    </div>
  </div>
);

export default RestaurantReviewView; 