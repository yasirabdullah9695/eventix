
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext'; // Import useSocket

export const API_URL = "http://localhost:5000/api";
export const BASE_URL = "http://localhost:5000";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true); // Add loading state
  const socket = useSocket(); // Get socket instance

  useEffect(() => {
    if (user && socket) {
      socket.emit('join', user._id);
      console.log(`User ${user._id} joining socket room.`);
    }
  }, [user, socket]);

  const fetchUserData = async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
              if (response.ok) {
                const userData = await response.json();
                console.log('fetchUserData: User data received from API:', userData); // Added debug log
                // Only update user state if the user data has actually changed to prevent unnecessary re-renders
                if (!user || user._id !== userData._id) {
                  setUser(userData);
                  console.log('User data set in AuthContext:', userData);
                }
              } else {        // Token might be invalid or expired
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log("API_URL before login request:", `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      await fetchUserData(newToken); // Fetch user data immediately after login
      return response.data; // Return response data for potential role checking in Login.jsx
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      console.log("API_URL before admin login request:", `${API_URL}/auth/admin-login`);
      const response = await axios.post(`${API_URL}/auth/admin-login`, { email, password });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      await fetchUserData(newToken);
      return response.data;
    } catch (error) {
      console.error("Admin login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = React.useMemo(() => ({
    user,
    token,
    loading,
    login,
    adminLogin,
    logout,
    isAuthenticated: !!token,
    setUser,
    BASE_URL,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
