import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useStoreInitializer } from '../stores/storeInitializer';

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
    initialize: initializeAuth
  } = useAuthStore();

  const { initializeAllStores } = useStoreInitializer();
  const hasInitializedStores = useRef(false);

  useEffect(() => {
    const initStores = async () => {
      try {
        await initializeAuth();
        
        // Only initialize other stores once when auth is ready
        if (isAuthenticated && !hasInitializedStores.current) {
          hasInitializedStores.current = true;
          await initializeAllStores();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };
    
    initStores();
  }, []); // Only run once on mount

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
      // This function is not directly available in the new store,
      // so it will be removed or refactored if needed.
      // For now, we'll return a placeholder or remove it if not used.
      // Given the new_code, it seems the intent was to remove this function
      // or refactor it to use the store's verifyEmail.
      // For now, we'll return a placeholder.
      console.warn("verifyEmail is not directly available in the new store. This function will be removed or refactored.");
      return { success: false, message: "verifyEmail functionality not implemented in new store" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendVerification = async (email) => {
    try {
      // This function is not directly available in the new store,
      // so it will be removed or refactored if needed.
      // For now, we'll return a placeholder or remove it if not used.
      // Given the new_code, it seems the intent was to remove this function
      // or refactor it to use the store's resendVerification.
      // For now, we'll return a placeholder.
      console.warn("resendVerification is not directly available in the new store. This function will be removed or refactored.");
      return { success: false, message: "resendVerification functionality not implemented in new store" };
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
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
