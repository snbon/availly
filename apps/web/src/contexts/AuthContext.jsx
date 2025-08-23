import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await api.getCurrentUser();
        setUser(userData.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      
      if (response.requires_verification) {
        return { success: false, requiresVerification: true, message: response.message };
      }

      api.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      
      // Clean response handling
      if (response.requires_verification) {
        return { 
          success: false, 
          requiresVerification: true, 
          message: response.message,
          email: response.email 
        };
      }

      // Only set auth if registration is complete (no verification needed)
      if (response.token && response.user) {
        api.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      // Fallback
      return { success: false, message: 'Registration incomplete' };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      api.clearToken();
    }
  };

  const verifyEmail = async (verificationData) => {
    try {
      const response = await api.verifyEmail(verificationData);
      
      // After successful verification, log the user in
      if (response.user && response.token) {
        api.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return { success: true, message: response.message, user: response.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.resendVerification(email);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
