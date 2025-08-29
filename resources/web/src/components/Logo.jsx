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
  
  // Responsive sizing - mobile-first approach with smaller mobile sizes
  const sizes = {
    sm: { 
      container: 'w-5 h-5 sm:w-8 sm:h-8', 
      icon: 'w-2.5 h-2.5 sm:w-4 sm:h-4', 
      text: 'text-xs sm:text-sm' 
    },
    md: { 
      container: 'w-6 h-6 sm:w-12 sm:h-12', 
      icon: 'w-3 h-3 sm:w-6 sm:h-6', 
      text: 'text-sm sm:text-xl' 
    },
    lg: { 
      container: 'w-8 h-8 sm:w-16 sm:h-16', 
      icon: 'w-4 h-4 sm:w-8 sm:h-8', 
      text: 'text-base sm:text-2xl' 
    },
    xl: { 
      container: 'w-12 h-12 sm:w-20 sm:h-20', 
      icon: 'w-6 h-6 sm:w-10 sm:h-10', 
      text: 'text-lg sm:text-3xl' 
    }
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
      className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleLogoClick}
    >
      <div className={`${sizes[size].container} ${variants[variant]} rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group`}>
        {/* Sparkle effect */}
        <div className="absolute inset-0 opacity-20">
          <Sparkles className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-3 sm:h-3 text-white animate-pulse" />
          <div className="absolute bottom-1 left-1 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-ping"></div>
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
          {(size === 'lg' || size === 'xl') && (
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Calendar Management</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
