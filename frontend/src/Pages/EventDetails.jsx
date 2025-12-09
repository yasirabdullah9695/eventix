import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Button } from "../Components/ui/Button";
import { Badge } from "../Components/ui/Badge";
import { Calendar, MapPin, Tag, DollarSign, Users, Clock, ArrowLeft, CheckCircle, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Ticket from '../Components/events/Ticket';

const API_URL = "http://localhost:5000/api";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const ticketRef = useRef();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/events/${eventId}`);
      if (!res.ok) {
        throw new Error('Event not found');
      }
      return res.json();
    },
    enabled: !!eventId,
  });

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations', user?.id, eventId],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated || !eventId) return [];
      const res = await fetch(`${API_URL}/registrations/myregistrations?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch existing registration');
      }
      return await res.json();
    },
    enabled: !!user?.id && isAuthenticated && !!eventId,
  });

  const isRegistered = myRegistrations.some(reg => reg.event_id._id === eventId);
  const registeredEventData = myRegistrations.find(reg => reg.event_id._id === eventId);

  const isUpcoming = event?.status === 'upcoming';
  const isRegistrationRequired = true;

  const handleDownload = () => {
    console.log("handleDownload called");
    if (ticketRef.current) {
      console.log("ticketRef.current is valid");
      html2canvas(ticketRef.current).then((canvas) => {
        console.log("html2canvas promise resolved");
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${user.name}-${event.name}-ticket.pdf`);
      });
    } else {
      console.log("ticketRef.current is null or undefined");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <Card className="bg-white border border-gray-200 p-8 text-center shadow-lg rounded-2xl">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold">Loading event details...</p>
        </Card>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <Card className="bg-white border-2 border-red-200 p-8 text-center shadow-lg rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-700 text-xl font-semibold mb-4">Error loading event</p>
          <Button onClick={() => navigate('/events')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Events
          </Button>

          {/* Main Card */}
          <Card className="bg-white border border-gray-200 overflow-hidden shadow-xl rounded-2xl">
            {/* Cover Image */}
            {event.cover_image_url && (
              <div className="relative h-60 sm:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                <img
                  src={event.cover_image_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay Badges */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex gap-2">
                  <Badge className={`text-xs sm:text-sm font-semibold shadow-md ${
                    event.status === 'upcoming' ? 'bg-blue-500 text-white' :
                    event.status === 'ongoing' ? 'bg-green-500 text-white' :
                    event.status === 'completed' ? 'bg-purple-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {event.status.toUpperCase()}
                  </Badge>
                  {isRegistered && (
                    <Badge className="text-xs sm:text-sm bg-green-500 text-white font-semibold shadow-md flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Registered
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Title and Category */}
              <div className="mb-6">
                <Badge className="bg-blue-100 text-blue-700 border border-blue-300 mb-3 inline-flex items-center gap-1 text-sm font-semibold">
                  <Tag className="w-3 h-3" /> {event.category}
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {event.name}
                </h1>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{event.description}</p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Date Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5 font-semibold">Date</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Time Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5 font-semibold">Time</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">
                        {new Date(event.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Venue Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5 font-semibold">Venue</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">{event.location}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Registration Fee Card */}
                {event.registration_fee > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5 font-semibold">Registration Fee</p>
                        <p className="text-gray-900 font-bold text-lg sm:text-xl">${event.registration_fee}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Max Participants Card */}
                {event.max_participants > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5 font-semibold">Max Participants</p>
                        <p className="text-gray-900 font-semibold text-sm sm:text-base">{event.max_participants}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-8">
                {isRegistered ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border-2 border-green-200 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">You are registered for this event!</span>
                      </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          if (registeredEventData) {
                            navigate(`/my-tickets/${registeredEventData._id}`);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-blue-300 transition-all duration-300"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        View Your Ticket
                      </Button>
                      <Button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-purple-300 transition-all duration-300"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Ticket
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {isUpcoming && isRegistrationRequired && isAuthenticated && (
                      <Button
                        onClick={() => navigate(`/events/${eventId}/register`)}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-purple-300 transition-all duration-300"
                      >
                        Register for Event
                      </Button>
                    )}
                    {isUpcoming && isRegistrationRequired && !isAuthenticated && (
                      <Button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-purple-300 transition-all duration-300"
                      >
                        Login to Register
                      </Button>
                    )}
                    {!isUpcoming && isRegistrationRequired && (
                      <div className="bg-gray-100 border border-gray-300 p-4 rounded-xl text-center">
                        <p className="text-gray-700 font-semibold">Registration Closed</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}