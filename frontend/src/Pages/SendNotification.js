import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const HeadlineSender = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Message cannot be empty.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Corrected API URL
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.post(
                `${API_URL}/notifications/headline`,
                { message },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Headline message sent successfully!');
            setMessage('');
        } catch (error) {
            toast.info('An error occurred. See console for details.');
            console.error('Error sending headline:', error);
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Failed to send headline. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.delete(
                `${API_URL}/notifications/headline`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Headline message deleted successfully!');
            setMessage('');
        } catch (error) {
            toast.info('An error occurred. See console for details.');
            console.error('Error deleting headline:', error);
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Failed to delete headline. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-center text-purple-400">Send Scrolling Headline</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter headline message"
                            rows="5"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Deleting...' : 'Delete Headline'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Headline'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeadlineSender;

