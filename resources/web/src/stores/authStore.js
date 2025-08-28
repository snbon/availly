import { create } from 'zustand';
import { api } from '../services/api';
import { useDashboardStore } from './dashboardStore';
import { useAvailabilityStore } from './availabilityStore';
import { useLinksStore } from './linksStore';
import { useAnalyticsStore } from './analyticsStore';
import { useCalendarStore } from './calendarStore';

// Import the clear function
let clearAllStores = () => {};

// Function to set the clear function (called from storeInitializer)
export const setClearFunction = (fn) => {
  clearAllStores = fn;
};

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent redirect during initialization
  isInitialized: false,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Login
  login: async (credentials) => {
    try {
      set({ isLoading: true });
      
      const response = await api.login(credentials);
      const { user, token } = response;
      
      api.setToken(token);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      });
      
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Register
  register: async (userData) => {
    try {
      set({ isLoading: true });
      
      const response = await api.register(userData);
      const { user, token } = response;
      
      api.setToken(token);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      });
      
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      // Clear all other stores
      const { clear: clearDashboard } = useDashboardStore.getState();
      const { clear: clearAvailability } = useAvailabilityStore.getState();
      const { clear: clearLinks } = useLinksStore.getState();
      const { clear: clearAnalytics } = useAnalyticsStore.getState();
      const { clear: clearCalendar } = useCalendarStore.getState();
      
      clearDashboard();
      clearAvailability();
      clearLinks();
      clearAnalytics();
      clearCalendar();
      
      // Reset initialization state using the store manager
      clearAllStores();
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      set({ isLoading: true });
      
      const response = await api.getCurrentUser();
      const user = response.user;
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      });
      
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Initialize auth
  initialize: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('Auth store already initialized, skipping...');
      return;
    }
    
    console.log('Initializing auth store...');
    
    // Check if there's a token first
    if (!api.token) {
      console.log('No auth token found, user not authenticated');
      set({ 
        isInitialized: true,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      await get().getCurrentUser();
    } catch (error) {
      // User not authenticated, clear token
      console.log('User not authenticated, clearing token...');
      api.clearToken();
      set({ 
        isInitialized: true,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
    }
  },
  
  // Clear store
  clear: () => set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false
  }),
  
  // Update user profile
  updateProfile: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
}));

export { useAuthStore };
