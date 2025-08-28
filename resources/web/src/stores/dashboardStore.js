import { create } from 'zustand';
import { api } from '../services/api';

const useDashboardStore = create((set, get) => ({
  // State
  dashboardData: {
    totalViews: 0,
    hasAvailability: false,
    thisWeekEvents: 0,
    userSlug: 'username'
  },
  isLoading: false,
  isInitialized: false,
  lastFetched: null,
  
  // Actions
  setDashboardData: (data) => set({ dashboardData: data }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Main fetch function - only fetches if not recently fetched
  fetchDashboardData: async (force = false) => {
    const state = get();
    
    // Skip if already loading
    if (state.isLoading) return;
    
    // Skip if recently fetched (within 5 minutes) and not forced
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      // Ensure we're marked as initialized even when returning cached data
      if (!state.isInitialized) {
        set({ isInitialized: true });
      }
      return state.dashboardData;
    }
    
    try {
      set({ isLoading: true });
      
      const response = await api.get('/me/dashboard/stats');
      const stats = response.stats;
      
      console.log('Dashboard API response:', response);
      console.log('Dashboard stats:', stats);
      
      const dashboardData = {
        totalViews: stats.total_views || 0,
        hasAvailability: stats.has_availability || false,
        thisWeekEvents: stats.this_week_events || 0,
        userSlug: stats.user_slug || 'username'
      };
      
      console.log('Processed dashboard data:', dashboardData);
      
      set({
        dashboardData,
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now()
      });
      
      return dashboardData;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Initialize store with data
  initialize: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('Dashboard store already initialized, skipping...');
      return state.dashboardData;
    }
    
    console.log('Initializing dashboard store...');
    await get().fetchDashboardData();
  },
  
  // Clear store data
  clear: () => set({
    dashboardData: {
      totalViews: 0,
      hasAvailability: false,
      thisWeekEvents: 0,
      userSlug: 'username'
    },
    isLoading: false,
    isInitialized: false,
    lastFetched: null
  }),
  
  // Update specific fields
  updateField: (field, value) => set((state) => ({
    dashboardData: {
      ...state.dashboardData,
      [field]: value
    }
  }))
}));

export { useDashboardStore };
