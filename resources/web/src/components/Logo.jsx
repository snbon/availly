import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Logo = ({ size = 'md', showText = true, variant = 'default' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogoClick = () => {
    // If we're on landing page or legal pages, go to root
    if (location.pathname === '/' || 
        location.pathname === '/privacypolicy' || 
        location.pathname === '/termsofservice') {
      window.location.href = 'https://availly.me';
    } else {
      // If we're in the app, go to dashboard
      navigate('/app/dashboard');
    }
  };
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xl' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-2xl' },
    xl: { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-3xl' }
  };

  const variants = {
    default: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600',
    light: 'bg-white border-2 border-purple-200',
    dark: 'bg-gradient-to-br from-purple-800 via-indigo-800 to-blue-800'
  };

  const iconColor = variant === 'light' ? 'text-purple-600' : 'text-white';
  const textColor = variant === 'light' ? 'text-purple-900' : 'text-slate-900';

  return (
    <div 
      className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleLogoClick}
    >
      <div className={`${sizes[size].container} ${variants[variant]} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group`}>
        {/* Sparkle effect */}
        <div className="absolute inset-0 opacity-20">
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white animate-pulse" />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
        </div>
        
        {/* Main icon */}
        <Calendar className={`${sizes[size].icon} ${iconColor} relative z-10 group-hover:scale-110 transition-transform duration-200`} />
        
        {/* Clock overlay */}
        <Clock className={`absolute ${sizes[size].icon} ${iconColor} opacity-30 rotate-12 group-hover:rotate-45 transition-transform duration-300`} />
      </div>
      
      {showText && (
        <div>
          <h1 className={`${sizes[size].text} font-bold ${textColor} tracking-tight`}>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Availly</span>
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-sm text-slate-600 font-medium">Calendar Management</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Logo;
