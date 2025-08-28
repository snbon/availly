import React from 'react';
import { Calendar } from 'lucide-react';
import { brandGradients, brandShadows } from '../../theme/brand';

const WelcomeBanner = ({ user }) => {
  return (
    <div className={`${brandGradients.primary} rounded-3xl p-8 text-white ${brandShadows.card}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h2>
          <p className="text-purple-100 text-lg">
            Here's what's happening with your calendar today.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
