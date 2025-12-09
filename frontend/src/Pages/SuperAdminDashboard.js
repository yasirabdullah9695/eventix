import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../Components/ui/Card';
import { Input } from '../Components/ui/Input';
import { Button } from '../Components/ui/Button';
import { Label } from '../Components/ui/Label';
import { Textarea } from '../Components/ui/Textarea';
import { Loader2, Send } from 'lucide-react';

const API_URL = "http://localhost:5000/api";

const sendBroadcast = async ({ title, message, token }) => {
    console.log("Attempting to send broadcast with:", { title, message });
    const res = await fetch(`${API_URL}/notifications/global`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.message || 'Failed to send notification');
    }

    console.log("Broadcast successful, server response:", responseData);
    return responseData;
};

const BroadcastNotificationForm = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const mutation = useMutation({
        mutationFn: sendBroadcast,
        onSuccess: (data) => {
            console.log(`✅ Notification sent to ${data.count} users!`);
            setTitle('');
            setMessage('');
        },
        onError: (error) => {
            console.error(`❌ Error sending notification:`, error);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Handle submit called.");
        const token = localStorage.getItem('token');
        if (!title || !message) {
            console.error("Validation failed: Title and message are required.");
            return;
        }
        if (!token) {
            console.error("Authentication error: No token found.");
            return;
        }
        console.log("Mutation will be called with:", { title, message, token });
        mutation.mutate({ title, message, token });
    };

    return (
        <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Global Notification</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="title" className="text-gray-900 font-semibold">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter notification title"
                        className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg"
                    />
                </div>
                <div>
                    <Label htmlFor="message" className="text-gray-900 font-semibold">Message</Label>
                    <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message for all users"
                        className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg"
                        rows={4}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send Notification
                        </>
                    )}
                </Button>
            </form>
        </Card>
    );
}


const SuperAdminDashboard = () => {
    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-lg text-gray-600">Tools for site-wide management.</p>
            </div>
            <BroadcastNotificationForm />
        </div>
    );
};

export default SuperAdminDashboard;