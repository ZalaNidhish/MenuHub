// frontend/src/context/AuthContext.jsx - FIXED VERSION
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Setup axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      console.log('👤 Fetching user data...');
      const response = await axios.get(`${API_URL}/api/auth/me`);
      console.log('✅ User data received:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credential) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Function to refresh user data
  const refreshUser = async () => {
    if (token) {
      await fetchUser();
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser, // Add this for manual refresh
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isUser: user?.role === 'user'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};