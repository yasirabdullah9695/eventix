import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function EventForm({ initialData: event, onSuccess }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState(() => {
    const initialDate = event ? new Date(event.date) : new Date();
    const dateString = initialDate.toISOString().split('T')[0];
    const timeString = initialDate.toTimeString().split(' ')[0].substring(0, 5);

    return {
      name: event?.name || '',
      date: dateString,
      time: timeString,
      location: event?.location || '',
      description: event?.description || '',
      category: event?.category || 'Cultural',
      registration_fee: event?.registration_fee || 0,
      max_participants: event?.max_participants || '',
      house_points: event?.house_points || 0,
      status: event?.status || 'upcoming',
      payment_qr_url: event?.payment_qr_url || null, // Add this line
    };
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(event?.cover_image_url || null);

  const [paymentQrFile, setPaymentQrFile] = useState(null); // Add this line
  const [paymentQrPreview, setPaymentQrPreview] = useState(event?.payment_qr_url || null); // Add this line

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentQrChange = (e) => {
    const file = e.target.files[0];
    console.log('handlePaymentQrChange called, file:', file);
    if (file) {
      setPaymentQrFile(file);
      setPaymentQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('EventForm: handleSubmit triggered');

    if (!token) {
      toast.error('You must be logged in to create or update an event');
      return;
    }

    try {
      console.log('EventForm: Starting form validation');
      // ... (all validation logic remains the same)

      const eventData = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          eventData.append(key, formData[key]);
        }
      }
      if (coverImageFile) {
        eventData.append('cover_image', coverImageFile);
      }
      if (paymentQrFile) {
        eventData.append('payment_qr', paymentQrFile);
      }
      const url = event ? `${API_URL}/events/${event._id}` : `${API_URL}/events`;
      const method = event ? 'PUT' : 'POST';

      console.log(`EventForm: Sending ${method} request to ${url}`);
      // Log FormData contents for debugging
      for (let pair of eventData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }
      if (!event) {
        toast.info('Submitting event...');
      }
      
      const submitResponse = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: eventData,
      });

      console.log('EventForm: Received response with status:', submitResponse.status);

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        console.error('EventForm: Server responded with an error:', errorData);
        throw new Error(errorData.message || 'Failed to submit event');
      }

      console.log('EventForm: Event submission was successful');
      toast.success(event ? 'Event updated successfully!' : 'Event created successfully!');
      if (onSuccess) {
        console.log('EventForm: Calling onSuccess callback');
        onSuccess();
      }

    } catch (error) {
      console.error('EventForm: An error occurred in handleSubmit:', error);
      toast.error(error.message || 'Failed to submit event. Please try again.');
    }
  }, [token, formData, coverImageFile, paymentQrFile, event, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input 
          type="text"
          placeholder="Enter event name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea 
          placeholder="Brief description of the event..." 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Date <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Time <span className="text-red-500">*</span>
          </label>
          <input 
            type="time" 
            value={formData.time} 
            onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Location <span className="text-red-500">*</span>
        </label>
        <input 
          placeholder="Event venue" 
          value={formData.location} 
          onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Category <span className="text-red-500">*</span>
        </label>
        <select 
          onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
          value={formData.category} 
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          required
        >
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Technical">Technical</option>
          <option value="Academic">Academic</option>
          <option value="Social">Social</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Registration Fee</label>
          <input 
            type="number" 
            placeholder="0" 
            value={formData.registration_fee} 
            onChange={(e) => setFormData({ ...formData, registration_fee: Number(e.target.value) })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Max Participants</label>
          <input 
            type="number" 
            placeholder="Optional" 
            value={formData.max_participants} 
            onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">House Points</label>
          <input 
            type="number" 
            placeholder="0" 
            value={formData.house_points} 
            onChange={(e) => setFormData({ ...formData, house_points: Number(e.target.value) })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Status</label>
          <select 
            onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
            value={formData.status} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Cover Image</label>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="hidden"
            id="coverImage"
            name="cover_image"
          />
          <label 
            htmlFor="coverImage"
            className="flex items-center justify-center w-full px-4 py-8 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-all"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
            ) : (
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-gray-400 text-sm">Click to upload image</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Payment QR Code</label>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePaymentQrChange} 
            className="hidden"
            id="paymentQr"
            name="payment_qr"
          />
          <label 
            htmlFor="paymentQr"
            className="flex items-center justify-center w-full px-4 py-8 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-all"
          >
            {paymentQrPreview ? (
              <img src={paymentQrPreview} alt="Payment QR Preview" className="max-h-40 rounded-lg" />
            ) : (
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-gray-400 text-sm">Click to upload Payment QR</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {event ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
}