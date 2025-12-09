import React, { useRef } from 'react';
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Calendar, MapPin, User, Mail, Phone, Tag, QrCode } from "lucide-react";
import QRCode from 'react-qr-code'; // Assuming you have this library installed
import { useReactToPrint } from 'react-to-print'; // Assuming you have this library installed

export default function EventTicket({ registration, event }) {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket-${event.name}-${registration.student_name}`,
  });

  if (!registration || !event) {
    return <p className="text-red-500 text-center mt-8">Ticket or Event data not available.</p>;
  }

  const registrationDate = new Date(registration.createdAt);
  const eventDate = new Date(event.date);

  return (
    <div className="p-4">
      <Card className="glass-card p-8 border-gray-800 max-w-2xl mx-auto" ref={componentRef}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Event Ticket</h1>
          <p className="text-gray-400">Thank you for registering!</p>
        </div>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
            <h2 className="text-2xl font-bold text-white mb-3">{event.name}</h2>
            <p className="text-gray-300 mb-4">{event.description}</p>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> <span>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> <span>{event.location}</span></div>
              <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-purple-400" /> <span>{event.category}</span></div>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
            <h3 className="text-xl font-bold text-white mb-3">Attendee Information</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-green-400" /> <span>{registration.student_name}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-400" /> <span>{registration.student_email}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-400" /> <span>{registration.phone}</span></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> <span>Registered on: {registrationDate.toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center p-4 rounded-lg border border-gray-700 bg-gray-800/30">
            <h3 className="text-xl font-bold text-white mb-3">Your Ticket QR Code</h3>
            <div className="bg-white p-4 inline-block rounded-lg shadow-lg">
              <QRCode value={registration._id} size={128} level="H" />
            </div>
            <p className="text-gray-400 text-sm mt-3">Scan this code at the event entrance.</p>
          </div>
        </div>
      </Card>

      <div className="text-center mt-6">
        <Button onClick={handlePrint} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6">
          Print / Download Ticket
        </Button>
      </div>
    </div>
  );
}
