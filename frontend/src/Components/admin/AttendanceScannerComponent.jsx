import React from 'react';
import QRScanner from './QRScanner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { CheckCircle, XCircle, Loader2, User, Calendar, Tag, MapPin, Phone, Mail, Award, Home, Scan } from 'lucide-react';

export default function AttendanceScannerComponent({
  scannedTicketId,
  registrationDetails,
  loading,
  error,
  success,
  isScanning,
  handleScan,
  resetScanner,
  markAttendance,
}) {
  return (
    <div className="p-4 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Attendance Scanner</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-500/20 border-green-500/30 text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Scanner Section */}
        <div className="glass-card p-6 rounded-lg border border-gray-800 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4">Scan QR Code</h2>
          {isScanning ? (
            <QRScanner onScan={handleScan} />
          ) : (
            <div className="text-center">
              <Scan className="w-24 h-24 text-gray-500 mx-auto mb-4" />
              <p className="text-lg text-gray-400">Scan complete. Details loaded.</p>
              <Button onClick={resetScanner} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                Scan Another
              </Button>
            </div>
          )}
        </div>

        {/* Registration Details Section */}
        <div className="glass-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Registration Details</h2>
          {registrationDetails ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <User className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">{registrationDetails.user_id?.full_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{registrationDetails.user_id?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{registrationDetails.user_id?.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Home className="w-4 h-4 text-gray-400" />
                <span>{registrationDetails.user_id?.branch}, {registrationDetails.user_id?.year} Year</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Award className="w-4 h-4 text-gray-400" />
                <span>House: {registrationDetails.user_id.house?.name || 'N/A'}</span>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4 space-y-3">
                <h3 className="text-xl font-semibold">Event: {registrationDetails.event_id?.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>{registrationDetails.event_id?.date && new Date(registrationDetails.event_id.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>{registrationDetails.event_id?.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Tag className="w-4 h-4 text-green-400" />
                  <span>Category: {registrationDetails.event_id?.category}</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">Attendance Status:</h3>
                {registrationDetails.attendance_marked ? (
                  <p className="text-green-500 flex items-center gap-2 text-lg font-medium">
                    <CheckCircle className="w-6 h-6" /> Present
                  </p>
                ) : (
                  <p className="text-yellow-500 flex items-center gap-2 text-lg font-medium">
                    <XCircle className="w-6 h-6" /> Not Marked
                  </p>
                )}

                {!registrationDetails.attendance_marked && (
                  <Button 
                    onClick={markAttendance} 
                    disabled={loading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                    {loading ? 'Marking...' : 'Mark as Present'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Scan a QR code to view registration details.</p>
          )}
        </div>
      </div>
    </div>
  );
}