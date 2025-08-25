import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireVerification = true }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If verification is required but user is not verified
  if (requireVerification && isAuthenticated && user && !user.email_verified_at) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is authenticated and verified, but trying to access auth pages
  if (isAuthenticated && user && user.email_verified_at) {
    if (location.pathname === '/login' || location.pathname === '/register') {
              return <Navigate to="/app/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
