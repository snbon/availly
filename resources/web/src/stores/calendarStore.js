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
    
    // Check if we have events - if not, we should fetch
    if (!state.events || state.events.length === 0) {
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
      return state.events;
    }
    
    try {
      set({ isLoading: true });
      
      console.log('Calendar API: Fetching events for:', { startDate, endDate });
      const response = await api.get(`/me/calendar/events?start_date=${startDate}&end_date=${endDate}`);
      
      const events = response.events || [];
      console.log('Calendar API: Received events:', events.length);
      
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
  initialize: async (startDate, endDate, force = false) => {
    const state = get();
    if (state.isInitialized && !force && !state.shouldFetch(startDate, endDate)) {
      console.log('Calendar store already initialized with current date range, skipping...');
      return;
    }
    
    console.log('Initializing calendar store...', { force });
    await get().fetchEvents(startDate, endDate, force);
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
    return await get().fetchEvents(startDate, endDate, true);
  },
  
  // Force refresh after sync (clears cache and refetches)
  forceRefreshAfterSync: async (startDate, endDate) => {
    console.log('Force refreshing calendar after sync...');
    // Clear the cache and force a fresh fetch
    set({
      lastFetched: null,
      currentDateRange: null
    });
    return await get().fetchEvents(startDate, endDate, true);
  }
}));

export { useCalendarStore };
