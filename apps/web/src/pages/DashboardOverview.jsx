import React, { useEffect } from 'react';
import { Calendar, Users, Link as LinkIcon, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../stores/dashboardStore';
import { useStoreInitializer } from '../stores/storeInitializer';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import OverviewTab from '../components/dashboard/OverviewTab';

const DashboardOverview = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use Zustand store instead of local state
  const { 
    dashboardData, 
    isLoading, 
    isInitialized, 
    fetchDashboardData,
    initialize 
  } = useDashboardStore();

  const { areStoresReady } = useStoreInitializer();

  // Show loading until we have actual data, not just initialized stores
  const isPageLoading = isLoading || !dashboardData;

  const handleCopyLink = () => {
    const link = `https://availly.me/u/${dashboardData.userSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      console.log('Link copied to clipboard');
    });
  };

  const stats = [
    { 
      label: 'Total Views', 
      value: dashboardData.totalViews === 0 ? 'No data yet' : dashboardData.totalViews.toLocaleString(), 
      change: dashboardData.totalViews === 0 ? 'Share your link to start' : '+12%', 
      changeType: dashboardData.totalViews === 0 ? 'neutral' : 'positive',
      icon: Users, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Copy Link', 
      value: `availly.me/u/${dashboardData.userSlug}`, 
      change: dashboardData.hasAvailability ? 'Ready to share' : 'Set availability first', 
      changeType: dashboardData.hasAvailability ? 'positive' : 'warning',
      icon: LinkIcon, 
      color: dashboardData.hasAvailability ? 'green' : 'orange',
      bgColor: dashboardData.hasAvailability ? 'bg-green-50' : 'bg-orange-50',
      iconColor: dashboardData.hasAvailability ? 'text-green-600' : 'text-orange-600',
      isClickable: dashboardData.hasAvailability,
      onClick: dashboardData.hasAvailability ? handleCopyLink : () => navigate('/onboarding')
    },
    { 
      label: 'This Week', 
      value: dashboardData.thisWeekEvents === 0 ? '0 events' : `${dashboardData.thisWeekEvents} events this week`, 
      change: dashboardData.thisWeekEvents === 0 ? 'No events this week' : `${dashboardData.thisWeekEvents} events`, 
      changeType: dashboardData.thisWeekEvents === 0 ? 'neutral' : 'positive',
      icon: CalendarDays, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard' },
    { id: 'availability', label: 'Availability', icon: Calendar, path: '/availability' },
    { id: 'links', label: 'Links', icon: LinkIcon, path: '/links' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
  ];

  const handleSettingsClick = () => {
            navigate('/app/settings');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabChange = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <div className={`min-h-screen ${brandGradients.background} relative`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/5 rounded-full blur-3xl"></div>
      </div>
      
      <DashboardHeader user={user} onLogout={handleLogout} onSettingsClick={handleSettingsClick} />
      <NavigationTabs tabs={tabs} activeTab="overview" onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPageLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <OverviewTab user={user} stats={stats} />
        )}
      </main>
    </div>
  );
};

export default DashboardOverview;
