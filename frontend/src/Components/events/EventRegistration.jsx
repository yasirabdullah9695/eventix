import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Alert, AlertDescription } from "../ui/Alert";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { Calendar, MapPin, Tag, DollarSign, Users, CheckCircle, AlertCircle, Upload } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function EventRegistration({ eventId: propEventId, onRegistrationSuccess }) {
  const { eventId: paramEventId } = useParams();
  const currentEventId = propEventId || paramEventId;

  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, token, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [registeredTicketId, setRegisteredTicketId] = useState(null);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null);
  const [formData, setFormData] = useState({
    event_id: currentEventId,
    user_id: '',
    student_name: '',
    student_email: '',
    phone: '',
    branch: '',
    year: '',
    transaction_id: '',
  });

  // Fetch event details
  const { data: event, isLoading: isLoadingEvent, isError: isEventError } = useQuery({
    queryKey: ['event', currentEventId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/events/${currentEventId}`);
      if (!res.ok) {
        throw new Error('Event not found');
      }
      return res.json();
    },
    enabled: !!currentEventId,
    retry: false,
  });

  // Fetch user's existing registrations for this event
  const { data: existingRegistration, isLoading: isLoadingExistingRegistration } = useQuery({
    queryKey: ['myRegistration', currentEventId, authUser?.id],
    queryFn: async () => {
      if (!authUser?.id || !token) return null;
      const res = await fetch(`${API_URL}/registrations/myregistrations?eventId=${currentEventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch existing registration');
      }
      const registrations = await res.json();
      return registrations.find(reg => reg.event_id === currentEventId && reg.user_id === authUser.id);
    },
    enabled: !!authUser?.id && !!token && !!currentEventId,
    retry: false,
  });

  const socket = useSocket();

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      setFormData(prevData => ({
        ...prevData,
        user_id: authUser.id,
        student_name: authUser.full_name || '',
        student_email: authUser.email || '',
        phone: authUser.phone || '',
        branch: authUser.branch || '',
        year: authUser.year || '',
      }));
    } else if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authUser, isAuthenticated, navigate, authLoading]);

  useEffect(() => {
    if (socket && authUser) {
      socket.on('payment_verified', (data) => {
        if (data.registration_id === registeredTicketId) {
          setSuccess(data.message);
          setError(null);
        }
      });

      return () => {
        socket.off('payment_verified');
      };
    }
  }, [socket, authUser, registeredTicketId]);

  const handlePaymentScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshotFile(file);
      setPaymentScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (registrationData) => {
      const formDataForUpload = new FormData();
      for (const key in registrationData) {
        formDataForUpload.append(key, registrationData[key]);
      }
      if (paymentScreenshotFile) {
        formDataForUpload.append('payment_screenshot', paymentScreenshotFile);
      }

      const res = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataForUpload,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to register for event');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccess("Registration successful! Redirecting to your ticket.");
      setRegisteredTicketId(data._id);
      setError(null);
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
      // Automatically navigate to the ticket details page after successful registration
      navigate(`/my-tickets/${data._id}`);
    },
    onError: (err) => {
      setError(err.message || "An unexpected error occurred during registration.");
      setSuccess(null);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRegisteredTicketId(null);

    if (!isAuthenticated) {
      setError("You must be logged in to register for an event.");
      return;
    }

    if (!event) {
      setError("Event details not loaded.");
      return;
    }

    if (!formData.student_name || !formData.student_email || !formData.phone || !formData.branch || !formData.year) {
      setError(
        <>
          Please complete your profile details (Name, Email, Phone, Branch, Year) before registering.
          <Button onClick={() => navigate('/profile-setup')} className="ml-2 px-3 py-1 text-sm">Go to Profile Setup</Button>
        </>
      );
      return;
    }

    if (event.registration_fee > 0) {
      if (!formData.transaction_id || !paymentScreenshotFile) {
        setError("Transaction ID and payment screenshot are required for paid events.");
        return;
      }
    }

    registerMutation.mutate({ ...formData, event_id: currentEventId });
  };

  if (isLoadingEvent || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e] p-4">
        <Card className="w-full max-w-md glass-card border-gray-800/50 p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Event</h3>
          <p className="text-gray-400">Please wait while we fetch the details...</p>
        </Card>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e] p-4">
        <Card className="w-full max-w-md glass-card border-red-500/50 bg-red-500/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Event Not Found</h3>
          <p className="text-red-300 mb-6">We couldn't load the event details. Please try again.</p>
          <Button onClick={() => navigate('/events')} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  if (existingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e] p-4">
        <Card className="w-full max-w-md glass-card border-green-500/50 bg-green-500/5 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">You're Registered!</h2>
          <p className="text-gray-300 mb-2">You've already registered for</p>
          <p className="text-xl font-semibold text-white mb-6">{event.name}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate(`/my-tickets/${existingRegistration._id}`)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3">
              View Your Ticket
            </Button>
            <Button onClick={() => navigate('/events')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3">
              Browse Other Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e] py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="glass-card border-gray-800/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-800/50 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
              Event Registration
            </h1>
            <p className="text-gray-300 text-center text-sm md:text-base">
              Complete your registration for <span className="font-semibold text-purple-400">{event?.name}</span>
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <AlertDescription className="text-green-300">{success}</AlertDescription>
              </Alert>
            )}

            {registeredTicketId && (
              <div className="text-center">
                <Button 
                  onClick={() => navigate(`/my-tickets/${registeredTicketId}`)} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold"
                >
                  View Your Ticket
                </Button>
              </div>
            )}

            {/* Event Details Card */}
            <div className="glass-card rounded-xl border border-gray-700/50 p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Event Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                    <p className="text-white font-medium text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Venue</p>
                    <p className="text-white font-medium text-sm">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <Tag className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Category</p>
                    <p className="text-white font-medium text-sm">{event.category}</p>
                  </div>
                </div>
                
                {event.registration_fee > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                    <DollarSign className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Registration Fee</p>
                      <p className="text-white font-bold text-lg">${event.registration_fee}</p>
                    </div>
                  </div>
                )}
                
                {event.max_participants > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                    <Users className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Max Participants</p>
                      <p className="text-white font-medium text-sm">{event.max_participants}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="glass-card rounded-xl border border-gray-700/50 p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
                <h3 className="text-xl font-bold text-white mb-4">Your Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_name" className="text-gray-300 text-sm mb-1.5 block">Full Name</Label>
                      <Input 
                        id="student_name" 
                        value={formData.student_name} 
                        disabled 
                        className="bg-gray-900/50 border-gray-700 text-gray-300 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_email" className="text-gray-300 text-sm mb-1.5 block">Email Address</Label>
                      <Input 
                        id="student_email" 
                        value={formData.student_email} 
                        disabled 
                        className="bg-gray-900/50 border-gray-700 text-gray-300 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-gray-300 text-sm mb-1.5 block">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        disabled 
                        className="bg-gray-900/50 border-gray-700 text-gray-300 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch" className="text-gray-300 text-sm mb-1.5 block">Branch</Label>
                      <Input 
                        id="branch" 
                        value={formData.branch} 
                        disabled 
                        className="bg-gray-900/50 border-gray-700 text-gray-300 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-gray-300 text-sm mb-1.5 block">Year</Label>
                      <Input 
                        id="year" 
                        value={formData.year} 
                        disabled 
                        className="bg-gray-900/50 border-gray-700 text-gray-300 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {event.registration_fee > 0 && (
                <div className="glass-card rounded-xl border border-green-500/30 p-5 bg-gradient-to-br from-green-900/10 to-emerald-900/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Payment Information
                  </h3>
                  
                  {event.payment_qr_url ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-gray-700 rounded-lg p-4 text-center">
                        <p className="text-gray-300 text-sm mb-3">Scan the QR code to pay</p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <img 
                            src={event.payment_qr_url} 
                            alt="Payment QR Code" 
                            className="w-48 h-48 object-contain mx-auto" 
                          />
                        </div>
                        <div className="mt-3 text-2xl font-bold text-green-400">
                          ${event.registration_fee}
                        </div>
                        <p className="text-yellow-400 text-xs mt-2 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Payment verification required
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="transaction_id" className="text-gray-300 text-sm mb-1.5 block">
                          Transaction ID <span className="text-red-400">*</span>
                        </Label>
                        <Input 
                          id="transaction_id"
                          value={formData.transaction_id}
                          onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                          placeholder="Enter your transaction ID" 
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="payment_screenshot" className="text-gray-300 text-sm mb-1.5 block">
                          Payment Screenshot <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input 
                            id="payment_screenshot"
                            type="file"
                            onChange={handlePaymentScreenshotChange}
                            className="bg-gray-900/50 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
                            accept="image/*"
                            required
                          />
                        </div>
                        {paymentScreenshotPreview && (
                          <div className="mt-3 border border-gray-700 rounded-lg p-2 bg-black/20">
                            <img 
                              src={paymentScreenshotPreview} 
                              alt="Preview" 
                              className="w-full h-32 object-contain rounded" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Payment QR code not available. Please contact the organizer.</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}