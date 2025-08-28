import React, { useEffect } from 'react';
import { Calendar, Link as LinkIcon, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useStoreInitializer } from '../stores/storeInitializer';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/dashboard/EmptyState';

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Use Zustand store for analytics data
  const { 
    linkAnalytics, 
    isLoading, 
    isInitialized, 
    initialize 
  } = useAnalyticsStore();

  const { areStoresReady } = useStoreInitializer();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard' },
    { id: 'availability', label: 'Availability', icon: Calendar, path: '/availability' },
    { id: 'links', label: 'Links', icon: LinkIcon, path: '/links' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
  ];

  // Show loading until we have actual analytics data
  const isPageLoading = isLoading || !isInitialized;

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
      <NavigationTabs tabs={tabs} activeTab="analytics" onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPageLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <Card padding="lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Analytics</h3>
              <p className="text-slate-600 mt-2">View insights about your calendar usage</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" icon={Filter}>
                Filter
              </Button>
              <select className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          
          <EmptyState
            icon={BarChart3}
            title="No analytics data yet"
            description="Start sharing your calendar to see analytics and insights"
          />
        </Card>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
