import React from 'react';
import { Bell, Settings, LogOut, Search } from 'lucide-react';
import Logo from '../Logo';
import { brandGradients, brandTypography, brandShadows, brandComponents } from '../../theme/brand';

const DashboardHeader = ({ user, onLogout }) => {
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`bg-white border-b border-slate-200/60 ${brandShadows.card}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <Logo />
            <div>
              <h1 className={`text-2xl ${brandTypography.heading} text-slate-900`}>MyFreeSlots</h1>
              <p className="text-slate-500 text-sm">Calendar Management Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className={`w-64 pl-10 pr-4 py-2 ${brandComponents.input.replace('w-full', '')}`}
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Settings className="w-6 h-6" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${brandGradients.primary} rounded-xl flex items-center justify-center ${brandShadows.button}`}>
                <span className="text-white text-sm font-semibold">
                  {getUserInitials(user?.name)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
