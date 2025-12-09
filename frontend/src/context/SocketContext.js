
import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', { path: '/socket.io/' });
const SocketContext = createContext(socket);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
