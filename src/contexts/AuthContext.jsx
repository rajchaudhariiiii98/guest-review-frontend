import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded master user credentials
  const MASTER_EMAIL = 'master@review.com';
  const MASTER_PASSWORD = 'admin123';
  const MASTER_USER_OBJ = {
    username: 'Master',
    email: MASTER_EMAIL,
    role: 'Master',
    _id: 'master-user',
  };

  const API_BASE_URL = 'https://guest-review-backend.onrender.com/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could verify the token here by making a request to the backend
      // For now, we'll assume the token is valid if it exists
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Check for master user first
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
      localStorage.setItem('token', 'master-token');
      localStorage.setItem('user', JSON.stringify(MASTER_USER_OBJ));
      setUser(MASTER_USER_OBJ);
      return { success: true };
    }
    // Fallback to backend login for other users
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

