import { useDashboardStore } from '../stores/dashboardStore';
import { useAvailabilityStore } from '../stores/availabilityStore';
import { useLinksStore } from '../stores/linksStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

export const useDashboard = () => {
  const dashboardStore = useDashboardStore();
  const availabilityStore = useAvailabilityStore();
  const linksStore = useLinksStore();
  const analyticsStore = useAnalyticsStore();

  // Combined loading state
  const isLoading = 
    dashboardStore.isLoading || 
    availabilityStore.isLoading || 
    linksStore.isLoading || 
    analyticsStore.isLoading;

  // Combined initialization state
  const isInitialized = 
    dashboardStore.isInitialized && 
    availabilityStore.isInitialized && 
    linksStore.isInitialized && 
    analyticsStore.isInitialized;

  // Initialize all stores
  const initializeAll = async () => {
    await Promise.all([
      dashboardStore.initialize(),
      availabilityStore.initialize(),
      linksStore.initialize(),
      analyticsStore.initialize()
    ]);
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      dashboardStore.fetchDashboardData(true),
      availabilityStore.fetchAvailabilityRules(true),
      linksStore.fetchLinks(true),
      analyticsStore.fetchLinkAnalytics(true)
    ]);
  };

  return {
    // Dashboard data
    dashboardData: dashboardStore.dashboardData,
    
    // Availability data
    availabilityRules: availabilityStore.availabilityRules,
    exceptions: availabilityStore.exceptions,
    
    // Links data
    links: linksStore.links,
    
    // Analytics data
    linkAnalytics: analyticsStore.linkAnalytics,
    
    // States
    isLoading,
    isInitialized,
    
    // Actions
    initializeAll,
    refreshAll,
    
    // Individual store actions
    dashboard: dashboardStore,
    availability: availabilityStore,
    links: linksStore,
    analytics: analyticsStore
  };
};
