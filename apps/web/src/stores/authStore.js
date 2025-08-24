import { create } from 'zustand';
import { api } from '../services/api';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
      
      clearDashboard();
      clearAvailability();
      clearLinks();
      clearAnalytics();
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      set({ isLoading: true });
      
      const user = await api.getCurrentUser();
      
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
    try {
      await get().getCurrentUser();
    } catch (error) {
      // User not authenticated, clear token
      console.log('User not authenticated, clearing token...');
      api.clearToken();
      set({ isInitialized: true });
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
