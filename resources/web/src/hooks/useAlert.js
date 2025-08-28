import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      type,
      message,
      isVisible: true,
      ...options
    };

    setAlerts(prev => [...prev, alert]);

    // Auto-remove after duration if autoClose is enabled (default: true)
    if (options.autoClose !== false) {
      const duration = type === 'error' || type === 'warning' ? 10000 : (options.duration || 5000);
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return showAlert('success', message, options);
  }, [showAlert]);

  const showError = useCallback((message, options = {}) => {
    return showAlert('error', message, options);
  }, [showAlert]);

  const showWarning = useCallback((message, options = {}) => {
    return showAlert('warning', message, options);
  }, [showAlert]);

  const showInfo = useCallback((message, options = {}) => {
    return showAlert('info', message, options);
  }, [showAlert]);

  return {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts
  };
};
