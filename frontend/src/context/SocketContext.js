
import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

// Derive socket URL from environment variables
const deriveSocketUrl = () => {
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
    return 'http://127.0.0.1:5000';
};

const socketOptions = {
    path: '/socket.io/',
    transports: ['websocket'],
};

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => {
        const url = deriveSocketUrl();
        try {
            return io(url, socketOptions);
        } catch (err) {
            console.error('Socket initialization error:', err);
            return null;
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
