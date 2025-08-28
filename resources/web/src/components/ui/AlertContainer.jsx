import React from 'react';
import Alert from './Alert';

const AlertContainer = ({ alerts, onRemoveAlert, className = '' }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => onRemoveAlert(alert.id)}
          autoClose={alert.autoClose}
          duration={alert.duration}
          showProgress={alert.showProgress}
        />
      ))}
    </div>
  );
};

export default AlertContainer;
