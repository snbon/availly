import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, RefreshCw, ExternalLink, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff, Check, Mail, Apple, HelpCircle, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AlertContainer } from '../ui';
import { useAlert } from '../../hooks/useAlert';
import AppleCalendarHelpModal from './AppleCalendarHelpModal';
import { api } from '../../services/api';

const CalendarSettings = () => {
  // Use the new alert system
  const { alerts, showSuccess, showError, removeAlert } = useAlert();
  
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);
  
  // Apple Calendar specific state
  const [showAppleHelpModal, setShowAppleHelpModal] = useState(false);
  const [showAppleConnectForm, setShowAppleConnectForm] = useState(false);
  const [appleCredentials, setAppleCredentials] = useState({
    apple_id: '',
    app_specific_password: ''
  });

  const [appleError, setAppleError] = useState(null);
  const [appleErrorTimer, setAppleErrorTimer] = useState(null);
  const [appleSuccess, setAppleSuccess] = useState(null);
  const [appleSuccessTimer, setAppleSuccessTimer] = useState(null);
  
  // Global success/error states for all providers
  const [globalSuccess, setGlobalSuccess] = useState(null);
  const [globalSuccessTimer, setGlobalSuccessTimer] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [globalErrorTimer, setGlobalErrorTimer] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (appleErrorTimer) {
        clearTimeout(appleErrorTimer);
      }
      if (appleSuccessTimer) {
        clearTimeout(appleSuccessTimer);
      }
      if (globalSuccessTimer) {
        clearTimeout(globalSuccessTimer);
      }
      if (globalErrorTimer) {
        clearTimeout(globalErrorTimer);
      }
    };
  }, [appleErrorTimer, appleSuccessTimer, globalSuccessTimer, globalErrorTimer]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/me/calendar/connections');
      setConnections(response.connections || []);
    } catch (error) {
      console.error('Failed to fetch calendar connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const response = await api.post('/me/calendar/google/connect');
      
      if (response.auth_url) {
        // Open Google OAuth in a new window
        const authWindow = window.open(
          response.auth_url,
          'google_auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Poll for window closure (user completed auth)
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            // Refresh connections after auth
            setTimeout(fetchConnections, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initiate Google Calendar connection:', error);
      showError('Failed to connect Google Calendar. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Calendar? This will remove all cached events.')) {
      return;
    }

    try {
      await api.delete('/me/calendar/google/disconnect');
      await fetchConnections();
      showSuccess('Google Calendar disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
      showError('Failed to disconnect Google Calendar. Please try again.');
    }
  };

  const handleConnectMicrosoft = async () => {
    try {
      setIsConnecting(true);
      const response = await api.post('/me/calendar/microsoft/connect');
      
      if (response.auth_url) {
        // Open Microsoft OAuth in a new window
        const authWindow = window.open(
          response.auth_url,
          'microsoft_auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Poll for window closure (user completed auth)
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            // Refresh connections after auth
            setTimeout(fetchConnections, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initiate Microsoft Calendar connection:', error);
      showError('Failed to connect Microsoft Calendar. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    if (!confirm('Are you sure you want to disconnect your Microsoft Calendar? This will remove all cached events.')) {
      return;
    }

    try {
      await api.delete('/me/calendar/microsoft/disconnect');
      await fetchConnections();
      showSuccess('Microsoft Calendar disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect Microsoft Calendar:', error);
      showError('Failed to disconnect Microsoft Calendar. Please try again.');
    }
  };

  // Apple Calendar functions
  const handleShowAppleConnect = () => {
    setShowAppleConnectForm(true);
    setAppleCredentials({ apple_id: '', app_specific_password: '' });
    setAppleError(null); // Clear any existing errors
  };

  const showAppleError = (message) => {
    // Clear existing timer if any
    if (appleErrorTimer) {
      clearTimeout(appleErrorTimer);
    }
    
    setAppleError(message);
    
    // Set new timer to hide error after 10 seconds
    const timer = setTimeout(() => {
      setAppleError(null);
      setAppleErrorTimer(null);
    }, 10000);
    
    setAppleErrorTimer(timer);
  };

  const showAppleSuccess = (message) => {
    // Clear existing timer if any
    if (appleSuccessTimer) {
      clearTimeout(appleSuccessTimer);
    }
    
    setAppleSuccess(message);
    
    // Set new timer to hide success after 5 seconds
    const timer = setTimeout(() => {
      setAppleSuccess(null);
      setAppleSuccessTimer(null);
    }, 5000);
    
    setAppleSuccessTimer(timer);
  };

  const showGlobalSuccess = (message) => {
    // Clear existing timer if any
    if (globalSuccessTimer) {
      clearTimeout(globalSuccessTimer);
    }
    
    setGlobalSuccess(message);
    
    // Set new timer to hide success after 5 seconds
    const timer = setTimeout(() => {
      setGlobalSuccess(null);
      setGlobalSuccessTimer(null);
    }, 5000);
    
    setGlobalSuccessTimer(timer);
  };

  const showGlobalError = (message) => {
    // Clear existing timer if any
    if (globalErrorTimer) {
      clearTimeout(globalErrorTimer);
    }
    
    setGlobalError(message);
    
    // Set new timer to hide error after 10 seconds
    const timer = setTimeout(() => {
      setGlobalError(null);
      setGlobalErrorTimer(null);
    }, 10000);
    
    setGlobalErrorTimer(timer);
  };



  const handleConnectApple = async () => {
    if (!appleCredentials.apple_id || !appleCredentials.app_specific_password) {
      showAppleError('Please enter both Apple ID and app-specific password.');
      return;
    }

    try {
      setIsConnecting(true);
      setAppleError(null); // Clear any existing errors
      const response = await api.post('/me/calendar/apple/connect', appleCredentials);
      
      if (response.connection) {
        showAppleSuccess('Apple Calendar connected successfully!');
        setShowAppleConnectForm(false);
        setAppleCredentials({ apple_id: '', app_specific_password: '' });
        setAppleError(null); // Clear any existing errors
        await fetchConnections();
      }
    } catch (error) {
      console.error('Failed to connect Apple Calendar:', error);
      
      let errorMessage = 'Failed to connect Apple Calendar. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid credentials. Please check your Apple ID and app-specific password.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Validation failed. Please check your input.';
      }
      
      showAppleError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectApple = async () => {
    if (!confirm('Are you sure you want to disconnect your Apple Calendar? This will remove all cached events.')) {
      return;
    }

    try {
      await api.delete('/me/calendar/apple/disconnect');
      await fetchConnections();
      showSuccess('Apple Calendar disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect Apple Calendar:', error);
      showError('Failed to disconnect Apple Calendar. Please try again.');
    }
  };

  const handleSyncCalendars = async () => {
    try {
      setIsSyncing(true);
      await api.post('/me/calendar/sync');
      
      // Show success state
      setSyncCompleted(true);
      setIsSyncing(false);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSyncCompleted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to sync calendars:', error);
      showError('Failed to sync calendars. Please try again.');
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Connected';
      case 'expired':
        return 'Expired';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'expired':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'error':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const googleConnection = connections.find(conn => conn.provider === 'google');
  const microsoftConnection = connections.find(conn => conn.provider === 'microsoft');
  const appleConnection = connections.find(conn => conn.provider === 'apple');
  const hasActiveConnection = googleConnection?.status === 'active' || microsoftConnection?.status === 'active' || appleConnection?.status === 'active';

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
    <div className="space-y-6">
      {/* CSS Animation for countdown */}
      <style>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Alert Container */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
      
      {/* Header */}
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Calendar Integrations</h2>
            <p className="text-slate-600">
              Connect your calendars to automatically show busy times on your availability schedule.
            </p>
          </div>
          {hasActiveConnection && (
            <Button
              onClick={handleSyncCalendars}
              loading={isSyncing}
              variant={syncCompleted ? "success" : "secondary"}
              icon={syncCompleted ? Check : RefreshCw}
              disabled={syncCompleted}
            >
              {syncCompleted ? 'Sync Complete' : 'Sync Now'}
            </Button>
          )}
        </div>
      </Card>

      {/* Google Calendar Connection */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Google Calendar</h3>
              <p className="text-slate-600 text-sm mb-3">
                Sync your Google Calendar events to automatically block busy times.
              </p>
              
              {googleConnection && (
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(googleConnection.status)}`}>
                    {getStatusIcon(googleConnection.status)}
                    <span className="ml-2">{getStatusText(googleConnection.status)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Connected {new Date(googleConnection.connected_at).toLocaleDateString()}
                  </div>
                  {googleConnection.calendars_count > 0 && (
                    <div className="text-xs text-slate-500">
                      {googleConnection.included_calendars_count} of {googleConnection.calendars_count} calendars included
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {hasActiveConnection ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    // TODO: Open calendar selection modal
                    showSuccess('Calendar selection coming soon! All calendars are currently included by default.');
                  }}
                >
                  Manage Calendars
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDisconnectGoogle}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectGoogle}
                loading={isConnecting}
                icon={Plus}
              >
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Microsoft Calendar Connection */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Microsoft Outlook</h3>
              <p className="text-slate-600 text-sm mb-3">
                Sync your Microsoft Outlook calendar events to automatically block busy times.
              </p>
              
              {microsoftConnection && (
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(microsoftConnection.status)}`}>
                    {getStatusIcon(microsoftConnection.status)}
                    <span className="ml-2">{getStatusText(microsoftConnection.status)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Connected {new Date(microsoftConnection.connected_at).toLocaleDateString()}
                  </div>
                  {microsoftConnection.calendars_count > 0 && (
                    <div className="text-xs text-slate-500">
                      {microsoftConnection.included_calendars_count} of {microsoftConnection.calendars_count} calendars included
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {microsoftConnection?.status === 'active' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    // TODO: Open calendar selection modal
                    showSuccess('Calendar selection coming soon! All calendars are currently included by default.');
                  }}
                >
                  Manage Calendars
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDisconnectMicrosoft}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectMicrosoft}
                loading={isConnecting}
                icon={Plus}
                disabled={true}
              >
                Coming Soon 
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Apple Calendar Connection */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Apple Calendar</h3>
              <p className="text-slate-600 text-sm mb-3">
                Sync your Apple iCloud calendar events to automatically block busy times.
              </p>
              
              {appleConnection && (
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appleConnection.status)}`}>
                    {getStatusIcon(appleConnection.status)}
                    <span className="ml-2">{getStatusText(appleConnection.status)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Connected {new Date(appleConnection.connected_at).toLocaleDateString()}
                  </div>
                  {appleConnection.calendars_count > 0 && (
                    <div className="text-xs text-slate-500">
                      {appleConnection.included_calendars_count} of {appleConnection.calendars_count} calendars included
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {appleConnection?.status === 'active' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    // TODO: Open calendar selection modal
                    showSuccess('Calendar selection coming soon! All calendars are currently included by default.');
                  }}
                >
                  Manage Calendars
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDisconnectApple}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAppleHelpModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How to connect</span>
                </button>
                <Button
                  onClick={handleShowAppleConnect}
                  loading={isConnecting}
                  icon={Plus}
                >
                  Connect Apple Calendar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Apple Connection Form */}
        {showAppleConnectForm && !appleConnection && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900">Connect Apple Calendar</h4>
              <button
                onClick={() => setShowAppleConnectForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apple ID Email
                </label>
                <Input
                  type="email"
                  placeholder="your-apple-id@icloud.com"
                  value={appleCredentials.apple_id}
                  onChange={(e) => setAppleCredentials(prev => ({ ...prev, apple_id: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  App-Specific Password
                </label>
                <Input
                  type="password"
                  placeholder="abcd-efgh-ijkl-mnop"
                  value={appleCredentials.app_specific_password}
                  onChange={(e) => setAppleCredentials(prev => ({ ...prev, app_specific_password: e.target.value }))}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Need help generating this?{' '}
                  <button
                    onClick={() => setShowAppleHelpModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Click here for step-by-step guide
                  </button>
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleConnectApple}
                  loading={isConnecting}
                  size="sm"
                >
                  Connect Calendar
                </Button>
              </div>

              {/* Error Alert */}
              {appleError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-800">{appleError}</p>
                      <button
                        onClick={() => {
                          setAppleError(null);
                          if (appleErrorTimer) {
                            clearTimeout(appleErrorTimer);
                            setAppleErrorTimer(null);
                          }
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 bg-red-200 rounded-full h-1 overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: '100%',
                          animation: 'countdown 10s linear forwards'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {appleSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-800">{appleSuccess}</p>
                      <button
                        onClick={() => {
                          setAppleSuccess(null);
                          if (appleSuccessTimer) {
                            clearTimeout(appleSuccessTimer);
                            setAppleSuccessTimer(null);
                          }
                        }}
                        className="text-green-400 hover:text-green-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 bg-green-200 rounded-full h-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: '100%',
                          animation: 'countdown 5s linear forwards'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Connection Status Info */}
      {hasActiveConnection && (
        <Card padding="lg">
          <div className="flex items-start space-x-3">
            <Wifi className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Calendar{hasActiveConnection && (googleConnection?.status === 'active' && microsoftConnection?.status === 'active') ? 's' : ''} Connected
              </h4>
              <p className="text-sm text-green-700 mb-3">
                Your calendar events are being synced automatically. Events will appear as busy time blocks 
                in your availability schedule, and will be visible with titles in your dashboard calendar view.
              </p>
              <div className="text-xs text-green-600">
                • Events sync in real-time via webhooks<br/>
                • Backup sync runs every 15 minutes<br/>
                • Only busy/free time is stored, no event details are shared publicly
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No Connections State */}
      {connections.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Calendar Connections</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Connect your Google Calendar to automatically show busy times and prevent double bookings.
            </p>
            <Button
              onClick={handleConnectGoogle}
              loading={isConnecting}
              icon={Plus}
            >
              Connect Your First Calendar
            </Button>
          </div>
        </Card>
      )}

      {/* Coming Soon - Other Providers */}
      <Card padding="lg">
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">More Integrations Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            We're working on adding support for more calendar services and productivity tools.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
            <span>• Office 365</span>
            <span>• Exchange</span>
            <span>• Custom CalDAV</span>
          </div>
        </div>
      </Card>

      {/* Apple Calendar Help Modal */}
      <AppleCalendarHelpModal
        isOpen={showAppleHelpModal}
        onClose={() => setShowAppleHelpModal(false)}
      />
    </div>
  );
};

export default CalendarSettings;
