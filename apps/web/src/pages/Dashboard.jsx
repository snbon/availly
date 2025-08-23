import React, { useState, useEffect } from 'react';
import { Calendar, Users, Link as LinkIcon, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import OverviewTab from '../components/dashboard/OverviewTab';
import TabContent from '../components/dashboard/TabContent';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalViews: 0,
    hasAvailability: false,
    thisWeekBookings: 0,
    userSlug: 'username'
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch availability rules to check if user has set availability
      const availabilityResponse = await api.getAvailabilityRules();
      const hasAvailability = (availabilityResponse.rules || []).length > 0;
      
      // For now, we'll use placeholder data for views and bookings
      // These would come from analytics endpoints when implemented
      setDashboardData({
        totalViews: 0, // TODO: Implement analytics API
        hasAvailability,
        thisWeekBookings: 0, // TODO: Implement bookings API
        userSlug: user?.email?.split('@')[0] || 'username' // Use email prefix as slug for now
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `https://Availly.me/${dashboardData.userSlug}`;
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
      value: `Availly.me/${dashboardData.userSlug}`, 
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
      value: dashboardData.thisWeekBookings === 0 ? 'No bookings yet' : dashboardData.thisWeekBookings.toString(), 
      change: dashboardData.thisWeekBookings === 0 ? 'Bookings will appear here' : '+8%', 
      changeType: dashboardData.thisWeekBookings === 0 ? 'neutral' : 'positive',
      icon: CalendarDays, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];



  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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

  return (
    <div className={`min-h-screen ${brandGradients.background} relative`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/5 rounded-full blur-3xl"></div>
      </div>
      
      <DashboardHeader user={user} onLogout={handleLogout} onSettingsClick={handleSettingsClick} />
      <NavigationTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
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
