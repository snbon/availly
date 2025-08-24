import { create } from 'zustand';
import { api } from '../services/api';

const useCalendarStore = create((set, get) => ({
  // State
  events: [],
  isLoading: false,
  isInitialized: false,
  lastFetched: null,
  currentDateRange: null,
  
  // Actions
  setEvents: (events) => set({ events }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Check if we need to fetch (cache for 5 minutes)
  shouldFetch: (startDate, endDate) => {
    const state = get();
    if (!state.lastFetched) return true;
    if (!state.currentDateRange) return true;
    
    // Check if date range changed
    if (state.currentDateRange.start !== startDate || state.currentDateRange.end !== endDate) {
      return true;
    }
    
    // Check if cache expired (5 minutes)
    const cacheAge = Date.now() - state.lastFetched;
    return cacheAge > 5 * 60 * 1000; // 5 minutes
  },
  
  // Fetch calendar events for date range
  fetchEvents: async (startDate, endDate, force = false) => {
    const state = get();
    
    // Don't fetch if already loading
    if (state.isLoading && !force) {
      return state.events;
    }
    
    // Check cache first
    if (!force && !state.shouldFetch(startDate, endDate)) {
      console.log('📋 Using cached calendar events');
      return state.events;
    }
    
    try {
      set({ isLoading: true });
      
      console.log(`🗓️ Fetching calendar events: ${startDate} to ${endDate}`);
      const startTime = Date.now();
      
      const response = await api.get(`/me/calendar/events?start_date=${startDate}&end_date=${endDate}`);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Calendar events loaded in ${duration}ms:`, response.events?.length || 0, 'events');
      
      const events = response.events || [];
      
      set({
        events,
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now(),
        currentDateRange: { start: startDate, end: endDate }
      });
      
      return events;
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      set({ 
        events: [],
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now(),
        currentDateRange: { start: startDate, end: endDate }
      });
      return [];
    }
  },
  
  // Initialize calendar store
  initialize: async (startDate, endDate) => {
    const state = get();
    if (state.isInitialized && !state.shouldFetch(startDate, endDate)) {
      console.log('Calendar store already initialized with current date range, skipping...');
      return;
    }
    
    console.log('Initializing calendar store...');
    await get().fetchEvents(startDate, endDate);
  },
  
  // Clear store
  clear: () => set({
    events: [],
    isLoading: false,
    isInitialized: false,
    lastFetched: null,
    currentDateRange: null
  }),
  
  // Refresh events (force fetch)
  refresh: async (startDate, endDate) => {
    console.log('Refreshing calendar events...');
    return await get().fetchEvents(startDate, endDate, true);
  }
}));

export { useCalendarStore };
