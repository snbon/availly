import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading: loading, 
    login: storeLogin, 
    register: storeRegister, 
    logout: storeLogout,
    getCurrentUser,
    initialize: initializeAuth,
    verifyEmail: storeVerifyEmail,
    resendVerification: storeResendVerification
  } = useAuthStore();

  const hasInitializedAuth = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (hasInitializedAuth.current) {
        console.log('Auth already initialized in context, skipping...');
        return;
      }
      
      try {
        hasInitializedAuth.current = true;
        await initializeAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        hasInitializedAuth.current = false; // Reset on error
      }
    };
    
    initAuth();
  }, []); // Remove initializeAuth dependency to prevent re-runs

  const login = async (credentials) => {
    try {
      const user = await storeLogin(credentials);
      
      if (user.requires_verification) {
        return { success: false, requiresVerification: true, message: user.message };
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const user = await storeRegister(userData);
      
      // Clean response handling
      if (user.requires_verification) {
        return { 
          success: false, 
          requiresVerification: true, 
          message: user.message,
          email: user.email 
        };
      }

      // Only set auth if registration is complete (no verification needed)
      if (user.token && user.user) {
        return { success: true, user: user.user };
      }

      // Fallback
      return { success: false, message: 'Registration incomplete' };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await storeLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    }
  };

  const verifyEmail = async (verificationData) => {
    try {
      const user = await storeVerifyEmail(verificationData);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message || 'Email verification failed' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const result = await storeResendVerification(email);
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to resend verification email' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
