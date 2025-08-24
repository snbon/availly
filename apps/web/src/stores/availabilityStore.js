import { create } from 'zustand';
import { api } from '../services/api';

const useAvailabilityStore = create((set, get) => ({
  // State
  availabilityRules: [],
  exceptions: [],
  isLoading: false,
  isInitialized: false,
  lastFetched: null,
  
  // Actions
  setAvailabilityRules: (rules) => set({ availabilityRules: rules }),
  
  setExceptions: (exceptions) => set({ exceptions }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Fetch availability rules
  fetchAvailabilityRules: async (force = false) => {
    const state = get();
    
    if (state.isLoading) return;
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      return state.availabilityRules;
    }
    
    try {
      set({ isLoading: true });
      
      const response = await api.get('/me/availability-rules');
      const rules = response.rules || [];
      
      set({
        availabilityRules: rules,
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now()
      });
      
      return rules;
    } catch (error) {
      console.error('Failed to fetch availability rules:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Fetch exceptions
  fetchExceptions: async (force = false) => {
    const state = get();
    
    if (state.isLoading) return;
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      return state.exceptions;
    }
    
    try {
      set({ isLoading: true });
      
      const response = await api.get('/me/exceptions');
      const exceptions = response.exceptions || [];
      
      set({
        exceptions,
        isLoading: false,
        lastFetched: Date.now()
      });
      
      return exceptions;
    } catch (error) {
      console.error('Failed to fetch exceptions:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Create new availability rule
  createAvailabilityRule: async (ruleData) => {
    try {
      const response = await api.createAvailabilityRule(ruleData);
      const newRule = response.rule;
      
      set((state) => ({
        availabilityRules: [...state.availabilityRules, newRule]
      }));
      
      return newRule;
    } catch (error) {
      console.error('Failed to create availability rule:', error);
      throw error;
    }
  },
  
  // Create new exception
  createException: async (exceptionData) => {
    try {
      const response = await api.createException(exceptionData);
      const newException = response.exception;
      
      set((state) => ({
        exceptions: [...state.exceptions, newException]
      }));
      
      return newException;
    } catch (error) {
      console.error('Failed to create exception:', error);
      throw error;
    }
  },
  
  // Initialize store
  initialize: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('Availability store already initialized, skipping...');
      return;
    }
    
    console.log('Initializing availability store...');
    await Promise.all([
      get().fetchAvailabilityRules(),
      get().fetchExceptions()
    ]);
  },
  
  // Clear store
  clear: () => set({
    availabilityRules: [],
    exceptions: [],
    isLoading: false,
    isInitialized: false,
    lastFetched: null
  }),
  
  // Update specific rule
  updateRule: (ruleId, updates) => set((state) => ({
    availabilityRules: state.availabilityRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    )
  })),
  
  // Remove rule
  removeRule: (ruleId) => set((state) => ({
    availabilityRules: state.availabilityRules.filter(rule => rule.id !== ruleId)
  }))
}));

export { useAvailabilityStore };
