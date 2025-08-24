import { create } from 'zustand';
import { api } from '../services/api';

const useAnalyticsStore = create((set, get) => ({
  // State
  linkAnalytics: [],
  isLoading: false,
  isInitialized: false,
  lastFetched: null,
  
  // Actions
  setLinkAnalytics: (analytics) => set({ linkAnalytics: analytics }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Fetch link analytics
  fetchLinkAnalytics: async (force = false) => {
    const state = get();
    
    if (state.isLoading) return;
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      return state.linkAnalytics;
    }
    
    try {
      set({ isLoading: true });
      
      const response = await api.getLinkAnalytics();
      const analytics = response.analytics || [];
      
      set({
        linkAnalytics: analytics,
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now()
      });
      
      return analytics;
    } catch (error) {
      console.error('Failed to fetch link analytics:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Initialize store
  initialize: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('Analytics store already initialized, skipping...');
      return;
    }
    
    console.log('Initializing analytics store...');
    await get().fetchLinkAnalytics();
  },
  
  // Clear store
  clear: () => set({
    linkAnalytics: [],
    isLoading: false,
    isInitialized: false,
    lastFetched: null
  }),
  
  // Update specific analytics
  updateAnalytics: (analyticsId, updates) => set((state) => ({
    linkAnalytics: state.linkAnalytics.map(analytics =>
      analytics.id === analyticsId ? { ...analytics, ...updates } : analytics
    )
  }))
}));

export { useAnalyticsStore };
