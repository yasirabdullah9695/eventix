import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegistrationsDialog = ({ event, onClose }) => {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/events/${event._id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }

        const data = await response.json();
        setRegistrations(data);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError(err.message || 'Failed to load registrations.');
      } finally {
        setIsLoading(false);
      }
    };

    if (event && token) {
      fetchRegistrations();
    }
  }, [event, token]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Registrations for {event.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        )}

        {!isLoading && !error && registrations.length === 0 && (
          <div className="text-center text-gray-400 p-8">
            No registrations found for this event.
          </div>
        )}

        {!isLoading && !error && registrations.length > 0 && (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration._id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-white font-semibold">{registration.user_id?.name || 'N/A'}</p>
                <p className="text-gray-300 text-sm">Email: {registration.user_id?.email || 'N/A'}</p>
                <p className="text-gray-300 text-sm">Registered On: {new Date(registration.registration_date).toLocaleDateString()}</p>
                {registration.payment_status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 mt-2">
                    <CheckCircle className="w-3 h-3" /> Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400 mt-2">
                    <AlertCircle className="w-3 h-3" /> Pending Payment
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsDialog;
