import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brandGradients, brandTypography, brandShadows } from '../theme/brand';
import Logo from '../components/Logo';
import Card from '../components/ui/Card';
import { AlertContainer } from '../components/ui';
import { useAlert } from '../hooks/useAlert';


// Import settings components
import CalendarSettings from '../components/settings/CalendarSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('calendars');
  const { alerts, removeAlert } = useAlert();
  const navigate = useNavigate();

  const tabs = [
    { 
      id: 'calendars', 
      label: 'My Calendars', 
      icon: Calendar,
      description: 'Connect and manage your calendar integrations'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      description: 'Update your personal information and preferences'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Configure email and push notification settings'
    },
    { 
      id: 'privacy', 
      label: 'Privacy & Security', 
      icon: Shield,
      description: 'Manage your privacy and security preferences'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendars':
        return <CalendarSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return <CalendarSettings />;
    }
  };

  return (
    <div className={`min-h-screen ${brandGradients.background} relative`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className={`bg-white border-b border-slate-200/60 ${brandShadows.card} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Logo />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-indigo-900' : 'text-slate-900'
                        }`}>
                          {tab.label}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isActive ? 'text-indigo-700' : 'text-slate-500'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
