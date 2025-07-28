import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, User, Mail, Calendar as CalendarIcon, Phone, Building, UtensilsCrossed, Users, Sparkles, Coins, Star, MessageCircle, PartyPopper, Building2, Bed, Image } from 'lucide-react';
import axios from 'axios';
import BanquetReviewForm from './BanquetReviewForm';
import RestaurantReviewForm from './RestaurantReviewForm';
import FrontOfficeReviewForm from './FrontOfficeReviewForm';
import HousekeepingReviewForm from './HousekeepingReviewForm';
import { useNotifications } from '../contexts/NotificationContext';

const Calendar = ({ initialDate, initialSelectedDate, initialEventTitle }) => {
  const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate ? new Date(initialSelectedDate) : null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [noEventPopup, setNoEventPopup] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [fetchToken, setFetchToken] = useState(0); // Add fetchToken state
  const [eventListPopup, setEventListPopup] = useState(null); // { date, events }

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Auto-open event popup if initialDate is set and an event exists for that date (and optionally title)
  useEffect(() => {
    if (initialDate && events.length > 0) {
      const dateObj = new Date(initialDate);
      let eventOnDate = null;
      if (initialEventTitle) {
        eventOnDate = events.find(event => {
          const eventDate = new Date(event.start_date);
          return (
            eventDate.getDate() === dateObj.getDate() &&
            eventDate.getMonth() === dateObj.getMonth() &&
            eventDate.getFullYear() === dateObj.getFullYear() &&
            event.title === initialEventTitle
          );
        });
      } else {
        eventOnDate = events.find(event => {
          const eventDate = new Date(event.start_date);
          return (
            eventDate.getDate() === dateObj.getDate() &&
            eventDate.getMonth() === dateObj.getMonth() &&
            eventDate.getFullYear() === dateObj.getFullYear()
          );
        });
      }
      if (eventOnDate) {
        setSelectedEvent(eventOnDate);
      }
    }
    // Only run on mount or when initialDate/events/initialEventTitle change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate, events, initialEventTitle]);

  // When initialDate changes, update currentDate and selectedDate
  useEffect(() => {
    if (initialDate) {
      const dateObj = new Date(initialDate);
      setCurrentDate(dateObj);
      setSelectedDate(dateObj);
    }
  }, [initialDate]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const EventForm = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: '09:00',
      type: 'Appointment',
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        await axios.post(`${API_BASE_URL}/events`, {
          title: formData.title,
          start_date: startDateTime,
          end_date: startDateTime,
          type: formData.type,
        });
        addNotification({
          message: `New event "${formData.title}" added to calendar.`,
          timestamp: new Date().toISOString(),
          type: 'event',
          date: startDateTime.toISOString(),
        });
        onSave();
        onClose();
        fetchEvents();
      } catch (error) {
        console.error('Error saving event:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-5 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-5 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-5 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-5 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Appointment">Appointment</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Event
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
  const banquetRatingFields = [
    {
      key: 'ambiance',
      label: 'Ambiance of the Banquet',
      icon: <PartyPopper className="h-6 w-6 text-purple-500 mr-2" />,
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
  const frontOfficeRatingFields = [
    {
      key: 'cleanliness',
      label: 'The Room was Clean',
      icon: <Sparkles className="h-6 w-6 text-orange-400 mr-2" />,
    },
    {
      key: 'bed',
      label: 'Comfortable Bed',
      icon: <Bed className="h-6 w-6 text-blue-800 mr-2" />,
    },
    {
      key: 'view',
      label: 'Room View and Ambiance',
      icon: <Image className="h-6 w-6 text-cyan-500 mr-2" />,
    },
    {
      key: 'value',
      label: 'Value for Money',
      icon: <Coins className="h-6 w-6 text-yellow-600 mr-2" />,
    },
  ];
  const housekeepingRatingFields = [
    {
      key: 'cleanliness',
      label: 'Cleanliness of the Room',
      icon: <Sparkles className="h-6 w-6 text-orange-400 mr-2" />,
    },
  ];

  const days = getDaysInMonth(currentDate);
  const { addNotification } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchEvents}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Refresh
          </button>
          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {daysOfWeek.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const isToday = day && 
              new Date().getDate() === day && 
              new Date().getMonth() === currentDate.getMonth() && 
              new Date().getFullYear() === currentDate.getFullYear();

            const dayEvents = day ? events.filter(event => {
              const eventDate = new Date(event.start_date);
              if (event.recurring === 'yearly') {
                // Show on this day/month every year
                return (
                  eventDate.getDate() === day &&
                  eventDate.getMonth() === currentDate.getMonth()
                );
              } else {
                return (
                  eventDate.getDate() === day &&
                  eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear()
                );
              }
            }) : [];

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 ${
                  day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                // Only open popup if there is at least one event
                onClick={() => {
                  if (day && dayEvents.length > 0) {
                    if (dayEvents.length === 1) {
                      const event = dayEvents[0];
                      setSelectedEvent(event);
                      setNoEventPopup(false);
                      if (event.review_id) {
                        setSelectedReview(null);
                        setLoadingReview(true);
                        axios.get(`https://guest-review-backend.onrender.com/api/reviews/${event.review_id}`)
                          .then(res => {
                            setSelectedReview(res.data);
                          })
                          .catch((err) => {
                            console.error('Error fetching review:', err);
                            setSelectedReview(null);
                          })
                          .finally(() => {
                            setLoadingReview(false);
                          });
                      }
                    } else {
                      setEventListPopup({ date: day, events: dayEvents });
                    }
                  } else if (day) {
                    setSelectedEvent(null);
                    setNoEventPopup(true);
                    setSelectedReview(null);
                  }
                }}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event._id}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                          title={event.title}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <EventForm
          onClose={() => {
            setShowAddForm(false);
            setSelectedDate(null);
          }}
          onSave={() => {
            setShowAddForm(false);
            setSelectedDate(null);
          }}
        />
      )}

      {/* Event Popup Modal */}
      {selectedEvent && (
        (() => {
          const dept = (selectedEvent.department || '').toLowerCase();
          if (dept === 'banquet') {
            return <BanquetReviewForm
              viewOnly
              initialValues={{
                guest_name: selectedEvent.guest_name || '',
                email: selectedEvent.email || '',
                review_taken_by: selectedEvent.review_taken_by || '',
                phone: selectedEvent.phone || '',
                dob: selectedEvent.dob || '',
                event_date: selectedEvent.event_date || '',
                comments: selectedEvent.comments || '',
                ratings: selectedEvent.ratings || {},
                ...selectedEvent
              }}
              onClose={() => { setSelectedEvent(null); setSelectedReview(null); }}
            />;
          } else if (dept === 'restaurant') {
            return <RestaurantReviewForm
              viewOnly
              initialValues={{
                guest_name: selectedEvent.guest_name || '',
                email: selectedEvent.email || '',
                review_taken_by: selectedEvent.review_taken_by || '',
                phone: selectedEvent.phone || '',
                dob: selectedEvent.dob || '',
                visit_date: selectedEvent.visit_date || '',
                comments: selectedEvent.comments || '',
                ratings: selectedEvent.ratings || {},
                ...selectedEvent
              }}
              onClose={() => { setSelectedEvent(null); setSelectedReview(null); }}
            />;
          } else if (dept === 'front office') {
            return <FrontOfficeReviewForm
              viewOnly
              initialValues={{
                guest_name: selectedEvent.guest_name || '',
                email: selectedEvent.email || '',
                review_taken_by: selectedEvent.review_taken_by || '',
                phone: selectedEvent.phone || '',
                dob: selectedEvent.dob || '',
                checkin_date: selectedEvent.checkin_date || '',
                checkout_date: selectedEvent.checkout_date || '',
                comments: selectedEvent.comments || '',
                ratings: selectedEvent.ratings || {},
                ...selectedEvent
              }}
              onClose={() => { setSelectedEvent(null); setSelectedReview(null); }}
            />;
          } else if (dept === 'housekeeping') {
            return <HousekeepingReviewForm
              viewOnly
              initialValues={{
                guest_name: selectedEvent.guest_name || '',
                email: selectedEvent.email || '',
                review_taken_by: selectedEvent.review_taken_by || '',
                phone: selectedEvent.phone || '',
                dob: selectedEvent.dob || '',
                service_date: selectedEvent.service_date || '',
                comments: selectedEvent.comments || '',
                ratings: selectedEvent.ratings || {},
                ...selectedEvent
              }}
              onClose={() => { setSelectedEvent(null); setSelectedReview(null); }}
            />;
          } else {
            // Show event details popup for non-feedback events
            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={() => setSelectedEvent(null)}
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
                  <div className="mb-2"><strong>Date:</strong> {selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : ''}</div>
                  <div className="mb-2"><strong>Time:</strong> {selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                </div>
              </div>
            );
          }
        })()
      )}
      {/* No Event Popup Modal */}
      {noEventPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setNoEventPopup(false)}
            >
              &times;
            </button>
            <div className="text-lg font-semibold text-center mb-2">No event on this day.</div>
          </div>
        </div>
      )}
      {/* Event List Popup for Multiple Events */}
      {eventListPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setEventListPopup(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Select Event</h2>
            <ul className="space-y-3">
              {eventListPopup.events.map(event => (
                <li key={event._id}>
                  <button
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setEventListPopup(null);
                    }}
                  >
                    <div className="font-semibold text-lg">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

