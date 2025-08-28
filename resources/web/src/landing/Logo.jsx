import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'md', showText = true, variant = 'default' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs sm:text-sm' },
    md: { container: 'w-10 h-10 sm:w-12 sm:h-12', icon: 'w-5 h-5 sm:w-6 sm:h-6', text: 'text-sm sm:text-xl' },
    lg: { container: 'w-12 h-12 sm:w-16 sm:h-16', icon: 'w-6 h-6 sm:w-8 sm:h-8', text: 'text-base sm:text-2xl' },
    xl: { container: 'w-16 h-16 sm:w-20 sm:h-20', icon: 'w-8 h-8 sm:w-10 sm:h-10', text: 'text-lg sm:text-3xl' }
  };

  const variants = {
    default: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600',
    light: 'bg-white border-2 border-purple-200',
    dark: 'bg-gradient-to-br from-purple-800 via-indigo-800 to-blue-800'
  };

  const iconColor = variant === 'light' ? 'text-purple-600' : 'text-white';
  const textColor = variant === 'light' ? 'text-purple-900' : 'text-slate-900';

  return (
    <div className="flex items-center space-x-3">
      <motion.div 
        className={`${sizes[size].container} ${variants[variant]} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Sparkle effect */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white" />
          </motion.div>
          <motion.div 
            className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        {/* Main icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar className={`${sizes[size].icon} ${iconColor} relative z-10`} />
        </motion.div>
        
        {/* Clock overlay */}
        <motion.div
          className="absolute"
          animate={{ rotate: [12, 45, 12] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Clock className={`${sizes[size].icon} ${iconColor} opacity-30`} />
        </motion.div>
      </motion.div>
      
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={`${sizes[size].text} font-bold ${textColor} tracking-tight`}>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Availly</span>
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-sm text-slate-600 font-medium">Calendar Management</p>
          ) : null}
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
