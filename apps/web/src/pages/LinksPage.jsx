import React, { useState, useEffect } from 'react';
import { Calendar, Link as LinkIcon, TrendingUp, BarChart3, Copy, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { brandGradients } from '../theme/brand';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NavigationTabs from '../components/dashboard/NavigationTabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AlertContainer } from '../components/ui';
import { useAlert } from '../hooks/useAlert';
import { api } from '../services/api';

const LinksPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { alerts, showSuccess, showError, showInfo, removeAlert } = useAlert();
  
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailText, setEmailText] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/dashboard' },
    { id: 'availability', label: 'Availability', icon: Calendar, path: '/availability' },
    { id: 'links', label: 'Links', icon: LinkIcon, path: '/links' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
  ];

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
        setEmailText(`You can view my availability in the following link: https://availly.me/u/${response.profile.username}`);
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
      setEmailText(`You can view my availability in the following link: https://availly.me/u/${username}`);
      
      showSuccess('Username updated successfully!');
    } catch (error) {
      if (error.data?.error) {
        setUsernameError(error.data.error);
      } else if (error.data?.message) {
        setUsernameError(error.data.message);
      } else {
        showError('Failed to update username. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const generateNewEmailText = async () => {
    if (!profile?.username) {
      showInfo('Please set a username first');
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
          showInfo(`Using default text: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate email text:', error);
      // Fallback to default
      setEmailText(`You can view my availability in the following link: https://availly.me/u/${profile.username}`);
      showError('Failed to generate custom text, using default.');
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
      <NavigationTabs tabs={tabs} activeTab="links" onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading profile...</p>
            </div>
          </div>
        ) : (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Your Link</h3>
                <p className="text-slate-600 mt-2">Set your username and share your availability link</p>
              </div>
            </div>
          
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
                          https://availly.me/u/{profile.username}
                        </code>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(`https://availly.me/u/${profile.username}`, setCopied)}
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
        )}
      </main>
    </div>
  );
};

export default LinksPage;
