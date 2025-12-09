import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../Components/ui/Card';
import { Button } from '../Components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, User, Mail, Phone, Ticket, QrCode, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = "http://localhost:5000/api";

export default function TicketDetails() {
  const { registrationId } = useParams();
  const { token } = useAuth();

  const { data: registration, isLoading, isError } = useQuery({
    queryKey: ['ticket', registrationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/registrations/${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      return res.json();
    },
    enabled: !!registrationId && !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4">
        <Card className="w-full max-w-md bg-white border-2 border-red-300 rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 text-lg font-bold">Error Loading Ticket</p>
            <p className="text-gray-600 mt-2">There was an error loading your ticket details. Please try again.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-bold">No Ticket Found</p>
            <p className="text-gray-600 mt-2">The ticket you're looking for doesn't exist.</p>
          </div>
        </Card>
      </div>
    );
  }

  const { event_id: event, user_id: user, ticket_id, payment_verified, transaction_id } = registration;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4 py-8">
      <Card className="w-full max-w-2xl bg-white border-2 border-green-300 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Success Indicator */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 sm:px-8 py-6 text-white text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-3xl font-bold">Your Event Ticket</h1>
          <p className="text-green-100 mt-1">Registration Confirmed</p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Payment Status Alert */}
          {event.registration_fee > 0 && !payment_verified ? (
            <div className="text-center mb-8 p-6 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <p className="font-bold text-lg text-amber-900">Payment Pending</p>
              <p className="text-amber-800 mt-2">Your ticket will be available after payment verification.</p>
            </div>
          ) : (
            /* QR Code Section */
            <div className="text-center mb-8">
              <div className="bg-white p-6 rounded-xl border-2 border-green-200 inline-block">
                <QRCode 
                  value={JSON.stringify({ registrationId: registration._id, userId: user._id })} 
                  size={160} 
                  bgColor="#ffffff" 
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-gray-600 mt-4 font-semibold">Scan this QR code at the event entrance</p>
            </div>
          )}

          {/* Event Details */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              Event Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Date & Time</p>
                  <p className="text-gray-900 font-semibold">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Location</p>
                  <p className="text-gray-900 font-semibold">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Event Name</p>
                  <p className="text-gray-900 font-semibold">{event.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Details */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              Your Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Full Name</p>
                  <p className="text-gray-900 font-semibold">{user.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Email Address</p>
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Phone Number</p>
                  <p className="text-gray-900 font-semibold">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket ID */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
              Ticket Information
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold mb-1">Ticket ID</p>
              <p className="text-gray-900 font-mono font-bold text-lg">{ticket_id}</p>
            </div>
          </div>

          {/* Payment Status */}
          {event.registration_fee > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <div className={`p-2 rounded-lg ${payment_verified ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <CheckCircle className={`w-5 h-5 ${payment_verified ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                Payment Status
              </h3>
              <div className={`p-4 rounded-lg ${payment_verified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`font-bold text-lg flex items-center gap-2 ${payment_verified ? 'text-green-700' : 'text-amber-700'}`}>
                  {payment_verified ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Payment Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      Payment Pending
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          {transaction_id && (
            <div className="mb-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                </div>
                Transaction Details
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Transaction ID</p>
                <p className="text-gray-900 font-mono font-bold">{transaction_id}</p>
              </div>
            </div>
          )}

          {/* Print Button */}
          {event.registration_fee > 0 && !payment_verified ? null : (
            <Button 
              onClick={() => window.print()} 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Ticket
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}