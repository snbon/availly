import React, { useState, useEffect } from 'react';
import { Calendar, Link as LinkIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AvailabilityModal from '../components/dashboard/AvailabilityModal';
import EmptyState from '../components/dashboard/EmptyState';
import { AlertContainer } from '../components/ui';
import { useAlert } from '../hooks/useAlert';
import { api } from '../services/api';

const AvailabilityPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { alerts, showInfo, removeAlert } = useAlert();
  
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard' },
    { id: 'availability', label: 'Availability', icon: Calendar, path: '/availability' },
    { id: 'links', label: 'Links', icon: LinkIcon, path: '/links' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
  ];

  useEffect(() => {
    fetchAvailabilityRules();
  }, []);

  const fetchAvailabilityRules = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/me/availability-rules');
      setAvailabilityRules(response.rules);
    } catch (error) {
      console.error('Failed to fetch availability rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = timeString.split(':').slice(0, 2).join(':');
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const groupRulesByDay = (rules) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = {};
    
    days.forEach((day, index) => {
      // API weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday
      grouped[day] = rules.filter(rule => rule.weekday === index);
    });
    
    return grouped;
  };

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

  const groupedRules = groupRulesByDay(availabilityRules);
  const hasRules = availabilityRules.length > 0;

  return (
    <div className={`min-h-screen ${brandGradients.background} relative`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/5 rounded-full blur-3xl"></div>
      </div>
      
      <DashboardHeader user={user} onLogout={handleLogout} onSettingsClick={handleSettingsClick} />
      <NavigationTabs tabs={tabs} activeTab="availability" onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading availability...</p>
            </div>
          </div>
        ) : (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Availability Settings</h3>
                <p className="text-slate-600 mt-2">Your weekly availability schedule</p>
              </div>
              <Button onClick={() => setShowModal(true)}>
                Edit Schedule
              </Button>
            </div>
          
            {!hasRules ? (
            <EmptyState
              icon={Calendar}
              title="No availability rules set"
              description="Complete your onboarding to set your availability schedule"
              buttonText="Go to Onboarding"
              onButtonClick={() => navigate('/onboarding')}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRules).map(([day, rules]) => (
                <div key={day} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">{day}</h4>
                    {rules.length === 0 && (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
                  </div>
                  
                  {rules.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-900">
                              {formatTime(rule.start_time_local)} - {formatTime(rule.end_time_local)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Schedule Overview
                    </h4>
                    <p className="text-sm text-blue-700">
                      You have {availabilityRules.length} availability {availabilityRules.length === 1 ? 'slot' : 'slots'} set across your week. 
                      Visitors can book time during these available hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
                      )}
          </Card>
        )}
        
        <AvailabilityModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={fetchAvailabilityRules}
          initialRules={availabilityRules}
        />
      </main>
    </div>
  );
};

export default AvailabilityPage;
