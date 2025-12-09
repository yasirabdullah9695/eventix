
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../Components/ui/Button';
import { Card } from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Input';
import { Textarea } from '../../Components/ui/Textarea';
import { useAuth } from '../../context/AuthContext';
import { Send } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function SendNotificationPage() {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general'); // Default type

  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData) => {
      const response = await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return response.json();
    },
    onSuccess: () => {
      // Handle success (e.g., show a success message, clear the form)
      console.log('Notification sent successfully!');
      setTitle('');
      setMessage('');
    },
    onError: (error) => {
      // Handle error (e.g., show an error message)
      console.error('Error sending notification:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) {
      // Basic validation
      alert('Please fill in both title and message.');
      return;
    }

    sendNotificationMutation.mutate({
      title,
      message,
      type,
      // You can add more fields here if needed, like a link
    });
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Send Notification</h1>
        
        <Card className="glass-card p-6 border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message"
                className="w-full"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-800 text-white border-gray-700 rounded-md p-2"
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="voting">Voting</option>
                <option value="leaderboard">Leaderboard</option>
              </select>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={sendNotificationMutation.isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendNotificationMutation.isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
