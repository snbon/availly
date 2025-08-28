import { useAuthStore } from './authStore';
import { useDashboardStore } from './dashboardStore';
import { useAvailabilityStore } from './availabilityStore';
import { useLinksStore } from './linksStore';
import { useAnalyticsStore } from './analyticsStore';
import { setClearFunction } from './authStore';

// Industry-standard store initialization manager
class StoreInitializationManager {
  constructor() {
    this.initializationState = {
      isInitializing: false,
      hasInitialized: false,
      lastInitialized: null,
      error: null
    };
    
    this.initializationPromise = null;
  }

  // Check if stores need initialization
  shouldInitialize() {
    const { hasInitialized, lastInitialized } = this.initializationState;
    
    // Never initialized
    if (!hasInitialized) return true;
    
    // Check if data is stale (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (lastInitialized && lastInitialized < fiveMinutesAgo) return true;
    
    return false;
  }

  // Initialize all stores with proper error handling and loading states
  async initializeAllStores(force = false) {
    // Prevent multiple simultaneous initializations
    if (this.initializationState.isInitializing && !force) {
      console.log('Stores already initializing, returning existing promise...');
      return this.initializationPromise;
    }

    // If already initialized and not forced, return cached promise
    if (this.initializationState.hasInitialized && !force) {
      console.log('Stores already initialized, skipping...');
      return Promise.resolve();
    }

    // Additional safety check - prevent initialization if auth is not ready
    const authStore = useAuthStore.getState();
    if (!authStore.isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping store initialization...');
      return Promise.resolve();
    }

    // Check if stores are already initialized and data is fresh
    if (!force) {
      const dashboardStore = useDashboardStore.getState();
      const availabilityStore = useAvailabilityStore.getState();
      const linksStore = useLinksStore.getState();
      const analyticsStore = useAnalyticsStore.getState();
      
      if (dashboardStore.isInitialized && 
          availabilityStore.isInitialized && 
          linksStore.isInitialized && 
          analyticsStore.isInitialized) {
        console.log('✅ All stores already initialized with fresh data, skipping...');
        this.initializationState.hasInitialized = true;
        this.initializationState.lastInitialized = Date.now();
        return Promise.resolve();
      }
    }

    try {
      this.initializationState.isInitializing = true;
      this.initializationState.error = null;
      
      console.log('🚀 Initializing all stores for seamless dashboard experience...');
      
      // Create initialization promise
      this.initializationPromise = this._performInitialization();
      
      // Wait for completion
      await this.initializationPromise;
      
      // Update state
      this.initializationState.hasInitialized = true;
      this.initializationState.lastInitialized = Date.now();
      this.initializationState.isInitializing = false;
      
      console.log('✅ All dashboard stores initialized successfully - ready for seamless navigation!');
      
    } catch (error) {
      console.error('❌ Failed to initialize stores:', error);
      this.initializationState.error = error;
      this.initializationState.isInitializing = false;
      throw error;
    }
  }

  // Perform the actual initialization
  async _performInitialization() {
    const dashboardStore = useDashboardStore.getState();
    const availabilityStore = useAvailabilityStore.getState();
    const linksStore = useLinksStore.getState();
    const analyticsStore = useAnalyticsStore.getState();

    // Initialize stores in specific order for dependencies
    // Availability first (needed by dashboard), then dashboard, then others
    const initializationPromises = [
      this._initializeStore(availabilityStore, 'Availability'),
      this._initializeStore(dashboardStore, 'Dashboard'),
      this._initializeStore(linksStore, 'Links'),
      this._initializeStore(analyticsStore, 'Analytics')
    ];

    // Wait for all stores to initialize
    await Promise.allSettled(initializationPromises);
    
    // Check for any failed initializations
    const results = await Promise.allSettled(initializationPromises);
    const failedStores = results
      .map((result, index) => ({ result, name: ['Availability', 'Dashboard', 'Links', 'Analytics'][index] }))
      .filter(({ result }) => result.status === 'rejected');
    
    if (failedStores.length > 0) {
      console.warn('⚠️ Some stores failed to initialize:', failedStores.map(f => f.name));
    }
  }

