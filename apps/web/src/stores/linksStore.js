import { create } from 'zustand';
import { api } from '../services/api';

const useLinksStore = create((set, get) => ({
  // State
  links: [],
  isLoading: false,
  isInitialized: false,
  lastFetched: null,
  
  // Actions
  setLinks: (links) => set({ links }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  // Fetch links
  fetchLinks: async (force = false) => {
    const state = get();
    
    if (state.isLoading) return;
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      return state.links;
    }
    
    try {
      set({ isLoading: true });
      
      const response = await api.getLinks();
      const links = response.links || [];
      
      set({
        links,
        isLoading: false,
        isInitialized: true,
        lastFetched: Date.now()
      });
      
      return links;
    } catch (error) {
      console.error('Failed to fetch links:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Create new link
  createLink: async (linkData) => {
    try {
      const response = await api.createLink(linkData);
      const newLink = response.link;
      
      set((state) => ({
        links: [...state.links, newLink]
      }));
      
      return newLink;
    } catch (error) {
      console.error('Failed to create link:', error);
      throw error;
    }
  },
  
  // Initialize store
  initialize: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('Links store already initialized, skipping...');
      return;
    }
    
    console.log('Initializing links store...');
    await get().fetchLinks();
  },
  
  // Clear store
  clear: () => set({
    links: [],
    isLoading: false,
    isInitialized: false,
    lastFetched: null
  }),
  
  // Update specific link
  updateLink: (linkId, updates) => set((state) => ({
    links: state.links.map(link =>
      link.id === linkId ? { ...link, ...updates } : link
    )
  })),
  
  // Remove link
  removeLink: (linkId) => set((state) => ({
    links: state.links.filter(link => link.id !== linkId)
  }))
}));

export { useLinksStore };
