import React from 'react';
import QRCode from 'react-qr-code';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, MapPin, User, Mail } from 'lucide-react';

const Ticket = React.forwardRef(({ event, user, ticketId }, ref) => {
  const qrCodeValue = JSON.stringify({
    userId: user?.id,
    name: user?.name,
    email: user?.email,
    eventId: event?._id,
    ticketId: ticketId,
  });

  if (!event || !user) {
    return null;
  }

  return (
    <div ref={ref} className="p-4 bg-gray-900 text-white">
      <Card className="max-w-md mx-auto bg-gray-800 border-gray-700 rounded-lg shadow-lg p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">{event.name}</h2>
          <p className="text-gray-400">Event Ticket</p>
        </div>
        <div className="my-6 flex justify-center">
          <div className="bg-white p-2 rounded-lg">
            <QRCode value={qrCodeValue} size={128} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-400" />
            <span>{user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-400" />
            <span>{event.location}</span>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Ticket ID: {ticketId}</p>
          <p>Please present this ticket at the event entrance.</p>
        </div>
      </Card>
    </div>
  );
});

export default Ticket;
