import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TimezoneSelector from './TimezoneSelector';
import { api } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSettings = () => {
  const { showAlert } = useAlert();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    timezone: 'Europe/Brussels'
  });

  useEffect(() => {
    if (user) {
      console.log('ProfileSettings: Using user from AuthContext:', user);
      setUserData({
        name: user.name || '',
        email: user.email || '',
        timezone: user.timezone || 'Europe/Brussels'
      });
    } else {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      // Add cache-busting parameter to ensure fresh data
      const response = await api.get(`/me?t=${Date.now()}`);
      console.log('User data response:', response.data);
      
      const newUserData = {
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        timezone: response.data.user.timezone || 'Europe/Brussels'
      };
      
      console.log('Setting user data:', newUserData);
      setUserData(newUserData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      showAlert('error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    console.log('=== TIMEZONE UPDATE DEBUG ===');
    console.log('Saving timezone:', userData.timezone);
    
    try {
      const response = await api.put('/me/profile', {
        timezone: userData.timezone
      });
      console.log('Update response:', response);
      
      showAlert('success', `Timezone updated to ${userData.timezone}!`);
      
      // Refresh AuthContext user data
      console.log('Refreshing AuthContext user data...');
      await refreshUser();
      console.log('AuthContext user data refreshed!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      console.error('Error response:', error.response?.data);
      showAlert('error', `Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h2>
          <p className="text-slate-600">
            Update your personal information and account preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  icon={User}
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  icon={Mail}
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Timezone Settings</h3>
            <div className="max-w-md">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">Current Timezone:</p>
                <p className="text-lg font-semibold text-blue-700">{userData.timezone || 'Not set'}</p>
              </div>
              
              <TimezoneSelector
                value={userData.timezone}
                onChange={(value) => handleInputChange('timezone', value)}
                label="Your Timezone"
              />
              <p className="text-sm text-slate-500 mt-2">
                This timezone will be used for displaying your availability and syncing with calendar events.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Coming Soon Notice */}
      <Card padding="lg">
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Profile Settings Coming Soon</h3>
          <p className="text-slate-600">
            We're working on adding comprehensive profile management features.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
