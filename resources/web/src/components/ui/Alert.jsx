import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Alert = ({
  type = 'info', // 'success', 'error', 'warning', 'info'
  message,
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 5000, // 5 seconds for success/info, 10 seconds for error/warning
  showProgress = true,
  className = ''
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);
  const [timer, setTimer] = useState(null);

  const alertDuration = type === 'error' || type === 'warning' ? 10000 : duration;

  useEffect(() => {
    setIsShowing(isVisible);

    if (isVisible && autoClose) {
      const newTimer = setTimeout(() => {
        handleClose();
      }, alertDuration);
      setTimer(newTimer);

      return () => {
        if (newTimer) {
          clearTimeout(newTimer);
        }
      };
    }
  }, [isVisible, autoClose, alertDuration]);

  const handleClose = () => {
    setIsShowing(false);
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    if (onClose) {
      onClose();
    }
  };

  const getAlertStyles = () => {
    const baseStyles = 'p-4 rounded-lg flex items-start space-x-3 transition-all duration-300';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border border-yellow-200 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0 mt-0.5";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      case 'info':
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getProgressBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-200';
      case 'error':
        return 'bg-red-200';
      case 'warning':
        return 'bg-yellow-200';
      case 'info':
      default:
        return 'bg-blue-200';
    }
  };

  const getCloseButtonColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400 hover:text-green-600';
      case 'error':
        return 'text-red-400 hover:text-red-600';
      case 'warning':
        return 'text-yellow-400 hover:text-yellow-600';
      case 'info':
      default:
        return 'text-blue-400 hover:text-blue-600';
    }
  };

  if (!isShowing) {
    return null;
  }

  return (
    <div className={`${getAlertStyles()} ${className}`}>
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm">{message}</p>
          <button
            onClick={handleClose}
            className={`${getCloseButtonColor()} transition-colors ml-4`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {showProgress && autoClose && (
          <div className={`mt-2 ${getProgressBgColor()} rounded-full h-1 overflow-hidden`}>
            <div 
              className={`h-full ${getProgressBarColor()} rounded-full`}
              style={{
                width: '100%',
                animation: `countdown ${alertDuration}ms linear forwards`
              }}
            ></div>
          </div>
        )}
      </div>

      {/* CSS Animation for countdown */}
      <style>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Alert;
