import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStoreInitializer } from '../stores/storeInitializer';

const StoreInitializer = () => {
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { initializeAllStores } = useStoreInitializer();
  
  // Use refs to track if we've already initialized to prevent re-runs
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  // Define public routes where we don't need to initialize stores
  const isPublicRoute = useCallback(() => {
    const publicRoutes = ['/login', '/register', '/verify-email', '/'];
    return publicRoutes.includes(location.pathname) || location.pathname.startsWith('/u/');
  }, [location.pathname]);

  // Memoize the initialization function to prevent unnecessary re-renders
  const initializeStores = useCallback(async () => {
    // Only initialize ONCE when user first logs in
    // This should happen only on initial authentication, not on every page navigation
    if (isAuthenticated && !authLoading && !hasInitializedRef.current && !isInitializingRef.current) {
      try {
        isInitializingRef.current = true;
        console.log('🔐 User authenticated - initializing all dashboard stores once...');
        await initializeAllStores();
        hasInitializedRef.current = true;
        console.log('✅ All stores initialized - ready for seamless dashboard navigation');
      } catch (error) {
        console.error('❌ Failed to initialize stores:', error);
      } finally {
        isInitializingRef.current = false;
      }
    }
  }, [isAuthenticated, authLoading, initializeAllStores]);

  // Main effect - only run when auth state changes
  useEffect(() => {
    initializeStores();
    
    // Cleanup function to reset refs when auth state changes
    return () => {
      if (!isAuthenticated) {
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
      }
    };
  }, [initializeStores, isAuthenticated]);

  // Keep stores initialized across all dashboard navigation
  // Only reset on logout (handled by auth cleanup)

  // This component doesn't render anything visible
  return null;
};

export default StoreInitializer;
