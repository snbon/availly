import React, { useState } from 'react';
import { Calendar, Clock, Users, Link as LinkIcon, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import OverviewTab from '../components/dashboard/OverviewTab';
import TabContent from '../components/dashboard/TabContent';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Total Views', 
      value: '1,234', 
      change: '+12%', 
      changeType: 'positive',
      icon: Users, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Active Links', 
      value: '5', 
      change: '+2', 
      changeType: 'positive',
      icon: LinkIcon, 
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      label: 'This Week', 
      value: '23', 
      change: '+8%', 
      changeType: 'positive',
      icon: CalendarDays, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      label: 'Avg. Response', 
      value: '2.4h', 
      change: '-0.5h', 
      changeType: 'negative',
      icon: Clock, 
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'New booking request', time: '2 hours ago', type: 'booking', user: 'John Doe', avatar: 'JD' },
    { id: 2, action: 'Link shared via email', time: '1 day ago', type: 'share', user: 'Sarah Wilson', avatar: 'SW' },
    { id: 3, action: 'Availability updated', time: '2 days ago', type: 'update', user: 'Mike Chen', avatar: 'MC' },
    { id: 4, action: 'Calendar connected', time: '1 week ago', type: 'connect', user: 'Emma Davis', avatar: 'ED' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

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
      
      <DashboardHeader user={user} onLogout={handleLogout} />
      <NavigationTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <OverviewTab user={user} stats={stats} recentActivity={recentActivity} />
        ) : (
          <TabContent activeTab={activeTab} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
