import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Eye, ArrowRight, Filter } from 'lucide-react';

export default function EventCalendarPageEnhanced() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const socket = useSocket();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();

    socket.on('newEvent', (newEvent) => {
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
    });

    socket.on('updateEvent', (updatedEvent) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    socket.on('deleteEvent', (deletedEventId) => {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== deletedEventId)
      );
    });

    return () => {
      socket.off('newEvent');
      socket.off('updateEvent');
      socket.off('deleteEvent');
    };
  }, [socket]);

  const categoryColors = {
    Cultural: { bg: 'from-purple-600 to-pink-600', dot: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700' },
    Sports: { bg: 'from-green-600 to-teal-600', dot: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700' },
    Technical: { bg: 'from-blue-600 to-cyan-600', dot: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700' },
    Academic: { bg: 'from-orange-600 to-amber-600', dot: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-700' },
    Social: { bg: 'from-red-600 to-pink-600', dot: 'bg-red-600', light: 'bg-red-50', text: 'text-red-700' }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  const allMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentDate.getMonth() &&
           eventDate.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const monthEvents = allMonthEvents.filter(event => {
    if (selectedCategory === 'All') {
      return true;
    }
    return event.category === selectedCategory;
  });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Event Calendar</h1>
              <p className="text-xl text-gray-600">Plan your month with upcoming events</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            {/* Main Calendar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-700 font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>

                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-700 font-bold"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-600 font-bold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday = isCurrentMonth && day === today.getDate();
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square p-2 rounded-xl border-2 transition-all hover:scale-105 relative ${
                        isToday 
                          ? 'bg-blue-50 border-blue-400 shadow-md' 
                          : isSelected
                            ? 'bg-blue-100 border-blue-400'
                            : dayEvents.length > 0
                              ? 'bg-gray-50 border-gray-300 hover:border-blue-400'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-bold mb-1 ${
                          isToday ? 'text-blue-700' : dayEvents.length > 0 ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {day}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {dayEvents.slice(0, 3).map(event => (
                              <div
                                key={event._id}
                                className={`w-2 h-2 rounded-full ${categoryColors[event.category]?.dot}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 right-1 text-[10px] text-gray-600 font-bold bg-white px-1.5 rounded-full">
                          {dayEvents.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Legend */}
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3">Categories</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(categoryColors).map(([category, colors]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <span className="text-sm text-gray-700 font-semibold">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Day Events */}
            {selectedDay && selectedDayEvents.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Events on {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
                </h3>
                <div className="space-y-3">
                  {selectedDayEvents.map(event => (
                    <div key={event._id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-400 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${categoryColors[event.category]?.dot}`} />
                        <span className={`text-xs font-bold ${categoryColors[event.category]?.text}`}>{event.category}</span>
                      </div>
                      <h4 className="text-gray-900 font-bold mb-2">{event.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Month Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-gray-700 font-semibold">Total Events</span>
                  <span className="text-2xl font-bold text-blue-600">{allMonthEvents.length}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryColors).map(([category, colors]) => {
                    const count = allMonthEvents.filter(e => e.category === category).length;
                    if (count === 0) return null;
                    return (
                      <div key={category} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          <span className="text-gray-700 font-semibold">{category}</span>
                        </div>
                        <span className="text-gray-900 font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Events Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Events in {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100 border border-gray-200">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${selectedCategory === 'All' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {Object.keys(categoryColors).map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {monthEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthEvents.map((event) => (
                <div 
                  key={event._id}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all hover:shadow-lg"
                >
                  {/* Event Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-200">
                    <img 
                      src={event.cover_image_url}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColors[event.category]?.bg} shadow-md`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-red-600" />
                        {event.location}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 border border-blue-300 rounded-lg transition-all font-semibold">
                      <Eye className="w-4 h-4" />
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events This Month</h3>
              <p className="text-gray-600">Check other months for upcoming events or adjust your filter.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}