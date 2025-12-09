import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, DollarSign, Trophy, Tag, ArrowRight, Filter, Search, Star, Download } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../Components/events/EventCard';
import EventRegistration from '../Components/events/EventRegistration';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../Components/ui/Dialog';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EventsPageEnhanced() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const socket = useSocket();
  const { user, token } = useAuth();

  const fetchRegisteredEvents = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/users/me/registered-events', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRegisteredEvents(new Set(data.map(reg => reg.event._id)));
      }
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  }, [token]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
    fetchRegisteredEvents();

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
  }, [socket, token, fetchRegisteredEvents]);

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeRegisterModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const handleRegistrationSuccess = () => {
    fetchRegisteredEvents();
    closeRegisterModal();
    toast.success('Successfully registered for the event!');
  };

  const filteredEvents = events
    .filter(e => {
      if (user?.role !== 'admin' && activeFilter === 'all' && e.status === 'completed') {
        return false;
      }
      return activeFilter === 'all' || e.status === activeFilter;
    })
    .filter(e => categoryFilter === 'all' || e.category === categoryFilter)
    .filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length
  };

  const categories = ['all', ...new Set(events.map(e => e.category))];

  return (
    <div className="min-h-screen bg-white p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-300 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="relative p-6 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Campus Events</h1>
                    <p className="text-lg sm:text-xl text-gray-600">Discover, Register & Participate</p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700">
                  Explore exciting activities happening across campus. From cultural festivals to tech symposiums, there's something for everyone!
                </p>
                <div className="mt-4">
                  <Link to="/download-ticket" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-300 hover:scale-105 text-sm sm:text-base">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Download Your Event Ticket
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-white border border-gray-300 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg transition-all hover:scale-105 shadow-md">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">Total Events</div>
                </div>
                <div className="bg-white border border-gray-300 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg transition-all hover:scale-105 shadow-md">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {stats.ongoing}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">Live Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-300 rounded-2xl p-4 sm:p-6 mb-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-400"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="lg:col-span-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { value: 'all', label: 'All', count: stats.total },
                  { value: 'upcoming', label: 'Upcoming', count: stats.upcoming },
                  { value: 'ongoing', label: 'Live', count: stats.ongoing },
                  { value: 'completed', label: 'Completed', count: stats.completed }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap hover:scale-105 text-sm sm:text-base ${
                      activeFilter === filter.value
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {filter.label}
                    <span className="text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gray-200 font-bold text-gray-700">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-5 pt-5 border-t border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 ${
                    categoryFilter === cat
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onRegister={() => openRegisterModal(event)}
                isRegistered={registeredEvents.has(event._id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-300 rounded-3xl p-10 sm:p-20 text-center shadow-md">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No Events Found</h3>
            <p className="text-gray-600 mb-8 text-base sm:text-lg">Try adjusting your filters or search query</p>
            <button 
              onClick={() => {
                setActiveFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-blue-300 hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {selectedEvent && selectedEvent._id && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register for {selectedEvent.name}</DialogTitle>
              <DialogDescription>
                Please confirm your details to register for this event.
              </DialogDescription>
              <DialogClose onClick={closeRegisterModal} />
            </DialogHeader>
            <EventRegistration 
              eventId={selectedEvent._id}
              onRegistrationSuccess={handleRegistrationSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}