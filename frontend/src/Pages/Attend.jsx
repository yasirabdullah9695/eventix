
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../Components/ui/Card';
import { Button } from '../Components/ui/Button';
import { Alert, AlertDescription } from '../Components/ui/Alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = "http://localhost:5000";

export default function Attend() {
  const { registrationId } = useParams();
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page with a redirect back to this page
      navigate(`/login?redirect=/attend/${registrationId}`);
      return;
    }

    if (user?.role !== 'admin') {
      setError('You are not authorized to perform this action.');
      setLoading(false);
      return;
    }

    const markAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/registrations/${registrationId}/attend`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to mark attendance');
        }
        setSuccess('Attendance marked successfully!');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    markAttendance();
  }, [isAuthenticated, user, token, registrationId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e] p-4">
      <Card className="w-full max-w-md glass-card border-gray-800/50 p-6 text-center">
        {loading && (
          <>
            <Loader2 className="animate-spin h-8 w-8 text-white mx-auto mb-4" />
            <p className="text-white text-xl font-semibold">Marking Attendance...</p>
          </>
        )}
        {error && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/admin/attendance-scan')} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              Go to Scanner
            </Button>
          </>
        )}
        {success && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <Alert className="mb-4 bg-green-500/20 border-green-500/30 text-green-300">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/admin/attendance-scan')} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              Scan Another
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
