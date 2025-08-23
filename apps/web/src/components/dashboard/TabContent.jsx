import React, { useState, useEffect } from 'react';
import { Calendar, Link as LinkIcon, BarChart3, Filter, Copy, RefreshCw, Check, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import EmptyState from './EmptyState';
import { api } from '../../services/api';

const TabHeader = ({ title, description, buttonText, onButtonClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600 mt-2">{description}</p>
      </div>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

const AvailabilityTab = () => {
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // Handle both HH:MM:SS and HH:MM formats
    const time = timeString.split(':').slice(0, 2).join(':');
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const groupRulesByDay = (rules) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    
    days.forEach((day, index) => {
      grouped[day] = rules.filter(rule => rule.weekday === index);
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Card>
    );
  }

  const groupedRules = groupRulesByDay(availabilityRules);
  const hasRules = availabilityRules.length > 0;

  return (
    <Card padding="lg">
      <TabHeader
        title="Availability Settings"
        description="Your weekly availability schedule"
        buttonText="Edit Schedule"
        onButtonClick={() => {
          // TODO: Open availability editor modal
          alert('Availability editor coming soon! For now, update your schedule during onboarding.');
        }}
      />
      
      {!hasRules ? (
        <EmptyState
          icon={Calendar}
          title="No availability rules set"
          description="Complete your onboarding to set your availability schedule"
          buttonText="Go to Onboarding"
          onButtonClick={() => {
            window.location.href = '/onboarding';
          }}
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
  );
};

const LinksTab = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailText, setEmailText] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/me/profile');
      setProfile(response.profile);
      setUsername(response.profile.username || '');
      
      // Set default email text if username exists
      if (response.profile.username) {
        setEmailText(`You can view my availability in the following link: https://myfreeslots.me/${response.profile.username}`);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUsername = (value) => {
    if (!value) {
      return 'Username is required';
    }
    if (value.length < 4) {
      return 'Username must be at least 4 characters';
    }
    if (value.length > 15) {
      return 'Username must be no more than 15 characters';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and hyphens';
    }
    return '';
  };

  const checkUsernameAvailability = async (value) => {
    if (!value || value === profile?.username) return;
    
    try {
      const response = await api.post('/me/profile/check-username', { username: value });
      if (!response.available) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Failed to check username:', error);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    const error = validateUsername(value);
    setUsernameError(error);
    
    if (!error && value !== profile?.username) {
      // Debounce the availability check
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSaveUsername = async () => {
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/me/profile/username', { username });
      setProfile(response.profile);
      
      // Update email text with new username
      setEmailText(`You can view my availability in the following link: https://myfreeslots.me/${username}`);
      
      alert('Username updated successfully!');
    } catch (error) {
      if (error.data?.error) {
        setUsernameError(error.data.error);
      } else if (error.data?.message) {
        setUsernameError(error.data.message);
      } else {
        alert('Failed to update username. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const generateNewEmailText = async () => {
    if (!profile?.username) {
      alert('Please set a username first');
      return;
    }

    try {
      setIsGeneratingText(true);
      const response = await api.post('/me/profile/generate-email-text', {
        context: 'professional meeting scheduling'
      });
      
      if (response.success) {
        setEmailText(response.text);
      } else {
        setEmailText(response.default);
        if (response.error) {
          alert(`Using default text: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate email text:', error);
      // Fallback to default
      setEmailText(`You can view my availability in the following link: https://myfreeslots.me/${profile.username}`);
      alert('Failed to generate custom text, using default.');
    } finally {
      setIsGeneratingText(false);
    }
  };

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <TabHeader
        title="Your Link"
        description="Set your username and share your availability link"
      />
      
      <div className="space-y-8">
        {/* Username Setting Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter username (4-15 characters)"
                  className={usernameError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {usernameError}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSaveUsername}
                disabled={isSaving || !!usernameError || !username || username === profile?.username}
                loading={isSaving}
              >
                {profile?.username ? 'Update' : 'Set'} Username
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Only letters, numbers, and hyphens allowed. 
              {profile?.can_change_username === false && (
                <span className="text-amber-600">
                  {' '}Can be changed again in {profile.days_until_change} days.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Link Display Section */}
        {profile?.username && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Availability Link
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <code className="text-sm text-slate-800">
                    https://myfreeslots.me/{profile.username}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(`https://myfreeslots.me/${profile.username}`, setCopied)}
                  icon={copied ? Check : Copy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Email Text Generator Section */}
        {profile?.username && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Email Text Template
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={generateNewEmailText}
                disabled={isGeneratingText}
                icon={RefreshCw}
                loading={isGeneratingText}
              >
                Generate New Text
              </Button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {emailText}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(emailText, setEmailCopied)}
                icon={emailCopied ? Check : Copy}
                className="w-full sm:w-auto"
              >
                {emailCopied ? 'Text Copied!' : 'Copy Email Text'}
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!profile?.username && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Get Started</h4>
            <p className="text-sm text-blue-700">
              Set your unique username to create your personalized availability link. 
              Once set, you can share this link with anyone who needs to schedule time with you.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

const AnalyticsTab = () => {
  return (
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
  );
};

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'availability':
      return <AvailabilityTab />;
    case 'links':
      return <LinksTab />;
    case 'analytics':
      return <AnalyticsTab />;
    default:
      return null;
  }
};

export default TabContent;
