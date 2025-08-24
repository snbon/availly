import React, { useState, useEffect } from 'react';
import { Calendar, Users, Link as LinkIcon, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import OverviewTab from '../components/dashboard/OverviewTab';
import TabContent from '../components/dashboard/TabContent';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current route
  const getActiveTabFromRoute = () => {
    const path = location.pathname;
    if (path === '/availability') return 'availability';
    if (path === '/links') return 'links';
    if (path === '/analytics') return 'analytics';
    return 'overview'; // default for /dashboard
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromRoute());
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalViews: 0,
    hasAvailability: false,
    thisWeekEvents: 0,
    userSlug: 'username'
  });
  
  const { user, logout } = useAuth();

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTabFromRoute());
  }, [location.pathname]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Set initial user slug from context immediately for instant display
    const initialUserSlug = user?.email?.split('@')[0] || 'username';
    
    // Show data immediately - don't wait for API
    setDashboardData({
      totalViews: 0,
      hasAvailability: false,
      thisWeekEvents: 0,
      userSlug: initialUserSlug
    });
    setIsLoading(false); // Stop loading immediately
    
    // Fetch data in background and update when ready
    try {
      const response = await api.get('/me/dashboard/stats');
      const stats = response.stats;
      
      // Update with real data when available
      setDashboardData({
        totalViews: stats.total_views || 0,
        hasAvailability: stats.has_availability || false,
        thisWeekEvents: stats.this_week_events || 0,
        userSlug: stats.user_slug || initialUserSlug
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Keep initial data on error - UI already shown
    }
  };

  const handleCopyLink = () => {
    const link = `https://availly.me/u/${dashboardData.userSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      // Could show a toast notification here
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
    navigate('/settings');
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
      <NavigationTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <OverviewTab user={user} stats={stats} />
        ) : (
          <TabContent activeTab={activeTab} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
