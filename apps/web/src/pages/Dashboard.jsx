import React, { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('availability');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'availability', label: 'Availability Rules' },
                { id: 'exceptions', label: 'Exceptions' },
                { id: 'calendars', label: 'Calendar Connections' },
                { id: 'links', label: 'Links & Sharing' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'availability' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="grid grid-cols-7 gap-2">
                      <div className="text-sm text-gray-500 py-1">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      {Array.from({ length: 7 }, (_, day) => (
                        <div
                          key={day}
                          className="h-8 border border-gray-200 rounded cursor-pointer hover:bg-blue-50"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'exceptions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Exceptions</h3>
                <p className="text-gray-500">No exceptions configured yet.</p>
              </div>
            )}

            {activeTab === 'calendars' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar Connections</h3>
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700">
                    Connect Google Calendar
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700">
                    Connect Microsoft Calendar
                  </button>
                  <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700">
                    Add Apple ICS URL
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Links & Sharing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., john-doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Generate One-Time Link
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">42</div>
                    <div className="text-sm text-blue-600">Total Views</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-green-600">Views This Week</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2h ago</div>
                    <div className="text-sm text-purple-600">Last Viewed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
