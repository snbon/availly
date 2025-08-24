import { useAuthStore } from './authStore';
import { useDashboardStore } from './dashboardStore';
import { useAvailabilityStore } from './availabilityStore';
import { useLinksStore } from './linksStore';
import { useAnalyticsStore } from './analyticsStore';

// Main store initializer hook
export const useStoreInitializer = () => {
  const { initialize: initializeAuth, isAuthenticated, isInitialized: authInitialized } = useAuthStore();
  const { initialize: initializeDashboard } = useDashboardStore();
  const { initialize: initializeAvailability } = useAvailabilityStore();
  const { initialize: initializeLinks } = useLinksStore();
  const { initialize: initializeAnalytics } = useAnalyticsStore();

  const initializeAllStores = async () => {
    try {
      // Check if already initialized
      const dashboardState = useDashboardStore.getState();
      const availabilityState = useAvailabilityStore.getState();
      const linksState = useLinksStore.getState();
      const analyticsState = useAnalyticsStore.getState();
      
      if (dashboardState.isInitialized && 
          availabilityState.isInitialized && 
          linksState.isInitialized && 
          analyticsState.isInitialized) {
        console.log('Stores already initialized, skipping...');
        return;
      }
      
      console.log('Initializing all stores...');
      
      // Initialize other stores in parallel
      await Promise.all([
        initializeDashboard(),
        initializeAvailability(),
        initializeLinks(),
        initializeAnalytics()
      ]);
      
      console.log('All stores initialized successfully');
    } catch (error) {
      console.error('Failed to initialize stores:', error);
    }
  };

  return {
    initializeAllStores,
    isAuthenticated,
    authInitialized
  };
};

// Utility function to clear all stores
export const clearAllStores = () => {
  useAuthStore.getState().clear();
  useDashboardStore.getState().clear();
  useAvailabilityStore.getState().clear();
  useLinksStore.getState().clear();
  useAnalyticsStore.getState().clear();
};