  // Initialize individual store with proper error handling
  async _initializeStore(store, storeName) {
    try {
      console.log(`🔄 Initializing ${storeName} store...`);
      
      if (store.isInitialized) {
        console.log(`✅ ${storeName} store already initialized, skipping...`);
        return;
      }
      
      await store.initialize();
      console.log(`✅ ${storeName} store initialized successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize ${storeName} store:`, error);
      throw error;
    }
  }

  // Initialize dashboard stores for first load (with fresh data)
  async initializeDashboardStores(force = false) {
    if (this.initializationState.isInitializing && !force) {
      console.log('Dashboard stores already initializing, skipping...');
      return;
    }

    // Additional safety check - prevent initialization if auth is not ready
    const authStore = useAuthStore.getState();
    if (!authStore.isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping dashboard store initialization...');
      return;
    }

    try {
      this.initializationState.isInitializing = true;
      console.log('🚀 Initializing dashboard stores for first load...');
      
      // Force fresh data fetch for optimal UX
      const dashboardStore = useDashboardStore.getState();
      const availabilityStore = useAvailabilityStore.getState();
      const linksStore = useLinksStore.getState();
      const analyticsStore = useAnalyticsStore.getState();

      // Fetch fresh data in parallel
      await Promise.allSettled([
        dashboardStore.fetchDashboardData(true),
        availabilityStore.fetchAvailabilityRules(true),
        linksStore.fetchLinks(true),
        analyticsStore.fetchLinkAnalytics(true)
      ]);
      
      this.initializationState.hasInitialized = true;
      this.initializationState.lastInitialized = Date.now();
      console.log('✅ Dashboard stores ready for seamless tab navigation!');
      
    } catch (error) {
      console.error('❌ Failed to initialize dashboard stores:', error);
      throw error;
    } finally {
      this.initializationState.isInitializing = false;
    }
  }

  // Get current initialization state
  getInitializationState() {
    return { ...this.initializationState };
  }

  // Reset initialization state (useful for logout)
  resetInitialization() {
    this.initializationState = {
      isInitializing: false,
      hasInitialized: false,
      lastInitialized: null,
      error: null
    };
    this.initializationPromise = null;
    console.log('🔄 Store initialization state reset');
  }

  // Check if stores are ready
  areStoresReady() {
    return this.initializationState.hasInitialized && !this.initializationState.isInitializing;
  }
}

// Create singleton instance
const storeManager = new StoreInitializationManager();

// Set the clear function in auth store
setClearFunction(() => storeManager.resetInitialization());

// Main store initializer hook
export const useStoreInitializer = () => {
  const { initialize: initializeAuth, isAuthenticated, isInitialized: authInitialized } = useAuthStore();
  const { initialize: initializeDashboard } = useDashboardStore();
  const { initialize: initializeAvailability } = useAvailabilityStore();
  const { initialize: initializeLinks } = useLinksStore();
  const { initialize: initializeAnalytics } = useAnalyticsStore();

  const initializeAllStores = async (force = false) => {
    return storeManager.initializeAllStores(force);
  };

  const initializeDashboardStores = async (force = false) => {
    return storeManager.initializeDashboardStores(force);
  };

  const resetInitialization = () => {
    storeManager.resetInitialization();
  };

  const getInitializationState = () => {
    return storeManager.getInitializationState();
  };

  const areStoresReady = () => {
    return storeManager.areStoresReady();
  };

  return {
    initializeAllStores,
    initializeDashboardStores,
    resetInitialization,
    getInitializationState,
    areStoresReady,
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
  
  // Reset initialization state
  storeManager.resetInitialization();
};
