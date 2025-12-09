import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, DollarSign, Trophy, Clock, Edit2, Trash2, Plus, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth, API_URL } from '../../context/AuthContext';
import EventForm from './EventForm';
import { Button } from '../ui/Button'; // Import the custom Button component
import { Dialog, DialogContent } from '../ui/Dialog';
import { toast } from 'react-toastify';

// Event Card Component
const EventCard = ({ event, onEdit, onDelete, getStatusColor, getCategoryIcon }) => {
  return (
    <div className="bg-gray-800 border border-gray-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all">
      {event.cover_image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={event.cover_image_url} 
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-semibold text-white flex-1">{event.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-400 line-clamp-2">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>{new Date(event.date).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-red-400" />
            <span>{event.location}</span>
          </div>
          {event.max_participants && (
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="w-5 h-5 text-green-400" />
              <span>
                {event.registrations?.length || 0}/{event.max_participants} Participants
              </span>
            </div>
          )}
          {event.registration_fee > 0 && (
            <div className="flex items-center gap-3 text-gray-300">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span>₹{event.registration_fee}</span>
            </div>
          )}
          {event.house_points > 0 && (
            <div className="flex items-center gap-3 text-gray-300">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{event.house_points} Points</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">

          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Edit Event"
            >
              <Edit2 className="w-5 h-5 text-purple-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete Event"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminEventsEnhanced() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();
  const { token, user } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(error.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();

    socket.on('newEvent', (newEvent) => {
      console.log('Socket: Received newEvent', newEvent);
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
    });

    socket.on('updateEvent', (updatedEvent) => {
      console.log('Socket: Received updateEvent', updatedEvent);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    socket.on('deleteEvent', (deletedEventId) => {
      console.log('Socket: Received deleteEvent', deletedEventId);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== deletedEventId)
      );
    });

    return () => {
      socket.off('newEvent');
      socket.off('updateEvent');
      socket.off('deleteEvent');
    };
  }, [socket, token, fetchEvents]);

  const handleDelete = (eventId) => {
    if (!user) {
      toast.error('You must be logged in to delete an event');
      return;
    }
    setEventToDelete(eventId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    if (!token) {
      toast.error('You must be logged in to delete an event');
      return;
    }
    console.log(`AdminEvents: Deleting event with ID: ${eventToDelete}`);
    try {
      const response = await fetch(`${API_URL}/events/${eventToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('AdminEvents: Received delete response with status:', response.status);
      console.log('AdminEvents: Response OK status:', response.ok);

      if (response.ok) {
        console.log('AdminEvents: Event deletion was successful');
        toast.success('Event deleted successfully');
        fetchEvents(); // Refresh the events list
      } else {
        const errorData = await response.json();
        console.error('AdminEvents: Server responded with an error during deletion:', errorData);
        toast.error(errorData.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('AdminEvents: An error occurred in confirmDelete:', error);
      toast.error('An error occurred while deleting the event');
    }
    setIsDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.upcoming;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Cultural: '🎭',
      Sports: '⚽',
      Technical: '💻',
      Academic: '📚',
      Social: '🤝'
    };
    return icons[category] || '📅';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Delete Event</h3>
                <p className="text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Manage Events</h1>
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Event
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No Events</h2>
            <p className="text-gray-500">Create your first event to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={() => {
                  setSelectedEvent(event);
                  setIsDialogOpen(true);
                }}
                onDelete={() => handleDelete(event._id)}
                getStatusColor={getStatusColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        )}

        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full border border-gray-700 shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <EventForm
                  initialData={selectedEvent}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setSelectedEvent(null);
                    fetchEvents();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}