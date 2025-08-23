import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, RefreshCw, ExternalLink, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { api } from '../../services/api';

const CalendarSettings = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

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
      alert('Failed to connect Google Calendar. Please try again.');
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
      alert('Google Calendar disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
      alert('Failed to disconnect Google Calendar. Please try again.');
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
      alert('Failed to sync calendars. Please try again.');
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
  const hasActiveConnection = googleConnection?.status === 'active';

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
                    alert('Calendar selection coming soon! All calendars are currently included by default.');
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

      {/* Connection Status Info */}
      {hasActiveConnection && (
        <Card padding="lg">
          <div className="flex items-start space-x-3">
            <Wifi className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Google Calendar Connected
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
            We're working on adding support for Microsoft Outlook, Apple Calendar, and other popular calendar services.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
            <span>• Microsoft Outlook</span>
            <span>• Apple Calendar</span>
            <span>• CalDAV</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarSettings;
