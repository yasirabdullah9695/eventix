import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, DollarSign, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onRegister, isRegistered }) => {
  const navigate = useNavigate();
  
  const categoryConfig = {
    Cultural: { 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: '🎭'
    },
    Sports: { 
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '⚽'
    },
    Technical: { 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: '💻'
    },
    Academic: { 
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: '📚'
    },
    Social: { 
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '🤝'
    }
  };

  const statusConfig = {
    upcoming: { 
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'Upcoming'
    },
    ongoing: { 
      bg: 'bg-green-50',
      text: 'text-green-600',
      label: 'Live'
    },
    completed: { 
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      label: 'Ended'
    }
  };

  const category = categoryConfig[event.category] || categoryConfig.Cultural;
  const status = statusConfig[event.status] || statusConfig.upcoming;
  
  const spotsLeft = event.max_participants - event.current_participants;
  const percentageFilled = (event.current_participants / event.max_participants) * 100;
  
  const isAlmostFull = percentageFilled >= 80;
  const isFull = spotsLeft <= 0;

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden bg-gray-50">
        <img 
          src={event.cover_image_url && (event.cover_image_url.startsWith('http://') || event.cover_image_url.startsWith('https://')) 
            ? event.cover_image_url 
            : 'https://placehold.jp/400x300.png?text=Event'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
          {/* Category Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${category.bg} ${category.border} border backdrop-blur-sm`}>
            <span>{category.icon}</span>
            <span className={`font-medium ${category.color}`}>{event.category}</span>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-md text-xs ${status.bg} border ${status.text} backdrop-blur-sm`}>
            <span className="font-medium">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">
          {event.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {event.description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
          {/* Date & Time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' at '}
              {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Participants Progress */}
          {/* <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-gray-600">
                  {event.current_participants} / {event.max_participants}
                </span>
                {isAlmostFull && !isFull && (
                  <span className="text-xs font-medium text-orange-600">Almost Full</span>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isFull ? 'bg-red-400' : isAlmostFull ? 'bg-orange-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(percentageFilled, 100)}%` }}
                ></div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Points */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-100 rounded-md">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">{event.house_points} pts</span>
          </div>
          
          {/* Fee */}
          <div className={`flex items-center gap-1 px-2 py-1 ${
            event.registration_fee > 0 ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
          } border rounded-md`}>
            {event.registration_fee > 0 ? (
              <>
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">₹{event.registration_fee}</span>
              </>
            ) : (
              <span className="text-xs font-medium text-gray-700">Free</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={onRegister}
            disabled={isFull || isRegistered}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all font-medium text-xs ${
              isFull 
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100' 
                : isRegistered
                ? 'bg-green-50 text-green-700 border border-green-100 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFull ? 'Event Full' : isRegistered ? '✓ Registered' : 'Register'}
          </button>

          {/* <button 
            onClick={() => navigate(`/events/${event._id}`)}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 rounded-md transition-all font-medium text-xs flex items-center gap-1"
          >
            View
            <ArrowRight className="w-3.5 h-3.5" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default EventCard;