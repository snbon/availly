import React from 'react';

const ERROR_MESSAGES = {
  not_found: {
    title: 'Not Found',
    message: 'This availability link could not be found.'
  },
  server_error: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  },
  network_error: {
    title: 'Connection Error',
    message: 'Unable to connect. Please check your internet connection and try again.'
  }
};

const ErrorState = ({ error }) => {
  const errorInfo = ERROR_MESSAGES[error] || ERROR_MESSAGES.server_error;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{errorInfo.title}</h1>
        <p className="text-slate-600">{errorInfo.message}</p>
      </div>
    </div>
  );
};

export default ErrorState;
