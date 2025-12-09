
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Ticket = ({ registration }) => {
  const { event, user } = registration;

  if (!event || !user) {
    return <div className="bg-white rounded-lg shadow-lg p-6 mb-4 text-red-500">Event or user data missing for this ticket.</div>;
  }

  const downloadTicket = () => {
    const ticketElement = document.getElementById(`ticket-${registration._id}`);
    html2canvas(ticketElement, { useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`ticket-${event.name}.pdf`);
    });
  };

  return (
    <div id={`ticket-${registration._id}`} className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{event.name}</h2>
        <button
          onClick={downloadTicket}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download
        </button>
      </div>
      <div className="flex">
        <div className="w-2/3 pr-4">
          <p className="text-gray-600">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="text-gray-600">
            <strong>Venue:</strong> {event.location}
          </p>
          <p className="text-gray-600">
            <strong>Registered to:</strong> {user.full_name}
          </p>
        </div>
        <div className="w-1/3 flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${registration._id}`}
            alt="QR Code"
            className="w-32 h-32"
          />
        </div>
      </div>
    </div>
  );
};

const DownloadTicket = () => {
  const [registrations, setRegistrations] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const API_URL = "http://localhost:5000";
const response = await fetch(`${API_URL}/api/registrations/myregistrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Failed to fetch registrations.');
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user, token]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Your Event Tickets</h1>
        {registrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((reg) => <Ticket key={reg._id} registration={reg} />)}
          </div>
        ) : (
          <p className="text-gray-400">You have not registered for any events yet.</p>
        )}
      </div>
    </div>
  );
};

export default DownloadTicket;
