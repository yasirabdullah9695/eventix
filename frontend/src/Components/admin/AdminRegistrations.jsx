import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Calendar, Users, Ticket, Trash2, Search, Filter, Download, Eye, Mail, Phone, CheckCircle, AlertCircle, TrendingUp, QrCode } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import AttendanceScannerComponent from './AttendanceScannerComponent';

export default function AdminRegistrationsEnhanced() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedHouse, setSelectedHouse] = useState('all');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  const [scannedTicketId, setScannedTicketId] = useState(null);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [scannerSuccess, setScannerSuccess] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUsers, setScannedUsers] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);

  const { token } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const houses = ['Prithvi', 'Tejas', 'Arohan', 'Vayu', 'Surya', 'Agni'];

  const houseColors = {
    'Prithvi': 'from-amber-500 to-yellow-600',
    'Tejas': 'from-orange-500 to-red-600',
    'Arohan': 'from-green-500 to-emerald-600',
    'Vayu': 'from-blue-500 to-cyan-600',
    'Surya': 'from-yellow-400 to-orange-500',
    'Agni': 'from-red-500 to-pink-600'
  };

  const houseTextColors = {
    'Prithvi': 'text-amber-400',
    'Tejas': 'text-orange-400',
    'Arohan': 'text-green-400',
    'Vayu': 'text-blue-400',
    'Surya': 'text-yellow-300',
    'Agni': 'text-red-400'
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error(error.message || 'Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    socket.on('newRegistration', (newRegistration) => {
      queryClient.invalidateQueries(['registrations']);
      toast.info('New registration received!');
    });

    socket.on('updateRegistration', (updatedRegistration) => {
      queryClient.invalidateQueries(['registrations']);
      toast.info('Registration updated!');
    });

    socket.on('deleteRegistration', (deletedRegistrationId) => {
      queryClient.invalidateQueries(['registrations']);
      toast.info('Registration deleted!');
    });

    return () => {
      socket.off('newRegistration');
      socket.off('updateRegistration');
      socket.off('deleteRegistration');
    };
  }, [token, socket, queryClient]);

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete registration');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['registrations']);
      toast.success('Registration deleted successfully!');
      fetchRegistrations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/admin/registrations/${id}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['registrations']);
      toast.success('Payment verified successfully!');
      fetchRegistrations();
      setViewDetails(data.registration);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleVerifyPayment = (id) => {
    verifyPaymentMutation.mutate(id);
  };

  const fetchRegistrationDetails = async (registrationId) => {
    setScannerLoading(true);
    setScannerError(null);
    setScannerSuccess(null);
    try {
      const res = await fetch(`${API_URL}/registrations/${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch registration details');
      }
      const data = await res.json();
      setRegistrationDetails(data);
      setScannedTicketId(registrationId);

      if (!data.attendance_marked) {
        await markAttendance(registrationId);
      } else {
        setScannerSuccess('Attendance already marked!');
        setScannerLoading(false);
        setScannedUsers(prev => [{
          ...data,
          scan_time: new Date().toLocaleTimeString(),
          status_message: 'Already Present'
        }, ...prev]);
        setScannedCount(prev => prev + 1);
      }

    } catch (err) {
      setScannerError(err.message);
      setRegistrationDetails(null);
      setScannedTicketId(null);
      setScannerLoading(false);
      if (err.message === 'User not registered for any event.') {
        setScannedUsers(prev => [{
          _id: registrationId,
          user_id: { full_name: 'Unknown User' },
          event_id: { name: 'N/A' },
          scan_time: new Date().toLocaleTimeString(),
          status_message: 'Not Registered'
        }, ...prev]);
        setScannedCount(prev => prev + 1);
      }
    }
  };

  const markAttendance = async (registrationId) => {
    setScannerLoading(true);
    setScannerError(null);
    setScannerSuccess(null);
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
      setScannerSuccess('Attendance marked successfully!');
      setRegistrationDetails(prev => ({ ...prev, attendance_marked: true }));
      fetchRegistrations();
      setScannedUsers(prev => [{
        ...registrationDetails,
        attendance_marked: true,
        scan_time: new Date().toLocaleTimeString(),
        status_message: 'Marked Present'
      }, ...prev]);
      setScannedCount(prev => prev + 1);
    } catch (err) {
      setScannerError(err.message);
    } finally {
      setScannerLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data) {
      let registrationId = null;
      try {
        const scannedData = JSON.parse(data);
        if (scannedData.registrationId) {
          registrationId = scannedData.registrationId;
        }
      } catch (e) {
        registrationId = data;
      }

      if (registrationId) {
        setIsScanning(false);
        fetchRegistrationDetails(registrationId);
      } else {
        setScannerError('Invalid QR code format.');
      }
    }
  };

  const resetScanner = () => {
    setScannedTicketId(null);
    setRegistrationDetails(null);
    setScannerLoading(false);
    setScannerError(null);
    setScannerSuccess(null);
    setIsScanning(true);
  };

  const handleDelete = (id) => {
    setRegistrationToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (registrationToDelete) {
      deleteRegistrationMutation.mutate(registrationToDelete);
      setIsDeleteConfirmOpen(false);
      setRegistrationToDelete(null);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredRegistrations.map(reg => ({
      'Registration ID': reg.registration_id,
      'Student Name': reg.user_id?.full_name || 'N/A',
      'Enrollment No': reg.user_id?.enrollment || 'N/A',
      'House': reg.user_id?.house || 'N/A',
      'Email': reg.user_id?.email || 'N/A',
      'Phone': reg.user_id?.phone || 'N/A',
      'Event Name': reg.event_id?.name || 'N/A',
      'Event Category': reg.event_id?.category || 'N/A',
      'Registration Date': reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A',
      'Payment Status': reg.payment_verified ? 'Paid' : 'Pending',
      'Registration Fee': reg.event_id?.registration_fee || 0,
      'Attendance': reg.attendance_marked ? 'Present' : 'Absent'
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Registrations exported successfully!');
  };

  const getPaymentBadge = (isVerified) => {
    if (isVerified) {
      return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    } else {
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Cultural: 'from-purple-500 to-pink-500',
      Technical: 'from-blue-500 to-cyan-500',
      Sports: 'from-green-500 to-emerald-500',
      Academic: 'from-orange-500 to-yellow-500',
      Social: 'from-red-500 to-rose-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const uniqueEvents = [...new Set(registrations.map(r => r.event_id?.name).filter(Boolean))];
  
  const filteredRegistrations = registrations
    .filter(r => selectedEvent === 'all' || r.event_id?.name === selectedEvent)
    .filter(r => selectedHouse === 'all' || r.user_id?.house === selectedHouse)
    .filter(r => 
      (r.user_id?.full_name && r.user_id.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.event_id?.name && r.event_id.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.user_id?.email && r.user_id.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.user_id?.house && r.user_id.house.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof r.ticket_id === 'string' && r.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const stats = {
    total: filteredRegistrations.length,
    paid: filteredRegistrations.filter(r => r.payment_verified).length,
    pending: filteredRegistrations.filter(r => !r.payment_verified && r.event_id?.registration_fee > 0).length,
    revenue: filteredRegistrations
      .filter(r => r.payment_verified)
      .reduce((sum, r) => sum + (r.event_id?.registration_fee || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900 p-6">

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this registration?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl my-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Registration Details</h2>
              <button 
                onClick={() => setViewDetails(null)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Registration ID</p>
                <p className="text-white font-semibold text-lg">{viewDetails.registration_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Student Name</p>
                  <p className="text-white font-semibold">{viewDetails.user_id?.full_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Enrollment No</p>
                  <p className="text-white font-semibold">{viewDetails.user_id?.enrollment || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">House</p>
                  <p className={`font-bold text-lg ${houseTextColors[viewDetails.user_id?.house] || 'text-gray-400'}`}>
                    {viewDetails.user_id?.house || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{viewDetails.event_id?.category || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <p className="text-gray-400 text-sm">Email</p>
                  </div>
                  <p className="text-white">{viewDetails.user_id?.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <p className="text-gray-400 text-sm">Phone</p>
                  </div>
                  <p className="text-white">{viewDetails.user_id?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Event</p>
                <p className="text-white font-semibold text-lg">{viewDetails.event_id?.name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Registration Date</p>
                  <p className="text-white">{viewDetails.createdAt ? new Date(viewDetails.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentBadge(viewDetails.payment_verified).bg} ${getPaymentBadge(viewDetails.payment_verified).text} ${getPaymentBadge(viewDetails.payment_verified).border}`}>
                    {viewDetails.payment_verified ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Registration Fee</p>
                <p className="text-white font-bold text-2xl">₹{viewDetails.event_id?.registration_fee || 0}</p>
              </div>

              {viewDetails.event_id?.registration_fee > 0 && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Transaction ID</p>
                  <p className="text-white font-semibold text-lg">{viewDetails.transaction_id || 'N/A'}</p>
                </div>
              )}

              {viewDetails.event_id?.registration_fee > 0 && viewDetails.payment_screenshot_url && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Payment Screenshot</p>
                  <a href={viewDetails.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                    <img src={viewDetails.payment_screenshot_url} alt="Payment Screenshot" className="w-48 h-auto object-contain rounded-lg mt-2" />
                  </a>
                </div>
              )}

              {viewDetails.event_id?.registration_fee > 0 && !viewDetails.payment_verified && (
                <button 
                  onClick={() => handleVerifyPayment(viewDetails._id)}
                  disabled={verifyPaymentMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg transition-all text-sm font-medium"
                >
                  {verifyPaymentMutation.isPending ? 'Verifying...' : <><CheckCircle className="w-4 h-4" /> Verify Payment</>}
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AttendanceScannerComponent
            scannedTicketId={scannedTicketId}
            registrationDetails={registrationDetails}
            loading={scannerLoading}
            error={scannerError}
            success={scannerSuccess}
            isScanning={isScanning}
            handleScan={handleScan}
            resetScanner={resetScanner}
            markAttendance={markAttendance}
          />
          <div className="glass-card p-6 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-white">Scanned Attendees ({scannedCount})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scannedUsers.length === 0 ? (
                <p className="text-gray-400">No attendees scanned yet.</p>
              ) : (
                scannedUsers.map((user, index) => (
                  <div key={index} className="bg-gray-900/50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{user.user_id?.full_name || user.event_id?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-400">{user.status_message} at {user.scan_time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status_message === 'Marked Present' ? 'bg-green-500/20 text-green-400' :
                      user.status_message === 'Already Present' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status_message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Event Registrations
            </h1>
            <p className="text-gray-400">Manage and track all event registrations</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Registrations</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.paid}</span>
            </div>
            <p className="text-gray-400 text-sm">Paid Registrations</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.pending}</span>
            </div>
            <p className="text-gray-400 text-sm">Pending Payments</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">₹{stats.revenue}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by name, event, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="all">All Events</option>
                  {uniqueEvents.map((event) => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedHouse}
                  onChange={(e) => setSelectedHouse(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="all">All Houses</option>
                  {houses.map((house) => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => {
              const paymentBadge = getPaymentBadge(registration.payment_verified);
              const houseGradient = houseColors[registration.user_id?.house] || 'from-gray-500 to-gray-600';
              
              return (
                <div 
                  key={registration._id}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${houseGradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                          {registration.user_id?.full_name?.charAt(0) || 'U'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">{registration.user_id?.full_name || 'N/A'}</h3>
                            <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                              {registration.registration_id}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${houseTextColors[registration.user_id?.house] || 'text-gray-400'} bg-${registration.user_id?.house}-500/20 border-${registration.user_id?.house}-500/30`}>
                              {registration.user_id?.house || 'N/A'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${paymentBadge.bg} ${paymentBadge.text} ${paymentBadge.border}`}>
                              {registration.event_id?.registration_fee > 0 ? (registration.payment_verified ? 'PAID' : 'PENDING') : 'FREE'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${registration.attendance_marked ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                              {registration.attendance_marked ? 'PRESENT' : 'ABSENT'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{registration.user_id?.email || registration.student_email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{registration.user_id?.phone || registration.phone || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getCategoryColor(registration.event_id?.category)}`} />
                                <span className="text-xs text-gray-400">Event</span>
                              </div>
                              <p className="text-white font-semibold text-sm truncate">{registration.event_id?.name || 'N/A'}</p>
                              <p className="text-gray-500 text-xs">{registration.event_id?.category || 'N/A'}</p>
                            </div>
                            
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-3 h-3 text-cyan-400" />
                                <span className="text-xs text-gray-400">Registered On</span>
                              </div>
                              <p className="text-white font-semibold text-sm">
                                {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {registration.createdAt ? new Date(registration.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </p>
                            </div>
                            
                            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">Fee</span>
                              </div>
                              <p className="text-white font-bold text-lg">
                                ₹{registration.event_id?.registration_fee || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-40 flex flex-row lg:flex-col gap-2">
                      <button 
                        onClick={() => setViewDetails(registration)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/30 rounded-lg transition-all text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button 
                        onClick={() => handleDelete(registration._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-all text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Registrations Found</h3>
              <p className="text-gray-500">No registrations match your current filters</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}